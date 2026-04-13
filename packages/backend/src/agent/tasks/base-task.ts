import { BaseTask as Base, TaskInput, TaskResult, TaskContext } from '../types';

export abstract class BaseTask extends Base {
  protected async callTool(
    backendUrl: string,
    agentId: string,
    toolName: string,
    input: TaskInput,
    callerWallet: string,
    price: string
  ): Promise<any> {
    const url = `${backendUrl}/api/market/agents/${agentId}/tools/${toolName}/call`;
    const headers = { 
      'Content-Type': 'application/json', 
      'X-Agent-Wallet': callerWallet 
    };
    const body = JSON.stringify({ input, callerWallet });

    // Step 1: Initial call
    let res = await fetch(url, { method: 'POST', headers, body });
    
    // Step 2: Handle 402 Payment Required
    if (res.status === 402) {
      const { x402 } = await res.json();
      console.log(`💳 Payment required: ${x402.description}`);
      
      // In production, trigger payment here
      // For now, just retry
      res = await fetch(url, { method: 'POST', headers, body });
    }
    
    if (!res.ok) {
      throw new Error(`Tool call failed: ${res.status}`);
    }
    
    const data = await res.json();
    return data.result;
  }

  protected log(msg: string) {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  }
}