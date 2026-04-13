// Shared TypeScript Interfaces

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  price: string; // In stroops
  currency: 'XLM' | 'USDC';
}

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  wallet: string;
  mcpEndpoint?: string;
  tools: Tool[];
  skillMdUrl?: string;
  healthUrl?: string;
  registeredAt: number;
  healthStatus: 'online' | 'offline' | 'unknown';
  lastHealthCheck?: number;
}

export interface X402PaymentRequest {
  version: string;
  amount: string;
  currency: string;
  recipient: string;
  contract: string;
  reference: string;
  description: string;
  metadata: Record<string, string>;
}

export interface RevenueSplit {
  providerAmount: string;  // 60%
  platformAmount: string;  // 40%
  totalAmount: string;
}