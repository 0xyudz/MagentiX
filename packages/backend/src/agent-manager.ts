// packages/backend/src/agent-manager.ts
import { AutonomousAgent } from './agent/autonomous-agent.js';
import { Keypair } from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'agents.json');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database: Key = Public Key Wallet (G...)
let agentsDB: Record<string, { secret: string; publicKey: string; createdAt: number }> = {};
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    agentsDB = raw.trim() ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('⚠️ Could not parse agents.json, starting fresh');
    agentsDB = {};
  }
}

const activeInstances = new Map<string, AutonomousAgent>();

export class AgentManager {
  
  static createAgent(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    
    agentsDB[publicKey] = { 
      secret: keypair.secret(), 
      publicKey, 
      createdAt: Date.now() 
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(agentsDB, null, 2));
    
    // ✅ FIX: Kirim BACKEND_URL ke constructor agent
    const agent = new AutonomousAgent(keypair.secret(), BACKEND_URL);
    activeInstances.set(publicKey, agent);
    
    console.log(`🆕 Agent Created: ${publicKey}`);
    return { publicKey, secretKey: keypair.secret() };
  }

  static getAgent(publicKey: string): AutonomousAgent | null {
    if (activeInstances.has(publicKey)) {
      return activeInstances.get(publicKey)!;
    }
    
    if (agentsDB[publicKey]) {
      console.log(`🔄 Restoring agent from disk: ${publicKey.substring(0, 10)}...`);
      
      // ✅ FIX: Kirim BACKEND_URL saat restore agent dari disk
      const agent = new AutonomousAgent(agentsDB[publicKey].secret, BACKEND_URL);
      activeInstances.set(publicKey, agent);
      return agent;
    }
    return null;
  }

  static isValidAgent(publicKey: string): boolean {
    return !!agentsDB[publicKey];
  }

  static deleteAgent(publicKey: string): boolean {
    if (agentsDB[publicKey]) {
      activeInstances.get(publicKey)?.stop();
      delete agentsDB[publicKey];
      activeInstances.delete(publicKey);
      fs.writeFileSync(DB_FILE, JSON.stringify(agentsDB, null, 2));
      console.log(`🗑️ Agent destroyed: ${publicKey.substring(0, 10)}...`);
      return true;
    }
    return false;
  }

  static listAgents(): string[] {
    return Object.keys(agentsDB);
  }
}