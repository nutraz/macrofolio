import React from 'react';
import { Shield, Layers, Zap, ArrowRight, ExternalLink, Lock, EyeOff, Database, Wallet, AlertTriangle } from 'lucide-react';

interface SplashProps {
  onConnect: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isMetaMaskInstalled: boolean;
}

const Splash: React.FC<SplashProps> = ({ onConnect, isDemoMode, onToggleDemoMode, isMetaMaskInstalled }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse-slow">
          Track every investment.
          <br />
          One portfolio. On-chain.
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Self-custodial portfolio tracking for Stocks, Gold, Real Estate, and Crypto.
          Zero reliance on centralized banks.
        </p>
        
        {/* Mode Toggle */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-4 bg-card/50 rounded-xl p-2 border border-border">
            <button
              onClick={() => isDemoMode || onToggleDemoMode()}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                isDemoMode 
                  ? 'bg-warning/20 text-warning border border-warning/30' 
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Demo Mode
              <span className="ml-2 text-xs opacity-70">No wallet needed</span>
            </button>
            <button
              onClick={() => !isDemoMode || onToggleDemoMode()}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                !isDemoMode 
                  ? 'bg-success/20 text-success border border-success/30' 
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Web3 Mode
              <span className="ml-2 text-xs opacity-70">MetaMask + Testnet</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onConnect}
            className="btn-primary px-8 py-4 text-lg flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue"
          >
            {isDemoMode ? (
              <>
                Enter Demo
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            ) : (
              <>
                Connect Wallet
                <Wallet className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
          
          {!isMetaMaskInstalled && !isDemoMode && (
            <a 
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-4 text-lg flex items-center justify-center transition-all duration-300 hover:bg-cardHover"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Install MetaMask
            </a>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 p-6 rounded-xl border border-border hover:border-info/30">
          <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
            <Shield className="w-6 h-6 text-info" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-textPrimary transition-colors hover:text-white">Self-Custodial</h3>
          <p className="text-gray-400 leading-relaxed">
            Your data stays secure. No centralized servers. Complete control over your financial data with Supabase + Web3.
          </p>
          <div className="mt-4 flex items-center text-info text-sm">
            <Lock className="w-4 h-4 mr-1" />
            End-to-end encrypted
          </div>
        </div>
        
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 p-6 rounded-xl border border-border hover:border-purple-500/30">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
            <Layers className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-textPrimary transition-colors hover:text-white">Unified Dashboard</h3>
          <p className="text-gray-400 leading-relaxed">
            Stocks, crypto, real estate—all in one view. Real-time updates across all your asset classes.
          </p>
          <div className="mt-4 flex items-center text-purple-500 text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Sub-second latency
          </div>
        </div>
        
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 p-6 rounded-xl border border-border hover:border-success/30">
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
            <Database className="w-6 h-6 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-textPrimary transition-colors hover:text-white">Web3 Native</h3>
          <p className="text-gray-400 leading-relaxed">
            Anchor portfolio actions to blockchain. Privacy-first design with zero KYC requirements on testnet.
          </p>
          <div className="mt-4 flex items-center text-success text-sm">
            <EyeOff className="w-4 h-4 mr-1" />
            No KYC required
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-br from-card/50 to-card rounded-xl p-8 border border-border mb-12">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <p className="text-3xl font-bold text-textPrimary mb-1">100%</p>
            <p className="text-textMuted text-sm">Self-Custodied</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold text-textPrimary mb-1">0</p>
            <p className="text-textMuted text-sm">KYC Required</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold text-textPrimary mb-1">∞</p>
            <p className="text-textMuted text-sm">Asset Types</p>
          </div>
          <div className="p-4">
            <p className="text-3xl font-bold text-textPrimary mb-1">24/7</p>
            <p className="text-textMuted text-sm">Live Updates</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="text-center mb-12">
        <p className="text-textMuted text-sm mb-4">Built with modern Web3 stack</p>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-card/50 rounded-lg text-sm text-textPrimary border border-border">
            React + Vite
          </span>
          <span className="px-4 py-2 bg-card/50 rounded-lg text-sm text-textPrimary border border-border">
            Supabase
          </span>
          <span className="px-4 py-2 bg-card/50 rounded-lg text-sm text-textPrimary border border-border">
            Polygon Amoy
          </span>
          <span className="px-4 py-2 bg-card/50 rounded-lg text-sm text-textPrimary border border-border">
            MetaMask
          </span>
          <span className="px-4 py-2 bg-card/50 rounded-lg text-sm text-textPrimary border border-border">
            Netlify
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ExternalLink className="w-4 h-4" />
          <span>Privacy-first design • Open source</span>
        </div>
        <p className="text-xs text-textMuted">Zero-cost cloud stack for portfolio tracking</p>
      </div>
    </div>
  );
};

export default Splash;
