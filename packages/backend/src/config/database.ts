import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MarketplaceAgent } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

export class Database {
  static ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  static loadMarketplaceAgents(): Map<string, MarketplaceAgent> {
    Database.ensureDir();
    const file = path.join(DATA_DIR, 'marketplace_agents.json');
    
    if (!fs.existsSync(file)) {
      return new Map();
    }

    try {
      const raw = fs.readFileSync(file, 'utf-8');
      const data = raw.trim() ? JSON.parse(raw) : {};
      return new Map(Object.entries(data) as [string, MarketplaceAgent][]);
    } catch (error) {
      console.error('❌ Failed to load marketplace agents:', error);
      return new Map();
    }
  }

  static saveMarketplaceAgents(agents: Map<string, MarketplaceAgent>) {
    try {
      Database.ensureDir();
      const file = path.join(DATA_DIR, 'marketplace_agents.json');
      fs.writeFileSync(file, JSON.stringify(Object.fromEntries(agents), null, 2));
      console.log(`💾 Saved ${agents.size} marketplace agents`);
    } catch (error) {
      console.error('❌ Failed to save marketplace agents:', error);
    }
  }

  static loadAgents(): Record<string, any> {
    Database.ensureDir();
    const file = path.join(DATA_DIR, 'agents.json');
    
    if (!fs.existsSync(file)) {
      return {};
    }

    try {
      const raw = fs.readFileSync(file, 'utf-8');
      return raw.trim() ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static saveAgents(data: Record<string, any>) {
    try {
      Database.ensureDir();
      const file = path.join(DATA_DIR, 'agents.json');
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Failed to save agents:', error);
    }
  }
}