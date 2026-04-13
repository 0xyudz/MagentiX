import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, Network } from 'lucide-react';
import PaymentDemo from './PaymentDemo';


interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'online' | 'offline';
  version: string;
  tools: string[];
  latency_ms: number;
  network: string;
  payment_methods: string[];
}

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              agent.status === 'online' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                agent.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
              }`}></span>
              {agent.status.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">v{agent.version}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {agent.description}
      </p>

      {/* Tools */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {agent.tools.map(tool => (
            <span 
              key={tool} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Meta Info */}
      <div className="space-y-2 text-sm text-gray-600 mb-6">
        <div className="flex items-center">
          <Zap className="w-4 h-4 mr-2 text-primary-600" />
          <span>{agent.payment_methods.join(', ')}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-primary-600" />
          <span>{agent.latency_ms}ms latency</span>
        </div>
        <div className="flex items-center">
          <Network className="w-4 h-4 mr-2 text-primary-600" />
          <span>{agent.network}</span>
        </div>
      </div>

      {/* Actions */}
      <Link 
        to={`/agent/${agent.id}`}
        className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        View Details
      </Link>

      <PaymentDemo 
  agentName={agent.name}
  endpoint={`/api/data`}
  price="0.01"
/>
    </div>
  );
}