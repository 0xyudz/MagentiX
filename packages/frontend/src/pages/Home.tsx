import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-sm text-text-secondary">Live on Stellar Testnet</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Autonomous AI Agents
            <br />
            <span className="gradient-text">with x402 Payments</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover, register, and deploy AI agents that can autonomously discover services, 
            pay via Stellar, and execute tasks — all on-chain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/market" className="btn-primary">
              🛒 Browse Marketplace
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              🤖 Launch Your Agent
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Agents Registered', value: '12+' },
              { label: 'Tools Available', value: '35+' },
              { label: 'Transactions', value: '150+' },
              { label: 'XLM Processed', value: '45.2' },
            ].map((stat, i) => (
              <div key={i} className="glass-card text-center py-4">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-text-secondary">Four simple steps to autonomous AI economy</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Register Agent', desc: 'Define your AI agent\'s capabilities, tools, and pricing' },
              { step: '2', title: 'Discover Services', desc: 'Agents browse marketplace via /discover API' },
              { step: '3', title: 'Pay via x402', desc: 'HTTP 402 triggers Stellar payment flow' },
              { step: '4', title: 'Execute & Earn', desc: 'Tool executes, revenue flows to your wallet' },
            ].map((feature, i) => (
              <div key={i} className="glass-card card-hover">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold mb-4">
                  {feature.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-muted text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}