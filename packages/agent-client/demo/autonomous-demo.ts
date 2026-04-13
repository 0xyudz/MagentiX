#!/usr/bin/env node
/**
 * AUTONOMOUS AGENT DEMO
 * 
 * This script demonstrates a TRUE autonomous AI agent that:
 * - Runs continuously without human intervention
 * - Makes its own decisions
 * - Discovers and pays for services automatically
 * - Executes actions based on received data
 * 
 * Usage:
 *   pnpm tsx demo/autonomous-demo.ts
 */

import { AutonomousAgent } from '../src/autonomous-agent.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   STELLAR AGENT PAY - AUTONOMOUS AGENT DEMO              ║');
  console.log('║   True AI Agent with x402 On-Chain Payments              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Check for secret key
  const secretKey = process.env.AGENT_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ ERROR: AGENT_SECRET_KEY not found in .env file');
    console.error('Please create .env file with:');
    console.error('AGENT_SECRET_KEY=S...your_secret_key_here\n');
    process.exit(1);
  }

  // Create autonomous agent
  const agent = new AutonomousAgent({
    secretKey,
    name: 'TradingBot_Alpha',
    strategy: 'trading', // Options: 'trading', 'data-collection', 'arbitrage'
    checkIntervalMs: 30000, // Check every 30 seconds
    maxBudgetPerDay: 10.00, // Max $10 per day
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Received shutdown signal...');
    agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n👋 Received termination signal...');
    agent.stop();
    process.exit(0);
  });

  // Start autonomous agent
  try {
    await agent.start();
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();