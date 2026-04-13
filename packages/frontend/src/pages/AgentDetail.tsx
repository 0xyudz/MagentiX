// packages/frontend/src/pages/AgentDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AgentDetail() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [skillMd, setSkillMd] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/market/agents/${id}`)
      .then(r => r.json())
      .then(data => {
        setAgent(data);
        setLoading(false);
      });
    
    fetch(`${API_BASE}/market/agents/${id}/skill.md`)
      .then(r => r.text())
      .then(md => setSkillMd(md));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!agent) return <div className="p-6">Agent not found</div>;

  const copySkillUrl = () => {
    const url = `${API_BASE}/market/agents/${id}/skill.md`;
    navigator.clipboard.writeText(url);
    alert('skill.md URL copied! Share with AI agents.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{agent.name}</h1>
        <button
          onClick={copySkillUrl}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📋 Copy skill.md URL
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-700">{agent.description}</p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <p>Category: <span className="font-medium">{agent.category}</span></p>
          <p>Wallet: <code className="bg-gray-200 px-1 rounded text-xs">{agent.wallet}</code></p>
          <p>Status: <span className={`font-medium ${
            agent.healthStatus === 'online' ? 'text-green-600' : 
            agent.healthStatus === 'offline' ? 'text-red-600' : 'text-gray-600'
          }`}>{agent.healthStatus}</span></p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-3">Available Tools</h2>
      <div className="space-y-3 mb-6">
        {agent.tools.map((tool: any) => (
          <div key={tool.name} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold">{tool.name}</h3>
              <span className="text-blue-600 font-medium">
                ${(parseFloat(tool.price) / 10000000).toFixed(4)} XLM
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">
                View Input Schema
              </summary>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-x-auto">
                {JSON.stringify(tool.inputSchema, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-3">skill.md (For AI Models)</h2>
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
        <pre className="text-xs whitespace-pre-wrap font-mono">{skillMd}</pre>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">📖 How AI Agents Use This</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>AI model reads skill.md manifest</li>
          <li>Parses tools and input schemas</li>
          <li>Calls tool via API (receives HTTP 402)</li>
          <li>Pays via Soroban escrow</li>
          <li>Retries with payment proof</li>
          <li>Receives result</li>
        </ol>
      </div>
    </div>
  );
}
