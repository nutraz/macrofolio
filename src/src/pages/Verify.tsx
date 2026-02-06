import React, { useState } from 'react';
import { Search, ExternalLink, CheckCircle, XCircle, Hash, User, Calendar, Shield, Info, Link as LinkIcon } from 'lucide-react';
import { ethers } from 'ethers';
import { NETWORKS } from '../lib/web3';
import { supabase } from '../lib/supabase';

// Contract ABI for reading events
const ANCHOR_ABI = [
  'event PortfolioAnchored(address indexed user, string actionType, bytes32 dataHash, uint256 timestamp)'
];

// Example transaction hash for demo
const EXAMPLE_TX_HASH = '0x...';

interface OffChainRecord {
  exists: boolean;
  created_at?: string;
}

interface VerifyResult {
  success: boolean;
  user?: string;
  actionType?: string;
  dataHash?: string;
  timestamp?: number;
  txHash?: string;
  offChainRecord?: OffChainRecord;
  error?: string;
}

const Verify: React.FC = () => {
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleVerify = async () => {
    if (!txHash.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      // Validate txHash format
      if (!ethers.isHexString(txHash) || txHash.length !== 66) {
        throw new Error('Invalid transaction hash format. Must be a 66-character hex string starting with 0x.');
      }

      // Connect to provider (Polygon Amoy) - read-only, no wallet needed
      const provider = new ethers.JsonRpcProvider(NETWORKS.polygonAmoy.rpcUrl);

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new Error('Transaction not found on Polygon Amoy. Please check the hash and ensure you\'re using a Polygon Amoy transaction.');
      }

      // Check if transaction was successful
      if (!receipt.status) {
        throw new Error('Transaction failed. This transaction was not confirmed on the blockchain.');
      }

      // Parse logs to find PortfolioAnchored event
      const contractInterface = new ethers.Interface(ANCHOR_ABI);
      const anchorLog = receipt.logs.find(log => {
        try {
          const parsed = contractInterface.parseLog(log);
          return parsed?.name === 'PortfolioAnchored';
        } catch {
          return false;
        }
      });

      if (!anchorLog) {
        throw new Error('No PortfolioAnchored event found in this transaction. This may not be a Macrofolio anchor transaction.');
      }

      const parsedLog = contractInterface.parseLog(anchorLog);
      const event = parsedLog!.args;

      // Cross-verify with Supabase (optional but powerful)
      let offChainRecord: OffChainRecord = { exists: false };
      try {
        const { data: anchorData } = await supabase
          .from('anchors')
          .select('created_at')
          .eq('data_hash', event.dataHash)
          .maybeSingle();
        
        if (anchorData && 'created_at' in anchorData) {
          offChainRecord = {
            exists: true,
            created_at: anchorData.created_at as string
          };
        }
      } catch (e) {
        // Supabase verification failed, continue without it
        console.warn('Supabase cross-verification failed:', e);
      }

      setResult({
        success: true,
        user: event.user,
        actionType: event.actionType,
        dataHash: event.dataHash,
        timestamp: Number(event.timestamp),
        txHash: txHash,
        offChainRecord
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to verify transaction. Please check the hash and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, _label: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });
  };

  const explorerUrl = `${NETWORKS.polygonAmoy.explorerUrl}/tx/${txHash}`;
  const addressExplorerUrl = result?.user ? `${NETWORKS.polygonAmoy.explorerUrl}/address/${result.user}` : '#';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-textPrimary mb-2">
          Verify On-Chain Proof
        </h1>
        <p className="text-textMuted">
          Paste a transaction hash to verify portfolio anchoring on Polygon Amoy
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 mb-6">
        <label className="block text-sm font-medium text-textMuted mb-2">
          Transaction Hash
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder={EXAMPLE_TX_HASH}
              className="w-full pl-10 pr-4 py-3 bg-bg/50 border border-border rounded-xl text-textPrimary placeholder-textMuted focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/50 transition-all"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || !txHash.trim()}
            className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Verify
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-textMuted mt-2 flex items-center gap-2">
          <span>Network: {NETWORKS.polygonAmoy.name} (Chain ID: {NETWORKS.polygonAmoy.chainId})</span>
          <span>•</span>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1 text-info hover:text-info-light transition-colors"
          >
            <Info className="w-4 h-4" />
            What is this?
          </button>
        </p>
      </div>

      {/* Info Collapsible */}
      {showInfo && (
        <div className="mb-6 p-4 bg-info/5 border border-info/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-info mb-2">About On-Chain Verification</p>
              <p className="text-textMuted mb-3">
                Every portfolio action anchored to the blockchain creates an immutable record.
                This page lets anyone verify that a specific transaction contains a PortfolioAnchored event.
              </p>
              <p className="text-textMuted mb-2">
                <strong>Cross-Verification:</strong> When available, we also check our Supabase database
                to confirm the record exists both on-chain and off-chain.
              </p>
              <p className="text-textMuted text-xs">
                🔒 This page is read-only. No wallet connection required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`border rounded-2xl overflow-hidden ${
          result.success 
            ? 'bg-success/5 border-success/30' 
            : 'bg-danger/5 border-danger/30'
        }`}>
          {/* Status Header */}
          <div className={`px-6 py-4 flex items-center gap-3 ${
            result.success ? 'bg-success/10' : 'bg-danger/10'
          }`}>
            {result.success ? (
              <>
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-success font-semibold">
                  {result.offChainRecord?.exists 
                    ? 'Verified On-Chain + Off-Chain' 
                    : 'Verified On-Chain'}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-danger" />
                <span className="text-danger font-semibold">Verification Failed</span>
              </>
            )}
          </div>

          {/* Result Content */}
          {result.success ? (
            <div className="p-6 space-y-4">
              {/* Off-Chain Record Badge */}
              {result.offChainRecord?.exists && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-success text-sm">
                    ✅ Record exists in Supabase (anchored at {new Date(result.offChainRecord.created_at!).toLocaleDateString()})
                  </span>
                </div>
              )}

              {/* User */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-textMuted" />
                  <span className="text-textMuted">Wallet Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-textPrimary font-mono bg-bg/50 px-2 py-1 rounded">
                    {result.user && formatAddress(result.user)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(result.user!, 'Wallet address')}
                    className="text-textMuted hover:text-textPrimary"
                    title="Copy address"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <a
                    href={addressExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:text-info-light"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Action Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-textMuted" />
                  <span className="text-textMuted">Action Type</span>
                </div>
                <span className="px-3 py-1 bg-info/10 text-info text-sm font-medium rounded-full border border-info/20">
                  {result.actionType}
                </span>
              </div>

              {/* Data Hash */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-textMuted" />
                  <span className="text-textMuted">Data Hash</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-textPrimary font-mono text-sm bg-bg/50 px-2 py-1 rounded">
                    {result.dataHash && formatHash(result.dataHash)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(result.dataHash!, 'Data hash')}
                    className="text-textMuted hover:text-textPrimary"
                    title="Copy hash"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-textMuted" />
                  <span className="text-textMuted">Anchored At</span>
                </div>
                <span className="text-textPrimary">
                  {result.timestamp && formatDate(result.timestamp)}
                </span>
              </div>

              {/* Explorer Link */}
              <div className="pt-4 border-t border-border">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-card/50 hover:bg-card transition-colors rounded-xl text-textMuted hover:text-textPrimary"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Transaction on Polygonscan
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-danger mt-0.5" />
                <div>
                  <p className="text-danger font-medium">Verification Failed</p>
                  <p className="text-textMuted text-sm mt-1">{result.error}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-bg/50 rounded-xl">
                <p className="text-xs text-textMuted">
                  <strong>Common Issues:</strong>
                </p>
                <ul className="text-xs text-textMuted mt-2 space-y-1 list-disc list-inside">
                  <li>Transaction hash is incomplete or invalid</li>
                  <li>Transaction is on a different network (not Polygon Amoy)</li>
                  <li>Transaction hasn't been confirmed yet</li>
                  <li>This transaction doesn't contain a PortfolioAnchored event</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-8 p-4 bg-success/5 border border-success/20 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-success mb-1">Trust & Transparency</p>
          <p className="text-textMuted">
            Macrofolio anchors portfolio actions to Polygon Amoy testnet, creating an immutable record.
            This page allows anyone to verify that specific actions were recorded on-chain at a specific time.
            The data hash ensures the content hasn't been modified.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;

