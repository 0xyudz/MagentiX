import dotenv from "dotenv";
import { Keypair, SorobanRpc } from "@stellar/stellar-sdk";

import { 
  AgentConfig, 
  AgentResponse, 
  X402Discovery, 
  X402PaymentMeta, 
  X402Service 
} from "./types.js";
import { buildX402Headers, generateNonce, parseX402Meta, delay, signPayload } from "./utils.js";

dotenv.config();

export class X402AgentClient {
  private config: Required<AgentConfig>;
  private sorobanServer: SorobanRpc.Server;
  private usedNonces = new Set<string>();
  private keypair: Keypair;

  constructor(config: AgentConfig) {
    this.config = {
      secretKey: config.secretKey,
      network: config.network || "testnet",
      sorobanRpcUrl: config.sorobanRpcUrl || "https://soroban-testnet.stellar.org:443",
      facilitatorUrl: config.facilitatorUrl || "https://www.x402.org/facilitator",
      timeoutMs: config.timeoutMs || 30000,
    };
    
    this.keypair = Keypair.fromSecret(this.config.secretKey);
    this.sorobanServer = new SorobanRpc.Server(this.config.sorobanRpcUrl);
  }

  /**
   * Discover available paid services from a merchant
   */
  async discoverServices(baseUrl: string): Promise<X402Discovery> {
    const url = `${baseUrl.replace(/\/$/, "")}/.well-known/x402`;
    const response = await fetch(url, { 
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(this.config.timeoutMs)
    });
    
    if (!response.ok) {
      throw new Error(`Discovery failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<X402Discovery>;
  }

  /**
   * Call a paid endpoint with automatic x402 flow handling
   * 
   * Flow:
   * 1. Initial request → expect 402
   * 2. Parse payment metadata from headers
   * 3. Sign payload with Ed25519
   * 4. Retry with x402 headers
   * 5. Parse machine-readable JSON response
   */
  async callPaidEndpoint<T = any>(
    url: string,
    options?: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      headers?: Record<string, string>;
      maxRetries?: number;
    }
  ): Promise<AgentResponse<T>> {
    const method = options?.method || "GET";
    const maxRetries = options?.maxRetries || 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Step 1: Initial request (expect 402)
        const response = await fetch(url, {
          method,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: AbortSignal.timeout(this.config.timeoutMs),
        });

        // If not 402, return immediately (success or other error)
        if (response.status !== 402) {
          const json = await response.json() as AgentResponse<T>;
          return json;
        }

        // Step 2: Parse x402 payment metadata from 402 headers
        const paymentMeta = parseX402Meta(response.headers);
        
        // Step 3: Generate unique nonce + build payment headers
        const nonce = generateNonce();
        if (this.usedNonces.has(nonce)) continue;
        this.usedNonces.add(nonce);
        
        const paymentHeaders = buildX402Headers(
          { 
            price: paymentMeta.price, 
            asset: paymentMeta.asset, 
            recipient: paymentMeta.recipient, 
            network: paymentMeta.network 
          }, 
          nonce,
          this.config.secretKey
        );

        // Step 4: Retry request with payment proof
        const paidResponse = await fetch(url, {
          method,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...options?.headers,
            ...paymentHeaders,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: AbortSignal.timeout(this.config.timeoutMs),
        });

        if (!paidResponse.ok) {
          const error = await paidResponse.text();
          throw new Error(`Payment rejected: ${paidResponse.status} - ${error}`);
        }

        // Step 5: Parse and return machine-readable response
        const result = await paidResponse.json() as AgentResponse<T>;
        
        // Optional: Verify on-chain settlement (non-blocking)
        if (result.payment.tx_hash && result.payment.tx_hash !== "pending_facilitator_settlement") {
          this.verifyOnChain(result.payment.tx_hash, nonce).catch(console.warn);
        }
        
        return result;

      } catch (error) {
        if (attempt === maxRetries) throw error;
        await delay(1000 * (attempt + 1));
      }
    }
    
    throw new Error("Max retries exceeded");
  }

  /**
   * Verify payment settlement on-chain via Soroban RPC (non-blocking)
   */
  private async verifyOnChain(txHash: string, expectedNonce: string): Promise<boolean> {
    try {
      const tx = await this.sorobanServer.getTransaction(txHash);
      if (tx.status !== "SUCCESS") return false;
      console.log(`✅ On-chain verification: ${txHash}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ On-chain verification failed:`, error);
      return false;
    }
  }

  /**
   * Get agent's public key
   */
  getPublicKey(): string {
    return this.keypair.publicKey();
  }
}