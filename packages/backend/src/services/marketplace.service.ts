// packages/backend/src/services/marketplace.service.ts
import { Database } from '../config/database.js';
import { MarketplaceAgent, Tool } from '../types/index.js';
import { RevenueService } from './revenue.service.js';
import {
  TransactionBuilder,
  Networks,
  Transaction,
  Keypair,
  Horizon
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export class MarketplaceService {
  private agents: Map<string, MarketplaceAgent>;
  private agentPurchases = new Map<string, Set<string>>(); // callerWallet → Set<agentId>
  private server: Horizon.Server;

  constructor() {
    this.agents = Database.loadMarketplaceAgents();
    this.server = new Horizon.Server(HORIZON_URL);
    console.log(`📦 Loaded ${this.agents.size} marketplace agents`);
  }

  registerAgent(data: Omit<MarketplaceAgent, 'id' | 'registeredAt' | 'healthStatus'>): string {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const agent: MarketplaceAgent = {
      ...data,
      id,
      tools: data.tools.map(t => ({
        ...t,
        price: String(t.price),
        currency: t.currency || 'XLM'
      })),
      registeredAt: Date.now(),
      healthStatus: 'unknown'
    };

    this.agents.set(id, agent);
    Database.saveMarketplaceAgents(this.agents);

    console.log(`🆕 Agent registered: ${agent.name} (${id})`);
    return id;
  }

  // LIST AGENTS
  listAgents(category?: string): Partial<MarketplaceAgent>[] {
    let list = Array.from(this.agents.values());
    if (category) list = list.filter(a => a.category === category);

    return list.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      wallet: a.wallet,
      tools: a.tools.map(t => ({
        name: t.name,
        description: t.description,
        price: t.price,
        currency: t.currency
      })),
      healthStatus: a.healthStatus,
      registeredAt: a.registeredAt
    }));
  }

  getAgent(id: string): MarketplaceAgent | undefined {
    return this.agents.get(id);
  }

  hasAccess(callerWallet: string, agentId: string): boolean {
    return this.agentPurchases.get(callerWallet)?.has(agentId) || false;
  }

  grantAccess(callerWallet: string, agentId: string) {
    if (!this.agentPurchases.has(callerWallet)) {
      this.agentPurchases.set(callerWallet, new Set());
    }
    this.agentPurchases.get(callerWallet)!.add(agentId);
    console.log(`💸 Access granted: ${callerWallet} → ${agentId}`);
  }

  async verifyPaymentSignature(
    signatureBase64: string,
    expectedSource: string,
    expectedDestination: string,  // Provider wallet
    expectedAmountStroops: string, // Full tool price
    _expectedMemo?: string
  ): Promise<boolean> {
    try {
      const tx = new Transaction(signatureBase64, Networks.TESTNET);

      // 1. Verify source wallet
      if (tx.source !== expectedSource) {
        console.log(`❌ Source mismatch: ${tx.source} != ${expectedSource}`);
        return false;
      }

      // 2. NEW: Handle multi-payment transactions (revenue split)
      const paymentOps = tx.operations.filter((op: any) => op.type === 'payment');

      if (paymentOps.length === 0) {
        console.log(`❌ No payment operations found`);
        return false;
      }

      // Calculate total amount sent to expected destination
      let totalToDestination = 0n;
      let totalAllPayments = 0n;

      for (const op of paymentOps) {
        if (op.type === 'payment') {
          const opAmountStroops = BigInt(Math.floor(parseFloat(op.amount) * 10_000_000));
          totalAllPayments += opAmountStroops;

          if (op.destination === expectedDestination) {
            totalToDestination += opAmountStroops;
          }
        }
      }

      // 3. Verify: Either provider got 60% OR total = full amount
      const expectedProviderShare = (BigInt(expectedAmountStroops) * 60n) / 100n;
      const isCorrectProviderShare = totalToDestination === expectedProviderShare;
      const isCorrectTotalAmount = totalAllPayments === BigInt(expectedAmountStroops);

      if (!isCorrectProviderShare && !isCorrectTotalAmount) {
        console.log(`❌ Amount mismatch`);
        console.log(`   Expected provider share (60%): ${expectedProviderShare}`);
        console.log(`   Expected total: ${expectedAmountStroops}`);
        console.log(`   Got to destination: ${totalToDestination}`);
        console.log(`   Total all payments: ${totalAllPayments}`);
        return false;
      }

      // 4. Verify signature is valid
      const sourceKeypair = Keypair.fromPublicKey(expectedSource);
      const hash = tx.hash();
      const validSig = tx.signatures.some((sig: any) => {
        try {
          return sourceKeypair.verify(hash, sig.signature());
        } catch {
          return false;
        }
      });

      if (!validSig) {
        console.log(`❌ Signature verification failed`);
        return false;
      }

      console.log(`✅ Payment verified (Provider: ${totalToDestination}, Total: ${totalAllPayments})`);
      return true;

    } catch (e: any) {
      console.error(`❌ Signature verification error: ${e.message}`);
      return false;
    }

  }

  async submitSignedPayment(signatureBase64: string): Promise<string> {
    try {

      const tx = new Transaction(signatureBase64, Networks.TESTNET);

      const result = await this.server.submitTransaction(tx);
      return result.hash;
    } catch (e: any) {
      console.error(`❌ Failed to submit signed payment: ${e.message}`);
      throw e;
    }
  }
  // EXECUTE TOOL LOGIC (mock implementation)
  executeTool(toolName: string, input: any): any {
    if (toolName === 'search_flights') {
      return {
        flights: [
          { id: 'GA001', airline: 'Garuda', price: '1.5M IDR', route: 'CGK-DPS', date: '2026-05-01' }
        ]
      };
    }
    if (toolName === 'analyze_crypto') {
      return { signal: 'BUY', confidence: 0.85, asset: 'BTC', price: '$65,000' };
    }
    return { message: `Tool ${toolName} executed successfully`, input };
  }

  clearAll() {
    this.agents.clear();
    this.agentPurchases.clear();
    Database.saveMarketplaceAgents(this.agents);
  }
}