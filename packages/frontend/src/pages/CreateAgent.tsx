// packages/frontend/src/pages/CreateAgent.tsx
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CreateAgent() {
  const [strategy, setStrategy] = useState('travel');
  const [budget, setBudget] = useState(10);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/agents/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, budget, interval: 30 })
      });
      const data = await res.json();
      setMsg(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (err) {
      setMsg('❌ Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">🤖 Configure Your Agent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Use Case</label>
          <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full p-2 border rounded">
            <option value="trading">📈 Trading Bot</option>
            <option value="travel">✈️ Travel Assistant</option>
            <option value="research">📚 Research Bot</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Daily Budget ($)</label>
          <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full p-2 border rounded" min="1" />
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? 'Launching...' : '🚀 Launch Agent'}
        </button>
        {msg && <p className="text-center mt-2 font-medium">{msg}</p>}
      </form>
    </div>
  );
}
