// packages/backend/src/routes/agents.routes.ts
import { Router, Request, Response } from 'express';

interface AgentManager {
  createAgent(): { publicKey: string; secretKey: string };
  getAgent(wallet: string): any;
  isValidAgent(wallet: string): boolean;
  deleteAgent(wallet: string): boolean;
  listAgents(): string[]; 
}

export function createAgentRoutes(agentManager: AgentManager): Router {
  const router = Router();

  // NEW: GET all agents (list public keys)
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = agentManager.listAgents();
      res.json({ agents });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST create new agent
  router.post('/', (req: Request, res: Response) => {
    try {
      res.json(agentManager.createAgent());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST config agent
  router.post('/:wallet/config', (req: Request, res: Response) => {
    const { wallet } = req.params;
    
    if (!agentManager.isValidAgent(wallet)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agent = agentManager.getAgent(wallet);
    if (!agent) return res.status(500).json({ error: 'Agent init failed' });
    
    const { strategy, budget, interval } = req.body;
    agent.updateConfig({ 
      strategy, 
      budget: Number(budget), 
      intervalMs: (interval || 30) * 1000 
    });
    
    res.json({ success: true });
  });

  // GET agent status
  router.get('/:wallet/status', (req: Request, res: Response) => {
    const { wallet } = req.params;
    const agent = agentManager.getAgent(wallet);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found', status: 'stopped' });
    }
    
    res.json(agent.getStatus());
  });

  // GET agent logs
  router.get('/:wallet/logs', (req: Request, res: Response) => {
    const { wallet } = req.params;
    const agent = agentManager.getAgent(wallet);
    
    if (!agent) {
      return res.json({ logs: [] });
    }
    
    res.json({ logs: agent.logs?.slice(-20) || [] });
  });

  // DELETE agent
  router.delete('/:wallet', (req: Request, res: Response) => {
    res.json({ success: agentManager.deleteAgent(wallet) });
  });

  return router;
}