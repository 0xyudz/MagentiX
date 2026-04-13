// packages/frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Dashboard() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Get wallet from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agentWallet');
    if (saved) {
      setWallet(saved);
    } else {
      // Create new agent via API
      fetch(`${API_BASE}/agents`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.publicKey) {
            setWallet(data.publicKey);
            localStorage.setItem('agentWallet', data.publicKey);
          }
        })
        .catch(err => {
          console.error('Failed to create agent:', err);
          setError('Failed to create agent. Is backend running?');
        });
    }
  }, []);

  // 2. Poll logs & status
  useEffect(() => {
    if (!wallet) return;

    const fetchLogs = async () => {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/agents/${wallet}/status`),
          fetch(`${API_BASE}/agents/${wallet}/logs`)
        ]);

        if (statusRes.ok) {
          const s = await statusRes.json();
          setStatus(s);
        }

        if (logsRes.ok) {
          const l = await logsRes.json();
          setLogs(l.logs || []);
        }

        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch logs:', err);
        setError('Failed to fetch logs');
      }
    };

    // Fetch immediately
    fetchLogs();

    // Then poll every 2 seconds
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, [wallet]);

  // Copy wallet to clipboard
  const copyToClipboard = async () => {
    if (!wallet) return;
    
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      
      // Show copied feedback for 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const startAgent = async (strategy: string) => {
    if (!wallet) return;
    
    try {
      const res = await fetch(`${API_BASE}/agents/${wallet}/config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Agent-Wallet': wallet 
        },
        body: JSON.stringify({ 
          strategy, 
          budget: 10, 
          interval: 15 
        })
      });

      if (res.ok) {
        alert(`Agent started: ${strategy}`);
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Failed to start agent');
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">❌ {error}</div>
        <button onClick={() => window.location.reload()} className="btn-primary">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🤖 Agent Dashboard</h1>

      {/* Wallet */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">🔑 Agent Wallet</h2>
        
        {/* Clickable wallet box with better visibility */}
        <div 
          onClick={copyToClipboard}
          className={`
            relative p-4 rounded-lg cursor-pointer transition-all duration-200
            ${copied 
              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' 
              : 'bg-gray-900 dark:bg-slate-800 border-2 border-gray-700 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400'
            }
          `}
          title="Click to copy wallet address"
        >
          {/* Wallet address - visible in both modes */}
          <p className="font-mono text-sm break-all text-white dark:text-gray-100">
            {wallet || 'Creating...'}
          </p>
          
          {/* Copy indicator */}
          <div className="absolute top-2 right-2">
            {copied ? (
              <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Click to copy
              </span>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          💡 Fund this wallet via Stellar Laboratory
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card">
            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
            <p className={`font-bold ${status.isRunning ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {status.isRunning ? '🟢 Running' : '⚪ Stopped'}
            </p>
          </div>
          <div className="glass-card">
            <p className="text-xs text-gray-600 dark:text-gray-400">Strategy</p>
            <p className="font-bold capitalize text-gray-900 dark:text-white">{status.strategy}</p>
          </div>
          <div className="glass-card">
            <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
            <p className="font-bold text-gray-900 dark:text-white">${status.budget}</p>
          </div>
          <div className="glass-card">
            <p className="text-xs text-gray-600 dark:text-gray-400">Spent</p>
            <p className="font-bold text-gray-900 dark:text-white">${status.totalSpent?.toFixed(4) || '0.0000'}</p>
          </div>
        </div>
      )}

      {/* Start Buttons */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🚀 Start Agent</h3>
        <div className="flex gap-3 flex-wrap">
          {['trading', 'travel', 'research'].map(s => (
            <button
              key={s}
              onClick={() => startAgent(s)}
              className="btn-primary"
            >
              ▶ Start {s}
            </button>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Live Logs</h3>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {logs.length} entries
          </span>
        </div>
        <div className="bg-gray-900 dark:bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Start an agent to see logs...
            </p>
          ) : (
            logs.map((log, i) => (
              <div 
                key={i} 
                className={`${
                  log.includes('✅') ? 'text-green-400' :
                  log.includes('❌') ? 'text-red-400' :
                  log.includes('💳') ? 'text-blue-400' :
                  log.includes('⚠️') ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}