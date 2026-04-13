import { Keypair, Networks, TransactionBuilder, Horizon, Asset, Operation } from '@stellar/stellar-sdk';
import { RevenueService } from './revenue.service';
import { RevenueSplit } from '../types';

export interface PaymentConfig {
  recipient: string;
  amount: string; // In stroops
  useRevenueSplit: boolean;
}

export class PaymentService {
  private server: Horizon.Server;
  private keypair: Keypair;

  constructor(secretKey: string, networkUrl: string = 'https://horizon-testnet.stellar.org') {
    this.keypair = Keypair.fromSecret(secretKey);
    this.server = new Horizon.Server(networkUrl);
  }

  /**
   * Process payment with optional revenue split
   */
  async processPayment(config: PaymentConfig): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      const account = await this.server.loadAccount(this.keypair.publicKey());
      const balance = account.balances.find(b => b.asset_type === 'native');
      const balAmount = parseFloat(balance?.balance || '0');

      if (balAmount < 0.5) {
        return { success: false, error: `Insufficient balance: ${balAmount} XLM` };
      }

      let operations: Operation[] = [];

      if (config.useRevenueSplit) {
        // Apply 60/40 revenue split
        const split = RevenueService.calculateSplit(config.amount);
        
        RevenueService.logDistribution(
          split, 
          'tool_call', 
          'agent'
        );

        // Operation 1: Pay provider (60%)
        operations.push(Operation.payment({
          destination: config.recipient,
          asset: Asset.native(),
          amount: (BigInt(split.providerAmount) / 10_000_000n).toString()
        }));

        // Operation 2: Pay platform (40%)
        operations.push(Operation.payment({
          destination: RevenueService.getPlatformWallet(),
          asset: Asset.native(),
          amount: (BigInt(split.platformAmount) / 10_000_000n).toString()
        }));

      } else {
        // Simple payment (no split)
        const amountXlm = (BigInt(config.amount) / 10_000_000n).toString();
        operations.push(Operation.payment({
          destination: config.recipient,
          asset: Asset.native(),
          amount: amountXlm
        }));
      }

      const tx = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperations(operations)
        .setTimeout(30)
        .build();

      tx.sign(this.keypair);
      const result = await this.server.submitTransaction(tx);

      return { success: true, hash: result.hash };

    } catch (error: any) {
      console.error('❌ Payment failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}