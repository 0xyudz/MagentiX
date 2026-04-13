// packages/frontend/src/services/api.ts
import { X402Discovery } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Get service discovery
  async getDiscovery(): Promise<X402Discovery> {
    const response = await fetch(`${API_BASE}/.well-known/x402`);
    if (!response.ok) throw new Error('Failed to fetch discovery');
    return response.json();
  },

  // Call paid endpoint (will handle 402 flow)
  async callEndpoint<T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST';
      body?: any;
      paymentProof?: {
        signature: string;
        nonce: string;
      };
    }
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (options?.paymentProof) {
      headers['Pay-Request'] = `nonce=${options.paymentProof.nonce}`;
      headers['Authorization'] = `StellarEd25519 ${options.paymentProof.signature}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 402) {
      throw new Error('PAYMENT_REQUIRED');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },
  
  async getAgents(category?: string) {
    const url = category 
      ? `${API_BASE}/market/agents?category=${category}`
      : `${API_BASE}/market/agents`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch agents:', response.statusText);
      return []; // Return empty array instead of mock data
    }
    
    const data = await response.json();
    return data.agents || [];
  },

  async registerAgent(agentData: any) {
    const response = await fetch(`${API_BASE}/market/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    });
    if (!response.ok) throw new Error('Failed to register agent');
    return response.json();
  },

  async getAgent(id: string) {
    const response = await fetch(`${API_BASE}/market/agents/${id}`);
    if (!response.ok) throw new Error('Agent not found');
    return response.json();
  },
};
