import { Keypair } from '@stellar/stellar-sdk';
import { X402AgentClient } from './x402-client.js';
import dotenv from 'dotenv';

dotenv.config();

// backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

interface AgentConfig {
  secretKey: string;
  name: string;
  strategy: 'trading' | 'data-collection' | 'arbitrage';
  checkIntervalMs: number;
  maxBudgetPerDay: number;
}

interface ServiceDiscovery {
  path: string;
  price: string;
  asset: string;
  description: string;
}

/**
 * AUTONOMOUS AI AGENT
 * 
 * Features:
 * - Makes decisions independently
 * - Discovers and pays for services automatically
 * - Executes actions based on data
 * - Runs 24/7 without human intervention
 * - Tracks spending and stays within budget
 */
export class AutonomousAgent {
  private client: X402AgentClient;
  private config: AgentConfig;
  private isRunning: boolean = false;
  private totalSpent: number = 0;
  private dailyBudget: number;
  private keypair: Keypair;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new X402AgentClient({
      secretKey: config.secretKey,
      network: 'testnet',
    });
    this.keypair = Keypair.fromSecret(config.secretKey);
    this.dailyBudget = config.maxBudgetPerDay;
    
    console.log(`🤖 Autonomous Agent "${config.name}" initialized`);
    console.log(`🔑 Public Key: ${this.keypair.publicKey()}`);
    console.log(`📊 Strategy: ${config.strategy}`);
    console.log(`💰 Daily Budget: $${this.dailyBudget}`);
    console.log(`⏱️  Check Interval: ${config.checkIntervalMs}ms\n`);
  }

  /**
   * START AUTONOMOUS LOOP
   * Agent will run indefinitely until stopped
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Agent is already running!');
      return;
    }

    console.log('🚀 Starting autonomous agent...\n');
    this.isRunning = true;

    while (this.isRunning) {
      try {
        await this.autonomousCycle();
        
        // Wait for next cycle
        await this.sleep(this.config.checkIntervalMs);
        
      } catch (error: any) {
        console.error('❌ Error in autonomous cycle:', error.message);
        console.log('🔄 Retrying in 10 seconds...\n');
        await this.sleep(10000);
      }
    }
  }

  /**
   * ONE AUTONOMOUS CYCLE
   * This is the agent's decision-making loop
   */
  private async autonomousCycle() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Starting new autonomous cycle...`);

    // STEP 1: DISCOVER AVAILABLE SERVICES
    console.log('🔍 Step 1: Discovering available services...');
    const services = await this.discoverServices();
    console.log(`✅ Found ${services.length} paid services`);

    // STEP 2: MAKE DECISION - Which service to use?
    console.log('🧠 Step 2: Making decision based on strategy...');
    const selectedService = this.selectService(services);
    
    if (!selectedService) {
      console.log('⚠️  No suitable service found. Skipping cycle.');
      return;
    }
    
    console.log(`📋 Selected: ${selectedService.path} (${selectedService.description})`);

    // STEP 3: CHECK BUDGET
    console.log('💰 Step 3: Checking budget...');
    const price = this.parsePrice(selectedService.price);
    if (this.totalSpent + price > this.dailyBudget) {
      console.log('⚠️  Daily budget exceeded. Stopping agent.');
      this.stop();
      return;
    }
    console.log(`✅ Budget OK. Cost: $${price}, Spent: $${this.totalSpent}/${this.dailyBudget}`);

    // STEP 4: AUTONOMOUS PAYMENT & DATA FETCH
    console.log('💸 Step 4: Executing autonomous payment...');
    const data = await this.payAndFetch(selectedService.path);
    console.log('✅ Payment successful. Data received.');

    // STEP 5: PROCESS DATA & TAKE ACTION
    console.log('🎯 Step 5: Processing data and taking action...');
    await this.takeAction(data, selectedService);
    console.log('✅ Action completed.');

    // STEP 6: UPDATE METRICS
    this.totalSpent += price;
    console.log(`📊 Total spent today: $${this.totalSpent}`);
  }

  /**
   * Discover services via x402 standard
   */
  private async discoverServices(): Promise<ServiceDiscovery[]> {
    try {
      // ✅ FIX: Use BACKEND_URL env var
      const discovery = await this.client.discoverServices(BACKEND_URL);
      return discovery.services.map(s => ({
        path: s.path,
        price: s.price,
        asset: s.asset,
        description: s.description
      }));
    } catch (error) {
      console.error('Failed to discover services:', error);
      return [];
    }
  }

  /**
   * Decision-making: Select service based on strategy
   */
  private selectService(services: ServiceDiscovery[]): ServiceDiscovery | null {
    switch (this.config.strategy) {
      case 'trading':
        // Prioritize market data
        return services.find(s => s.path.includes('data')) || services[0] || null;
      
      case 'data-collection':
        // Collect all available data
        return services[0] || null;
      
      case 'arbitrage':
        // Look for price feeds
        return services.find(s => s.path.includes('price')) || services[0] || null;
      
      default:
        return services[0] || null;
    }
  }

  /**
   * Autonomous payment and data fetch
   */
  private async payAndFetch(endpoint: string): Promise<any> {
  
    const fullUrl = `${BACKEND_URL}${endpoint}`;
    
    const result = await this.client.callPaidEndpoint(fullUrl, {
      method: 'GET',
      headers: {
        'X-Agent-Name': this.config.name,
        'X-Agent-Strategy': this.config.strategy
      }
    });

    return result;
  }

  /**
   * Take action based on received data
   */
  private async takeAction(data: any, service: ServiceDiscovery) {
    switch (this.config.strategy) {
      case 'trading':
        await this.tradingStrategy(data);
        break;
      
      case 'data-collection':
        await this.dataCollectionStrategy(data);
        break;
      
      case 'arbitrage':
        await this.arbitrageStrategy(data);
        break;
      
      default:
        console.log('📝 Generic action: Data processed');
    }
  }

  /**
   * Trading strategy: Analyze market and make decisions
   */
  private async tradingStrategy(data: any) {
    console.log('📊 Analyzing market data...');
    
    if (data.data && data.data.items) {
      for (const item of data.data.items) {
        console.log(`   • ${item.name}: ${item.value} (${item.change_24h})`);
        
        // Simple trading logic (example)
        if (item.change_24h && item.change_24h.includes('+')) {
          console.log(`   📈 Trending UP - Consider BUY`);
          // await this.executeTrade('BUY', item.name);
        } else if (item.change_24h && item.change_24h.includes('-')) {
          console.log(`   📉 Trending DOWN - Consider SELL`);
          // await this.executeTrade('SELL', item.name);
        }
      }
    }
    
    console.log('✅ Trading analysis complete');
  }

  /**
   * Data collection strategy: Store and analyze
   */
  private async dataCollectionStrategy(data: any) {
    console.log('💾 Collecting data...');
    console.log('   Data stored in local database (simulated)');
    console.log('   Running analytics...');
    
    // Simulate data processing
    await this.sleep(1000);
    
    console.log('✅ Data collection complete');
  }

  /**
   * Arbitrage strategy: Find price differences
   */
  private async arbitrageStrategy(data: any) {
    console.log('🔍 Searching for arbitrage opportunities...');
    
    // Simulate arbitrage detection
    await this.sleep(500);
    
    console.log('✅ No arbitrage opportunities found (simulated)');
  }

  /**
   * Helper: Parse price string to number
   */
  private parsePrice(priceStr: string): number {
    // Handle formats: "$0.01", "0.01 USDC", etc.
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0.01;
  }

  /**
   * Helper: Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log('\n🛑 Stopping autonomous agent...');
    this.isRunning = false;
    console.log(`📊 Final stats:`);
    console.log(`   Total spent: $${this.totalSpent}`);
    console.log(`   Agent stopped gracefully`);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.config.name,
      publicKey: this.keypair.publicKey(),
      isRunning: this.isRunning,
      totalSpent: this.totalSpent,
      dailyBudget: this.dailyBudget,
      strategy: this.config.strategy
    };
  }
}