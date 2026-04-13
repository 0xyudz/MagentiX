/**
 * x402 Service Discovery Response
 * Format: /.well-known/x402
 */
export interface X402Discovery {
  protocol: "x402";
  version: string;
  network: string;
  services: X402Service[];
  facilitator: string;
  supported_wallets: string[];
  documentation?: string;
}

export interface X402Service {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  price: string;
  asset: string;
  description: string;
  auth_required: boolean;
  idempotency?: string;
  response_format?: string;
}

/**
 * Payment Metadata (from 402 response headers)
 */
export interface X402PaymentMeta {
  price: string;
  asset: string;
  recipient: string;
  nonce: string;
  network: string;
  facilitator?: string;
}

/**
 * Machine-Readable API Response (after successful payment)
 */
export interface AgentResponse<T = any> {
  status: "success" | "error" | "executed";
  confirmation_id?: string;
  execution_id?: string;
  timestamp: string;
  data?: T;
  result?: T;
  payment: {
    verified: boolean;
    network: string;
    asset: string;
    amount: string;
    recipient: string;
    tx_hash?: string;
  };
  meta?: {
    processed_by: string;
    api_version: string;
    next_steps?: string[];
  };
}

/**
 * Agent Configuration
 */
export interface AgentConfig {
  secretKey: string;
  network?: "testnet" | "mainnet";
  sorobanRpcUrl?: string;
  facilitatorUrl?: string;
  timeoutMs?: number;
}