// packages/frontend/src/pages/CreateSkill.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CreateSkill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    price: '',
    author: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          category: 'general', // Add default category
          tools: [{
            name: formData.name.toLowerCase().replace(/\s+/g, '_'),
            description: formData.content,
            inputSchema: { type: 'object', properties: {} },
            price: String(parseFloat(formData.price) * 10000000), // Convert XLM to stroops
            currency: 'XLM'
          }]
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Skill submitted successfully! ID: ${data.agent_id}`);
        setFormData({ name: '', content: '', price: '', author: '' });
        setTimeout(() => navigate('/market'), 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Failed to submit skill. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📝 Create New Skill</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>What is a Skill?</strong><br/>
          A skill is an AI agent capability that other agents can purchase and use. 
          Examples: "Crypto Market Analysis", "Flight Price Prediction", "News Sentiment Analysis"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Skill Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Crypto Market Analyzer"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Skill Content (AI Logic) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Skill Content (AI Logic/Prompt) *
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Describe the AI logic or prompt that defines this skill..."
            rows={6}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the "brain" of the skill - what the AI will do when executing this skill
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Price (XLM) *
          </label>
          <input
            type="number"
            required
            step="0.0000001"
            min="0.0000001"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="0.5"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            How much agents pay to unlock this skill (in XLM)
          </p>
        </div>

        {/* Author Wallet */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Wallet Address (Author) *
          </label>
          <input
            type="text"
            required
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            placeholder="G... (56 characters)"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Revenue from skill purchases will be sent to this wallet
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                      text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Submitting...' : '📤 Submit Skill'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/market')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
