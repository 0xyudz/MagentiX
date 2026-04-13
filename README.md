# 🤖 MagentiX — Autonomous AI Agents with x402 Payments on Stellar

<p align="center">
  <img src="https://img.shields.io/badge/Stellar-Soroban%20Ready-blue?style=for-the-badge&logo=stellar" alt="Stellar Ready" />
  <img src="https://img.shields.io/badge/x402-Payment%20Protocol-purple?style=for-the-badge" alt="x402 Protocol" />
  <img src="https://img.shields.io/badge/AI-Autonomous%20Agents-green?style=for-the-badge" alt="AI Agents" />
  <img src="https://img.shields.io/badge/Hackathon-Stellar%20Hacks%202026-orange?style=for-the-badge" alt="Stellar Hacks 2026" />
</p>

<p align="center">
  <strong>AI agents that think, decide, and pay — fully autonomous, fully on-chain.</strong>
</p>

<p align="center">
  <a href="https://magenti-x-app-frontend-hyr5.vercel.app">🌐 Live Demo</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-architecture">🏗️ Architecture</a> •
  <a href="#-demo">🎬 Demo</a>
</p>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [The Problem](#-the-problem)
3. [The Solution](#-the-solution)
4. [Features](#-features)
5. [Architecture](#-architecture)
6. [How It Works](#-how-it-works)
7. [Tech Stack](#-tech-stack)
8. [Quick Start](#-quick-start)
9. [API Documentation](#-api-documentation)
10. [x402 Payment Flow](#-x402-payment-flow)
11. [Revenue Model](#-revenue-model)
12. [Use Cases](#-use-cases)
13. [License](#-license)

---

## 🌟 Overview

**MagentiX** is a production-ready platform that enables **autonomous AI agents** to discover services, make decisions, and execute **micropayments on the Stellar blockchain** — all without human intervention.

Built for the **Stellar Hacks 2026** hackathon, MagentiX implements the **x402 Payment Protocol** to create a seamless bridge between AI decision-making and crypto payments.

### 🎯 Key Innovation

> "What if your AI agent could pay for services itself — securely, autonomously, and with full on-chain transparency?"

MagentiX answers this question with a complete infrastructure for **agentic commerce**:

- **Service Providers** register AI tools in a marketplace
- **Autonomous Agents** discover tools, make payments, and execute tasks
- **x402 Protocol** handles payment signaling and verification
- **Stellar Blockchain** provides immutable payment records
- **Revenue Split** (60/40) incentivizes both providers and platform

---

## 🔥 The Problem

Today's AI agents face critical limitations:

| Problem | Current State | MagentiX Solution |
|---------|--------------|-------------------|
| **Payment friction** | Humans must click "Buy" and enter credit cards | Agents pay automatically via crypto |
| **No autonomy** | Every transaction requires human approval | Fully autonomous payment flow |
| **No transparency** | Payments hidden in centralized databases | All payments on Stellar blockchain |
| **No micropayments** | Credit card fees too high for small payments | Stellar fees: 0.00001 XLM per tx |
| **No revenue sharing** | Providers keep 100%, platforms take high cuts | Automated 60/40 split on-chain |

---

## ✅ The Solution

MagentiX provides a complete stack for autonomous AI commerce:

```
┌─────────────────────────────────────────────────────────────┐
│                    MAGENTIX PLATFORM                        │
├──────────────┬──────────────┬───────────────────────────────┤
│  MARKETPLACE │ AUTONOMOUS   │ x402 PAYMENT                  │
│  • Register  │ AGENTS       │ PROTOCOL                      │
│  • Discover  │ • Think      │ • HTTP 402 signaling          │
│  • List tools│ • Decide     │ • Stellar payment signing     │
│  • skill.md  │ • Pay        │ • On-chain verification       │
└──────────────┴──────────────┴───────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  STELLAR  │
                    │ BLOCKCHAIN│
                    │ • Testnet │
                    │ • XLM     │
                    │ • Soroban │
                    └───────────┘
```

---

## 🚀 Features

### ✅ Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| **Marketplace** | ✅ Live | Service providers register AI tools with pricing |
| **Autonomous Agents** | ✅ Live | AI agents that discover, pay, and execute tasks |
| **x402 Protocol** | ✅ Live | HTTP 402 → Sign → Submit → Retry → 200 flow |
| **Revenue Split** | ✅ Live | 60% provider / 40% platform automatic split |
| **Web Dashboard** | ✅ Live | React + TypeScript interface with dark/light mode |
| **Telegram Bot** | ✅ Live | Control agents via Telegram commands |
| **On-Chain Payments** | ✅ Live | All payments recorded on Stellar Testnet |
| **Budget Management** | ✅ Live | Agents stop when budget exhausted |
| **Live Logs** | ✅ Live | Real-time agent execution logs |
| **skill.md Manifest** | ✅ Live | Machine-readable tool documentation |


### 🚧 Coming Soon

| Feature | Status | Description |
|---------|--------|-------------|
| **Soroban Escrow** | 🚧 WIP | Smart contract-based conditional payments |
| **Multi-Agent Coordination** | 📋 Planned | Agents collaborating on complex tasks |
| **Reputation System** | 📋 Planned | On-chain service quality ratings |
| **Multi-Asset Support** | 📋 Planned | USDC, BTC, ETH payments |
| **Mainnet Deployment** | 📋 Planned | Real money, real services |
| **Agent Marketplace UI** | 📋 Planned | Better discovery and filtering |

---

## 🏗️ Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Dashboard  │  │ Marketplace │  │   Register Agent Form   │  │
│  │  React+TS   │  │   Browse    │  │   Tool Configuration    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS/REST
┌──────────────────────────────▼───────────────────────────────────┐
│                        BACKEND (Render)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Express API  │  │ Agent Manager│  │ Marketplace Service  │   │
│  │ /api/agents  │  │ create/get   │  │ register/discover    │   │
│  │ /api/market  │  │ list/delete  │  │ verify payment       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Autonomous Agent Engine                     │   │
│  │  • Discovery loop    • Decision engine                   │   │
│  │  • x402 handler      • Payment signer                    │   │
│  │  • Budget tracker    • Error recovery                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐                                                │
│  │ Telegram Bot │  /bind /status /setup /travel /logs           │
│  └──────────────┘                                                │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Stellar SDK
┌──────────────────────────────▼───────────────────────────────────┐
│                     STELLAR BLOCKCHAIN                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Horizon API │  │  Testnet     │  │  Transaction Pool    │   │
│  │  REST/WS     │  │  Network     │  │  (Soroban ready)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### File Structure

```
MagentiX/
├── packages/
│   ├── frontend/                    # React + TypeScript + TailwindCSS
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx    # Agent control panel
│   │   │   │   ├── Market.tsx       # Service marketplace
│   │   │   │   └── Register.tsx     # Agent registration form
│   │   │   ├── components/
│   │   │   │   └── Layout.tsx       # Navigation + theme toggle
│   │   │   ├── services/
│   │   │   │   └── api.ts           # Backend API client
│   │   │   └── index.css            # Tailwind + custom styles
│   │   └── package.json
│   │
│   ├── backend/                     # Node.js + Express + TypeScript
│   │   ├── src/
│   │   │   ├── index.ts             # Express server entry
│   │   │   ├── agent-manager.ts     # Agent lifecycle management
│   │   │   ├── agent/
│   │   │   │   └── autonomous-agent.ts  # Core autonomous logic
│   │   │   ├── services/
│   │   │   │   ├── marketplace.service.ts
│   │   │   │   └── revenue.service.ts
│   │   │   ├── routes/
│   │   │   │   ├── agents.routes.ts
│   │   │   │   └── market.routes.ts
│   │   │   ├── bot/
│   │   │   │   └── telegram-bot.ts  # Telegram integration
│   │   │   └── config/
│   │   │       └── database.ts      # JSON persistence
│   │   └── package.json
│   │
│   └── agent-client/                # Standalone agent SDK
│       └── src/
│           └── autonomous-agent.ts
│
├── package.json                     # Monorepo config
└── README.md
```

---

## 🔁 How It Works

### Complete x402 Payment Flow

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   AUTONOMOUS│                    │   BACKEND   │                    │   STELLAR   │
│    AGENT    │                    │   SERVER    │                    │  BLOCKCHAIN │
└──────┬──────┘                    └──────┬──────┘                    └────────────┘
       │                                  │                                  │
       │  1. POST /tools/search_flights   │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │  2. HTTP 402 Payment Required    │                                  │
       │<─────────────────────────────────│                                  │
       │   { x402: { amount: "1000000" } }│                                  │
       │                                  │                                  │
       │  3. Prepare signed payment       │                                  │
       │     (Stellar transaction)        │                                  │
       │                                  │                                  │
       │  4. Submit to Stellar network    │                                  │
       │────────────────────────────────────────────────────────────────────>│
       │                                  │                                  │
       │  5. Transaction confirmed        │                                  │
       │<────────────────────────────────────────────────────────────────────│
       │                                  │                                  │
       │  6. Retry with Payment-Signature │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │  7. Verify signature + execute   │                                  │
       │<─────────────────────────────────│                                  │
       │   { success: true, data: {...} } │                                  │
       │                                  │                                  │
       │  8. Log result + continue loop   │                                  │
       │                                  │                                  │
```

### Step-by-Step Breakdown

1. **Discovery**: Agent queries `/api/market/agents?category=travel.flights`
2. **Selection**: Agent picks a tool based on strategy and budget
3. **Initial Call**: Agent POSTs to tool endpoint without payment
4. **402 Response**: Server responds with `HTTP 402` + x402 payment requirements
5. **Payment Creation**: Agent creates Stellar payment transaction (60% provider, 40% platform)
6. **Signing**: Agent signs transaction with its private key
7. **Submission**: Agent broadcasts transaction to Stellar network
8. **Retry**: Agent resends request with `Payment-Signature` header
9. **Verification**: Server verifies signature matches payment requirements
10. **Execution**: Server executes tool and returns results
11. **Loop**: Agent continues until budget exhausted or stopped

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| TailwindCSS | Styling + dark mode |
| Vite | Build tool + dev server |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 22 | Runtime |
| Express.js | API framework |
| TypeScript | Type safety |
| tsx | TypeScript execution |
| @stellar/stellar-sdk | Stellar blockchain integration |
| telegraf | Telegram bot framework |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Stellar Testnet | Blockchain network |
| Stellar Expert | Block explorer |
| GitHub | Source control |

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 22
pnpm >= 8
Stellar Testnet account (funded)
```

### 1. Clone Repository

```bash
git clone https://github.com/0xyudz/MagentiX.git
cd MagentiX
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Create `.env` file in `packages/backend/`:

```env
# Backend Configuration
BACKEND_PORT=3000
BACKEND_URL=http://localhost:3000

# Stellar Configuration
STELLAR_NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org

# Platform Configuration
PLATFORM_WALLET=GBWOU5UIXO7SL24MIK464KFCZ3JLPLXQEFVL233VO7JSSGJLSSCUFWQU

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

Create `.env` file in `packages/frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: Frontend
cd packages/frontend
pnpm dev
```

### 5. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

---

## 📡 API Documentation

### Base URL

```
Production: https://magentix-app.onrender.com/api
Development: http://localhost:3000/api
```

### Endpoints

#### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents` | Create new agent (returns wallet + secret) |
| `GET` | `/agents` | List all agent public keys |
| `GET` | `/agents/:wallet/status` | Get agent status and config |
| `GET` | `/agents/:wallet/logs` | Get recent agent logs |
| `POST` | `/agents/:wallet/config` | Update agent strategy/budget |
| `DELETE` | `/agents/:wallet` | Delete agent |

#### Marketplace

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/market/agents` | List all registered agents |
| `GET` | `/market/agents/:id` | Get agent details |
| `GET` | `/market/agents/:id/skill.md` | Get agent skill manifest |
| `POST` | `/market/agents/:id/tools/:tool/call` | Call agent tool (x402 flow) |
| `POST` | `/market/register` | Register new agent in marketplace |

### Example Requests

#### Create Agent

```bash
curl -X POST https://magentix-app.onrender.com/api/agents
```

Response:
```json
{
  "publicKey": "GD2YB6ZZE7OVKIGHDI2III637AVBJXJYUECXH6B36HIMAJHQHN2KYYBK",
  "secretKey": "SAK...XXXX"
}
```

#### Call Tool with x402

```bash
# Step 1: Initial call (no payment)
curl -X POST https://magentix-app.onrender.com/api/market/agents/agent_123/tools/search_flights/call \
  -H "Content-Type: application/json" \
  -d '{"input":{"query":"auto"},"callerWallet":"GD2Y..."}'

# Response: 402 Payment Required
{
  "error": "Payment Required",
  "x402": {
    "description": "Payment required to call search_flights",
    "accepts": [{
      "payTo": "GBWOU5...FWQU",
      "asset": "XLM",
      "amount": "1000000",
      "memo": "tool:search_flights:1775982870736",
      "network": "testnet"
    }]
  }
}

# Step 2: Retry with Payment-Signature header
curl -X POST https://magentix-app.onrender.com/api/market/agents/agent_123/tools/search_flights/call \
  -H "Content-Type: application/json" \
  -H "Payment-Signature: <base64_signed_transaction>" \
  -d '{"input":{"query":"auto"},"callerWallet":"GD2Y..."}'

# Response: 200 Success
{
  "success": true,
  "data": {
    "flights": [
      {
        "id": "GA001",
        "airline": "Garuda Indonesia",
        "price": "1.5M IDR",
        "route": "CGK-DPS",
        "date": "2026-05-01"
      }
    ]
  }
}
```

---

## 💰 Revenue Model

### 60/40 Split

Every payment made through MagentiX is automatically split:

```
Agent Payment: 0.1 XLM
├── 0.06 XLM (60%) → Service Provider Wallet
└── 0.04 XLM (40%) → Platform Wallet (MagentiX)
```

### Benefits

| Stakeholder | Benefit |
|-------------|---------|
| **Service Providers** | Earn 60% of every tool call |
| **Platform** | Earn 40% for infrastructure |
| **Users** | Transparent, low-fee autonomous services |
| **Stellar Network** | Transaction volume + ecosystem growth |

### On-Chain Transparency

All revenue splits are recorded on Stellar blockchain:
- Immutable proof of payments
- Verifiable by anyone via Stellar Expert
- No centralized accounting needed

---

## 🎬 Demo

### Live URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://magenti-x-app-frontend-hyr5.vercel.app |
| **Backend API** | https://magentix-app.onrender.com |
| **Health Check** | https://magentix-app.onrender.com/health |
| **Source Code** | https://github.com/0xyudz/MagentiX |
| **Telegram Bot** | https://t.me/stellaragentbot | CMD: /bind, /status, /setup, /travel, /logs

### Demo Flow

1. **Register Service** → Navigate to `/register-agent` and create a service provider
2. **Launch Agent** → Go to `/dashboard`, fund wallet, click "Start Travel"
3. **Watch Execution** → Observe real-time logs as agent discovers, pays, and executes
4. **Verify On-Chain** → Check Stellar Expert for payment transactions
5. **Control via Telegram** → Use `/status` command to check agent state


---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Payment execution time | ~3 seconds |
| Stellar settlement time | ~5 seconds |
| Transaction fee | 0.00002 XLM (~$0.000001) |
| Agent loop interval | 15 seconds (configurable) |
| Concurrent agents supported | Unlimited (stateless backend) |
| API response time | <200ms |

---

## 🛡️ Security

### Implemented

| Security Measure | Description |
|-----------------|-------------|
| **Signature Verification** | All payments verified against x402 requirements |
| **CORS Protection** | Whitelisted origins only |
| **Wallet Validation** | Stellar public key format validation |
| **Budget Guards** | Agents stop when budget exhausted |
| **Error Handling** | Graceful recovery from failed payments |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built for Stellar Hacks 2026 🚀</strong>
</p>

<p align="center">
  <em>AI agents that think, decide, and pay — autonomously.</em>
</p>
