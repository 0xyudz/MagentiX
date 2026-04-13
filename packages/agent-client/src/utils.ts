import { Keypair } from "@stellar/stellar-sdk";
import { X402PaymentMeta } from "./types.js";

/**
 * Sign a payload with Ed25519 (Stellar-native)
 * Compatible with @stellar/stellar-sdk v12
 */
export function signPayload(payload: Record<string, string>, secretKey: string): string {
  // Canonicalize: sort keys → stringify → encode to Uint8Array
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const messageBytes = new TextEncoder().encode(canonical);
  
  // Convert Uint8Array → Buffer (required by keypair.sign in SDK v12)
  const messageBuffer = Buffer.from(messageBytes);
  
  // Create keypair & sign
  const keypair = Keypair.fromSecret(secretKey);
  const signature = keypair.sign(messageBuffer); // Returns Buffer
  
  // Convert signature Buffer → base64 string
  return Buffer.from(signature).toString('base64');
}

/**
 * Build x402 HTTP headers from payment metadata
 */
export function buildX402Headers(
  meta: Omit<X402PaymentMeta, "nonce">, 
  nonce: string,
  secretKey: string
): Record<string, string> {
  const payload: Record<string, string> = {
    price: meta.price,
    asset: meta.asset,
    recipient: meta.recipient,
    nonce,
    network: meta.network,
  };
  
  const signature = signPayload(payload, secretKey);
  
  return {
    "Pay-Request": `price=${meta.price}&asset=${meta.asset}&recipient=${meta.recipient}&nonce=${nonce}`,
    "Authorization": `StellarEd25519 ${signature}`,
    "X402-Version": "0.3",
  };
}

/**
 * Parse x402 metadata from HTTP 402 response headers
 */
export function parseX402Meta(headers: Headers): X402PaymentMeta {
  const payRequired = headers.get("Pay-Required") || headers.get("pay-required");
  if (!payRequired) {
    throw new Error("Missing Pay-Required header in 402 response");
  }
  
  const params = new URLSearchParams(payRequired);
  return {
    price: params.get("price") || "",
    asset: params.get("asset") || "",
    recipient: params.get("recipient") || "",
    nonce: params.get("nonce") || crypto.randomUUID(),
    network: params.get("network") || "stellar:testnet",
    facilitator: params.get("facilitator") || undefined,
  };
}

/**
 * Generate unique nonce for idempotency
 */
export function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simple delay utility for retry logic
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}