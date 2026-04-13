// packages/frontend/src/components/PaymentDemo.tsx
import React, { useState, useCallback, memo } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { 
  Keypair, 
  Networks, 
  TransactionBuilder, 
  Operation, 
  Horizon,
  Asset 
} from '@stellar/stellar-sdk';

const DEMO_AGENT_SECRET = import.meta.env.VITE_DEMO_AGENT_SECRET || '';
const MERCHANT_PUBLIC_KEY = import.meta.env.VITE_MERCHANT_PUBLIC_KEY || '';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface PaymentDemoProps {
  agentName: string;
  endpoint: string;  // e.g., '/market/agents/xxx/tools/xxx/call'
  price: string;
}

const PaymentDemo = memo(function PaymentDemo({ agentName, endpoint, price }: PaymentDemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'idle' | 'building' | 'signing' | 'submitting' | 'verifying' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const runOnChainPayment = useCallback(async () => {
    setStep('building');
    setLogs([]);
    setError('');
    setResult(null);

    try {
      addLog('🔑 Initializing Agent Wallet...');
      let secretKey = DEMO_AGENT_SECRET;
      if (!secretKey) {
        secretKey = prompt('Enter Agent Secret Key (S...):') || '';
      }
      if (!secretKey) throw new Error('Secret Key is required');
      
      const keypair = Keypair.fromSecret(secretKey);
      addLog(`✅ Agent Public Key: ${keypair.publicKey().substring(0, 10)}...`);

      addLog('📡 Connecting to Stellar Testnet...');
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      
      addLog('📥 Fetching account data...');
      const sourceAccount = await server.loadAccount(keypair.publicKey());

      addLog('🔨 Building Transaction...');
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: MERCHANT_PUBLIC_KEY,
            asset: Asset.native(),
            amount: '0.01',
          })
        )
        .setTimeout(30)
        .build();

      addLog('📝 Transaction built. Preparing to sign...');
      setStep('signing');
      addLog('✍️ Signing with Ed25519...');
      transaction.sign(keypair);
      addLog('✅ Signed successfully.');

      setStep('submitting');
      addLog('🚀 Submitting to Stellar Network...');
      const transactionResult = await server.submitTransaction(transaction);
      
      const txHash = transactionResult.hash;
      addLog(`🧾 Transaction Submitted!`);
      addLog(`🆔 Tx Hash: ${txHash}`);

      setStep('verifying');
      addLog('📤 Sending Tx Hash to Merchant...');
     
      const payRes = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Payment-Tx-Hash': txHash,
          'X-Agent-Public-Key': keypair.publicKey()
        }
      });

      if (!payRes.ok) {
        const errText = await payRes.text();
        throw new Error(`Merchant Rejected: ${errText}`);
      }

      setStep('success');
      const data = await payRes.json();
      addLog('✅ Merchant verified on-chain payment!');
      addLog('📦 Data received.');
      setResult(data);

    } catch (err: any) {
      setStep('error');
      setError(err.message);
      addLog(`❌ FAILED: ${err.message}`);
    }
  }, [agentName, endpoint, price, addLog]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setStep('idle');
    setLogs([]);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
      >
        <Wallet className="w-5 h-5" />
        <span>Pay with Stellar (On-Chain)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={handleClose}>
          <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] transform-gpu" onClick={e => e.stopPropagation()}>
            
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-blue-400">🤖 Agent Execution Log</h3>
                <p className="text-xs text-gray-400">{agentName} | {endpoint}</p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-white">
                <X />
              </button>
            </div>

            <div className="p-4 font-mono text-sm overflow-y-auto flex-1 bg-black space-y-2">
              {logs.length === 0 && <span className="text-gray-500">Waiting for execution...</span>}
              {logs.map((log, i) => (
                <div key={i} className="text-green-400">{log}</div>
              ))}
              
              {(step === 'signing' || step === 'submitting' || step === 'verifying') && (
                <div className="flex items-center space-x-2 text-yellow-400 mt-2">
                  <Loader2 className="animate-spin w-4 h-4" /> 
                  <span>{step === 'signing' ? 'Signing...' : step === 'submitting' ? 'Submitting to Stellar...' : 'Verifying...'}</span>
                </div>
              )}
            </div>

            {(step === 'success' || step === 'error') && (
              <div className={`p-4 border-t ${step === 'success' ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                {step === 'success' ? (
                  <div>
                    <div className="flex items-center space-x-2 text-green-400 font-bold mb-2">
                      <CheckCircle /> <span>EXECUTION SUCCESSFUL</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">Tx verified on Stellar Testnet</div>
                    <pre className="text-xs bg-black/50 p-2 rounded text-gray-300 overflow-x-auto max-h-32">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-400 font-bold flex items-center space-x-2">
                    <AlertCircle /> <span>EXECUTION FAILED: {error}</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 border-t border-gray-700 flex justify-end bg-gray-800 rounded-b-xl">
              {step === 'idle' || step === 'error' || step === 'success' ? (
                <button
                  onClick={runOnChainPayment}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition-all"
                >
                  {step === 'idle' ? 'START PAYMENT' : 'RETRY'}
                </button>
              ) : (
                <div className="text-gray-400 flex items-center">Processing...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default PaymentDemo;
