// packages/frontend/src/pages/RegisterAgent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    wallet: '',
    mcpEndpoint: '',
    skillMdUrl: '',
    healthUrl: '',
    tools: [{ name: '', description: '', inputSchema: '{}', price: '', currency: 'XLM' }]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTool = () => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { name: '', description: '', inputSchema: '{}', price: '', currency: 'XLM' }]
    });
  };

  const updateTool = (index: number, field: string, value: string) => {
    const newTools = [...formData.tools];
    (newTools[index] as any)[field] = value;
    setFormData({ ...formData, tools: newTools });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/market/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tools: formData.tools.map(t => ({
            ...t,
            inputSchema: JSON.parse(t.inputSchema),
            price: String(parseFloat(t.price) * 10000000) // XLM to stroops
          }))
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Agent registered! ID: ${data.agent_id}`);
        setTimeout(() => navigate('/market'), 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setMessage('❌ Failed to register agent. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🤖 Register Your Agent</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Turn your AI agent into a commercial service</strong><br/>
          Register once to get: payment capability (XLM via escrow), 
          marketplace visibility, and health-monitored listing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Agent Name *</label>
            <input
              type="text" required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Travel Booking Agent"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="general">General</option>
              <option value="travel.flights">Travel: Flights</option>
              <option value="travel.hotels">Travel: Hotels</option>
              <option value="finance.crypto">Finance: Crypto</option>
              <option value="finance.stocks">Finance: Stocks</option>
              <option value="research.news">Research: News</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="What does your agent do?"
            rows={3}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Wallet & URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Wallet *</label>
            <input
              type="text" required
              value={formData.wallet}
              onChange={(e) => setFormData({...formData, wallet: e.target.value})}
              placeholder="G... (56 chars)"
              className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Health Check URL</label>
            <input
              type="url"
              value={formData.healthUrl}
              onChange={(e) => setFormData({...formData, healthUrl: e.target.value})}
              placeholder="https://your-agent.com/health"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Tools Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Tools/Services *</label>
            <button type="button" onClick={addTool} className="text-blue-600 text-sm hover:underline">
              + Add Tool
            </button>
          </div>
          
          {formData.tools.map((tool, index) => (
            <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text" placeholder="Tool name (e.g., search_flights)"
                  value={tool.name}
                  onChange={(e) => updateTool(index, 'name', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number" step="0.0000001" placeholder="Price (XLM)"
                  value={tool.price}
                  onChange={(e) => updateTool(index, 'price', e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <textarea
                placeholder="Tool description"
                value={tool.description}
                onChange={(e) => updateTool(index, 'description', e.target.value)}
                className="w-full border rounded px-3 py-2 mt-2"
                rows={2}
              />
              <textarea
                placeholder='Input schema (JSON): {"type":"object","properties":{...}}'
                value={tool.inputSchema}
                onChange={(e) => updateTool(index, 'inputSchema', e.target.value)}
                className="w-full border rounded px-3 py-2 mt-2 font-mono text-xs"
                rows={3}
              />
            </div>
          ))}
        </div>

        {/* Message & Submit */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                      text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? 'Registering...' : '📤 Register Agent'}
          </button>
          <button
            type="button" onClick={() => navigate('/market')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
