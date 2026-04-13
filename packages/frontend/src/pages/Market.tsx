// packages/frontend/src/pages/Market.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  wallet: string;
  tools: { name: string; description: string; price: string; currency: string }[];
  healthStatus: 'online' | 'offline' | 'unknown';
  registeredAt: number;
}

export default function Market() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/market/agents${filter ? `?category=${filter}` : ''}`)
      .then(r => r.json())
      .then(d => {
        setAgents(d.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['', 'travel.flights', 'finance.crypto', 'research.news', 'general'];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛒 Agent Marketplace</h1>
            <p className="text-text-secondary">Discover commercial AI agents with crypto payments</p>
          </div>
          <Link to="/register-agent" className="btn-primary self-start md:self-auto">
            ➕ Register Your Agent
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search agents or tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background-tertiary border border-white/10 rounded-xl px-4 py-3 
                         text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 
                         focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    filter === cat 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary hover:bg-white/10'
                  }`}
                >
                  {cat || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-text-muted mb-6">
          Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </p>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card">
                <div className="skeleton h-6 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3 mb-4"></div>
                <div className="skeleton h-8 w-24"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAgents.length === 0 && (
          <div className="glass-card text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-text-muted mb-6">Try adjusting your search or filters</p>
            <Link to="/register-agent" className="btn-secondary">
              Be the first to register!
            </Link>
          </div>
        )}

        {/* Agent Cards Grid */}
        {!loading && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <Link 
                key={agent.id} 
                to={`/agent/${agent.id}`}
                className="glass-card card-hover block group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-text-muted">{agent.category}</p>
                  </div>
                  <span className={`status-badge status-${agent.healthStatus}`}>
                    {agent.healthStatus}
                  </span>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Tools Preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-text-muted mb-2">Available Tools:</p>
                  <div className="space-y-1">
                    {agent.tools.slice(0, 2).map(tool => (
                      <div key={tool.name} className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">• {tool.name}</span>
                        <span className="text-primary font-medium">
                          ${(parseFloat(tool.price) / 10000000).toFixed(4)} {tool.currency}
                        </span>
                      </div>
                    ))}
                    {agent.tools.length > 2 && (
                      <p className="text-xs text-text-muted">+{agent.tools.length - 2} more</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-text-muted">
                    Wallet: {agent.wallet.slice(0, 10)}...
                  </span>
                  <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}