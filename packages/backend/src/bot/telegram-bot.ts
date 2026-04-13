// packages/backend/src/bot/telegram-bot.ts
import { Telegraf, Context } from 'telegraf';
import { AutonomousAgent } from './autonomous-agent.js';

// ✅ FIX: Use env var for backend URL, fallback to localhost for dev
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';

interface TelegramBotDeps {
  getAgent: (publicKey: string) => AutonomousAgent | null;
  isValid: (publicKey: string) => boolean;
}

export function setupTelegramBot(token: string, deps: TelegramBotDeps) {
  if (!token) {
    console.error('❌ [TELEGRAM] Token missing');
    return;
  }

  console.log('📱 [TELEGRAM] Initializing bot...');
  const bot = new Telegraf(token);
  
  const userWallets = new Map<number, string>();
  const userStates = new Map<number, { step: string; config: any }>();

  bot.start((ctx) => {
    const uid = ctx.from!.id;
    ctx.reply(
      `🤖 Welcome to MagentiX!\n\n` +
      `🔗 To get started:\n` +
      `1. Open web dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n` +
      `2. Create agent & copy wallet address\n` +
      `3. Return here and type: /bind GABC...\n\n` +
      `Commands: /bind /status /logs /stop`
    );
  });

  bot.command('bind', (ctx) => {
    const uid = ctx.from!.id;
    const args = ctx.message?.text?.split(' ') || [];
    const wallet = args[1];
    
    // Validasi format wallet Stellar (G... 56 chars)
    if (!wallet || !wallet.startsWith('G') || wallet.length !== 56) {
      return ctx.reply('❌ Invalid wallet format.\nUse: `/bind GABC...` (56 chars)');
    }
    
    if (!deps.isValid(wallet)) {
      return ctx.reply(`❌ Wallet not found in system.\nCreate an agent on web first: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    }
    
    userWallets.set(uid, wallet);
    ctx.reply(`✅ Wallet bound successfully!\n🔑 ${wallet.substring(0, 20)}...`);
  });

  bot.command('status', (ctx) => {
    const uid = ctx.from!.id;
    const wallet = userWallets.get(uid);
    
    if (!wallet) {
      return ctx.reply('❌ Wallet not bound. Use `/bind GABC...` first.');
    }
    
    const agent = deps.getAgent(wallet);
    if (!agent) {
      return ctx.reply('❌ Agent not initialized. Try restarting the agent via web.');
    }
    
    try {
      const s = agent.getStatus();
      ctx.reply(
        `🤖 Agent Status\n` +
        `🟢 Running: ${s.isRunning ? 'Yes' : 'No'}\n` +
        `🎯 Strategy: ${s.strategy}\n` +
        `💰 Budget: $${s.budget}\n` +
        `📊 Spent: $${s.totalSpent.toFixed(4)}\n` +
        `🔑 Wallet: \`${s.publicKey.substring(0, 20)}...\``,
        { parse_mode: 'Markdown' }
      );
    } catch (e: any) {
      ctx.reply(`❌ Error: ${e.message}`);
    }
  });

  bot.command('logs', (ctx) => {
    const uid = ctx.from!.id;
    const wallet = userWallets.get(uid);
    if (!wallet) return ctx.reply('❌ Wallet not bound');
    
    const agent = deps.getAgent(wallet);
    const logs = agent?.logs.slice(-5) || [];
    ctx.reply(logs.length ? '📋 Recent Logs:\n' + logs.join('\n') : 'No logs yet');
  });

  bot.command('stop', (ctx) => {
    const uid = ctx.from!.id;
    const wallet = userWallets.get(uid);
    if (!wallet) return ctx.reply('❌ Wallet not bound');
    
    const agent = deps.getAgent(wallet);
    if (agent) {
      agent.stop();
      ctx.reply('🛑 Agent stopped.');
    } else {
      ctx.reply('❌ Agent not found');
    }
  });

  bot.command('setup', (ctx) => {
    const uid = ctx.from!.id;
    const wallet = userWallets.get(uid);
    if (!wallet) return ctx.reply('❌ Bind wallet first: `/bind GABC...`');
    
    userStates.set(uid, { step: 'strategy', config: {}, wallet });
    ctx.reply('🤖 Pilih strategi:\n/trading\n/travel\n/research');
  });

  bot.command('trading', (ctx) => handleStrategy(ctx, 'trading', userStates));
  bot.command('travel', (ctx) => handleStrategy(ctx, 'travel', userStates));
  bot.command('research', (ctx) => handleStrategy(ctx, 'research', userStates));

  // ✅ FIX: Handle budget input with dynamic BACKEND_URL
  bot.on('text', async (ctx) => {
    const uid = ctx.from!.id;
    const state = userStates.get(uid);
    
    if (!state || state.step !== 'budget' || !state.wallet) return;

    const budget = parseFloat(ctx.message.text);
    if (isNaN(budget) || budget <= 0) {
      return ctx.reply('❌ Ketik angka budget yang valid (contoh: 10)');
    }

    state.config.budget = budget;
    state.config.interval = 30;
    state.step = 'done';
    userStates.delete(uid);

    try {
      // ✅ FIX: Use BACKEND_URL env var instead of hardcoded localhost
      const res = await fetch(`${BACKEND_URL}/agents/${state.wallet}/config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Agent-Wallet': state.wallet
        },
        body: JSON.stringify({
          strategy: state.config.strategy,
          budget: state.config.budget,
          interval: state.config.interval
        })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error('❌ [TELEGRAM] Non-JSON response:', text.substring(0, 200));
        return ctx.reply('❌ Backend error. Check terminal.');
      }
      
      const data = await res.json();
      ctx.reply(data.success ? `🚀 Agent Launched!\nStrategy: ${state.config.strategy}\nBudget: $${state.config.budget}` : `❌ ${data.error}`);
    } catch (e: any) {
      console.error('❌ [TELEGRAM] Fetch failed:', e.message);
      ctx.reply('❌ Failed to connect to backend');
    }
  });

  bot.telegram.deleteWebhook()
    .then(() => console.log('🔌 [TELEGRAM] Webhook cleared'))
    .catch(err => console.warn('⚠️ [TELEGRAM] Webhook clear failed:', err.message));

  bot.launch()
    .then(() => console.log('✅ [TELEGRAM] Bot ACTIVE!'))
    .catch(err => console.error('❌ [TELEGRAM] Launch failed:', err));

  process.once('SIGINT', () => bot.stop('SIGINT'));
}

function handleStrategy(ctx: Context, strategy: string, userStates: Map<number, any>) {
  const uid = ctx.from!.id;
  const state = userStates.get(uid);
  if (!state || state.step !== 'strategy' || !state.wallet) {
    return ctx.reply('❌ Run `/setup` first and bind your wallet');
  }
  state.config.strategy = strategy;
  state.step = 'budget';
  ctx.reply(`✅ ${strategy} selected.\n💰 Submit budget (num$):`);
}