// packages/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import { MarketplaceService } from './services/marketplace.service.js';
import { AgentManager } from './agent-manager.js';
import { setupTelegramBot } from './bot/telegram-bot.js';
import { createMarketRoutes } from './routes/market.routes.js';
import { createAgentRoutes } from './routes/agents.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map((o: string) => o.trim())
  : ['http://localhost:5173'];

app.use(cors({ 
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Agent-Wallet', 'X-Payment-Tx-Hash', 'Pay-Request']
}));

app.use(express.json());

// Initialize Services
const marketplace = new MarketplaceService();

// Mount Routes
app.use('/api/market', createMarketRoutes(marketplace));
app.use('/api/agents', createAgentRoutes(AgentManager));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Telegram Bot
if (process.env.TELEGRAM_BOT_TOKEN) {
  setupTelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    getAgent: (pk: string) => AgentManager.getAgent(pk),
    isValid: (pk: string) => AgentManager.isValidAgent(pk)
  });
}

// Error Handlers
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`💰 Revenue Split: 60% Provider / 40% Platform`);
  console.log(`🔗 CORS Origins: ${corsOrigins.join(', ')}`);
});