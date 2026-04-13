import { RevenueSplit } from '../types';

export class RevenueService {
  private static readonly PLATFORM_FEE_PERCENT = 40; // 40% platform
  private static readonly PROVIDER_FEE_PERCENT = 60; // 60% provider
  private static readonly PLATFORM_WALLET = process.env.PLATFORM_WALLET || 'GPLATFORM...';

  /**
   * Calculate revenue split (60/40)
   * @param totalAmount Total amount in stroops
   * @returns RevenueSplit object
   */
  static calculateSplit(totalAmount: string): RevenueSplit {
    const total = BigInt(totalAmount);
    
    const providerAmount = (total * BigInt(this.PROVIDER_FEE_PERCENT)) / 100n;
    const platformAmount = (total * BigInt(this.PLATFORM_FEE_PERCENT)) / 100n;

    return {
      providerAmount: providerAmount.toString(),
      platformAmount: platformAmount.toString(),
      totalAmount: totalAmount
    };
  }

  /**
   * Get platform wallet address
   */
  static getPlatformWallet(): string {
    return this.PLATFORM_WALLET;
  }

  /**
   * Log revenue distribution
   */
  static logDistribution(split: RevenueSplit, toolName: string, agentName: string) {
    console.log(`💰 Revenue Distribution:`);
    console.log(`   Tool: ${toolName} (${agentName})`);
    console.log(`   Total: ${(BigInt(split.totalAmount) / 10_000_000n).toString()} XLM`);
    console.log(`   → Provider (60%): ${(BigInt(split.providerAmount) / 10_000_000n).toString()} XLM`);
    console.log(`   → Platform (40%): ${(BigInt(split.platformAmount) / 10_000_000n).toString()} XLM`);
  }
}