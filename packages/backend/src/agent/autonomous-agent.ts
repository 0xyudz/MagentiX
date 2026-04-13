// packages/backend/src/agent/autonomous-agent.ts
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Horizon,
  Asset,
  Operation,
  Memo,
  Transaction
} from '@stellar/stellar-sdk';

export interface AgentConfig {
  strategy: string;
  budget: number;
  budgetStroops: bigint;
  intervalMs: number;
  runOnce: boolean;
}

export class AutonomousAgent {
  public isRunning = false;
  public logs: string[] = [];
  private totalSpentStroops = 0n;

  private config: AgentConfig = {
    strategy: 'trading',
    budget: 10,
    budgetStroops: 10n * 10_000_000n,
    intervalMs: 30000,
    runOnce: false
  };

  private keypair: Keypair;
  private server: Horizon.Server;
  private backendUrl: string;

  constructor(secret: string, backendUrl?: string) {
    this.keypair = Keypair.fromSecret(secret);
    this.server = new Horizon.Server('https://horizon-testnet.stellar.org');

    this.backendUrl = backendUrl
      || process.env.BACKEND_URL
      || 'https://magentix-app.onrender.com'
      || 'http://localhost:3000';

    console.log('========================================');
    console.log('🤖 AGENT INITIALIZED');
    console.log(`🔑 Wallet: ${this.keypair.publicKey()}`);
    console.log(`🔗 BACKEND_URL: ${this.backendUrl}`);
    console.log(`🌐 Will fetch marketplace from: ${this.backendUrl}/api/market/agents`);
    console.log('========================================');

    this.log(`🤖 Agent ready. Wallet: ${this.keypair.publicKey()}`);
  }

  private log(msg: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.push(`[${time}] ${msg}`);
    console.log(msg);
  }

  updateConfig(cfg: Partial<AgentConfig>) {
    if (cfg.budget !== undefined) {
      cfg.budgetStroops = BigInt(Math.floor(cfg.budget * 10_000_000));
    }
    this.config = { ...this.config, ...cfg };
    this.log(`🔧 Config: ${this.config.strategy}, budget=${this.config.budget}XLM, runOnce=${this.config.runOnce}`);
    if (!this.isRunning) this.start();
  }

  getStatus() {
    const spentXlm = Number(this.totalSpentStroops) / 10_000_000;
    return {
      publicKey: this.keypair.publicKey(),
      strategy: this.config.strategy,
      budget: this.config.budget,
      intervalMs: this.config.intervalMs,
      isRunning: this.isRunning,
      totalSpent: parseFloat(spentXlm.toFixed(4)),
      runOnce: this.config.runOnce
    };
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.log('🚀 Agent started.');
    this.loop();
  }

  stop() {
    this.isRunning = false;
    this.log('🛑 Stopped.');
  }

  setRunOnce(value: boolean) {
    this.config.runOnce = value;
    this.log(`🔧 runOnce: ${value ? 'ON (stop after 1 task)' : 'OFF (continuous)'}`);
  }

  private async loop() {
    while (this.isRunning) {
      try {
        const completed = await this.executeCycle();
        if (this.config.runOnce && completed) {
          this.log('✅ Task completed (runOnce). Stopping.');
          this.stop();
          break;
        }
      } catch (e: any) {
        this.log(`❌ Cycle error: ${e.message}`);
      }
      if (this.isRunning) {
        await new Promise(r => setTimeout(r, this.config.intervalMs));
      }
    }
  }

  private async executeCycle(): Promise<boolean> {
    const spentXlm = Number(this.totalSpentStroops) / 10_000_000;
    this.log(`🔄 Cycle: ${this.config.strategy} | Spent: ${spentXlm.toFixed(4)}/${this.config.budget} XLM`);

    if (this.totalSpentStroops >= this.config.budgetStroops) {
      this.log('💰 Budget exhausted.');
      this.stop();
      return false;
    }

    const category = this.getCategory(this.config.strategy);
    this.log(`🔍 Discovering agents for category: ${category}`);
    const agents = await this.discoverAgents(category);

    this.log(`📦 Found ${agents.length} agents in marketplace`);

    if (agents.length === 0) {
      this.log('⚠️ No agents found.');
      return false;
    }

    const target = agents[0];
    const tool = target.tools?.[0];
    if (!tool) return false;

    this.log(`🎯 Target: ${target.name}#${tool.name}`);

    // Execute tool with x402 payment flow
    await this.callToolWithPayment(target.id, tool.name, { query: 'auto' }, tool.price);

    // Track spending in stroops (no floating point errors)
    this.totalSpentStroops += BigInt(tool.price);
    const spentAfter = Number(this.totalSpentStroops) / 10_000_000;
    this.log(`✅ Success. Total Spent: $${spentAfter.toFixed(4)}`);

    if (this.totalSpentStroops >= this.config.budgetStroops) {
      this.log('💰 Budget exhausted after task.');
      this.stop();
    }

    return true;
  }

  private getCategory(strategy: string): string {
    return {
      trading: 'finance.crypto',
      travel: 'travel.flights',
      research: 'research.news'
    }[strategy] || 'general';
  }

  private async discoverAgents(category: string): Promise<any[]> {
    const url = `${this.backendUrl}/api/market/agents?category=${category}`;
    this.log(`🌐 Fetching: ${url}`);

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      });

      this.log(`📥 Marketplace response: ${res.status}`);

      if (!res.ok) {
        this.log(`❌ Fetch failed: ${res.status} ${res.statusText}`);
        return [];
      }

      const data = await res.json() as { agents?: any[] };
      const agents = data.agents || [];
      this.log(`✅ Parsed ${agents.length} agents from response`);
      return agents;

    } catch (error: any) {
      this.log(`❌ Fetch error: ${error.message}`);
      return [];
    }
  }

  // CORE: Call tool with x402 flow (402 → Sign → Submit → Retry → 200)
  private async callToolWithPayment(
    agentId: string,
    toolName: string,
    input: any,
    price: string
  ): Promise<any> {
    const url = `${this.backendUrl}/api/market/agents/${agentId}/tools/${toolName}/call`;
    const baseHeaders = {
      'Content-Type': 'application/json',
      'X-Agent-Wallet': this.keypair.publicKey()
    };
    const body = JSON.stringify({ input, callerWallet: this.keypair.publicKey() });

    this.log(`📤 Calling: ${url}`);

    // Step 1: Initial call WITHOUT payment signature
    let res = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body,
      signal: AbortSignal.timeout(15000)
    });

    this.log(`📥 Response: ${res.status}`);

    // Step 2: Handle 402 → Prepare & Submit payment
    if (res.status === 402) {
      const data = await res.json();
      const x402 = data.x402;
      const paymentReq = x402.accepts?.[0];

      if (!paymentReq) {
        throw new Error('Invalid x402: no payment requirements');
      }

      this.log(`💳 x402: ${x402.description}`);
      this.log(`🔐 Preparing signed payment...`);

      // 2a. Prepare signed payment
      const signedEnvelope = await this.prepareSignedPayment(
        paymentReq.payTo,
        paymentReq.amount,
        paymentReq.memo
      );

      // SUBMIT to Stellar Network
      this.log(`📡 Broadcasting payment to Stellar network...`);
      try {
        await this.submitSignedPayment(signedEnvelope);
      } catch (submitError: any) {
        this.log(`⚠️ Payment submission failed: ${submitError.message}`);
        this.log(`⚠️ Continuing anyway (backend might still accept signature)...`);
      }

      // 2c. RETRY with Payment-Signature header
      this.log(`🔄 Retrying with payment signature...`);

      const headersWithSig = {
        ...baseHeaders,
        'Payment-Signature': signedEnvelope
      };

      const bodyWithRef = JSON.stringify({
        input,
        callerWallet: this.keypair.publicKey(),
        x402_reference: paymentReq.memo
      });

      res = await fetch(url, {
        method: 'POST',
        headers: headersWithSig,
        body: bodyWithRef,
        signal: AbortSignal.timeout(15000)
      });

      this.log(`📥 Retry: ${res.status}`);
    }

    // Step 3: Handle final response
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
    }

    return res.json();
  }

  private async prepareSignedPayment(
    destination: string,        // Service provider wallet
    amountStroops: string,      // Total amount in stroops
    _memo?: string
  ): Promise<string> {
    try {
      this.log(`🔍 Loading account: ${this.keypair.publicKey()}`);

      const account = await this.server.loadAccount(this.keypair.publicKey());
      const totalAmountXlm = (Number(amountStroops) / 10_000_000).toFixed(7);

      // ✅ REVENUE SPLIT: 60% Provider / 40% Platform
      const totalStroops = BigInt(amountStroops);
      const providerShare = (totalStroops * 60n) / 100n;  // 60% ke provider
      const platformShare = totalStroops - providerShare;   // 40% ke platform

      const providerAmountXlm = (Number(providerShare) / 10_000_000).toFixed(7);
      const platformAmountXlm = (Number(platformShare) / 10_000_000).toFixed(7);

      if (parseFloat(totalAmountXlm) <= 0) {
        throw new Error(`Invalid amount: ${totalAmountXlm} XLM`);
      }

      this.log(`💰 Payment Split:`);
      this.log(`   • Provider (60%): ${providerAmountXlm} XLM → ${destination.slice(0, 10)}...`);
      this.log(`   • Platform (40%): ${platformAmountXlm} XLM → ${process.env.PLATFORM_WALLET?.slice(0, 10) || 'PLATFORM_WALLET'}...`);

      // Build transaction dengan MULTI-PAYMENT operations
      let txBuilder = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET
      });

      // Payment 1: 60% ke Service Provider
      txBuilder = txBuilder.addOperation(Operation.payment({
        destination,
        asset: Asset.native(),
        amount: providerAmountXlm
      }));

      // Payment 2: 40% ke Platform Wallet
      const platformWallet = process.env.PLATFORM_WALLET;
      if (platformWallet && platformWallet.startsWith('G')) {
        txBuilder = txBuilder.addOperation(Operation.payment({
          destination: platformWallet,
          asset: Asset.native(),
          amount: platformAmountXlm
        }));
        this.log(`✅ Revenue split enabled: 60/40`);
      } else {
        this.log(`⚠️ PLATFORM_WALLET not set. Sending 100% to provider.`);
      }

      const tx = txBuilder
        .setTimeout(30)
        .build();

      tx.sign(this.keypair);

      this.log(`✅ Payment signed successfully (Total: ${totalAmountXlm} XLM)`);
      return tx.toEnvelope().toXDR().toString('base64');

    } catch (error: any) {
      this.log(`❌ Payment preparation failed: ${error.message}`);
      throw new Error(`Payment preparation failed: ${error.message}`);
    }
  }

  private async submitSignedPayment(signedEnvelopeBase64: string): Promise<string> {
    try {
      this.log(`📤 Submitting transaction to Stellar network...`);

      const tx = new Transaction(signedEnvelopeBase64, Networks.TESTNET);
      const result = await this.server.submitTransaction(tx);

      this.log(`✅ Transaction submitted! Hash: ${result.hash.substring(0, 16)}...`);
      this.log(`🔗 View: https://stellar.expert/explorer/testnet/tx/${result.hash}`);

      return result.hash;

    } catch (e: any) {
      this.log(`❌ Transaction submission failed: ${e.message}`);

      // Log common issues
      if (e.message.includes('tx_insufficient_balance')) {
        this.log(`💡 Error: Insufficient XLM balance. Fund your wallet!`);
      } else if (e.message.includes('tx_bad_seq')) {
        this.log(`💡 Error: Bad sequence number. Will retry with fresh account...`);
      }

      throw new Error(`Failed to submit transaction: ${e.message}`);
    }
  }
}