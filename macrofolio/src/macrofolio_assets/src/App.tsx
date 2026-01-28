import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Verify from './pages/Verify';
import Premium from './pages/Premium';
import { useAuth } from './hooks/useAuth';
import { useWallet } from './hooks/useWallet';
import { Activity, Database, Zap, ExternalLink, ShieldAlert } from 'lucide-react';

// Demo data
const DEMO_ASSET_TYPES = [
  "Stocks / ETFs",
  "Crypto Assets", 
  "Gold & Silver",
  "Real Estate",
  "Fixed Income",
  "NFTs"
];

// =============================================================================
// SECURITY: Demo Mode Guard Component
// Prevents confusion between demo and production modes
// =============================================================================

interface DemoModeGuardProps {
  isDemoMode: boolean;
  children: React.ReactNode;
}

const DemoModeGuard: React.FC<DemoModeGuardProps> = ({ isDemoMode, children }) => {
  if (!isDemoMode) return <>{children}</>;
  
  return (
    <div className="relative">
      {/* Watermark overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-10">
        <div className="text-9xl font-bold text-warning rotate-[-45deg]">
          DEMO MODE
        </div>
      </div>
      
      {/* Persistent banner */}
      <div className="sticky top-0 z-40 bg-warning/90 text-warning-foreground px-4 py-2 text-center font-medium">
        <ShieldAlert className="inline w-4 h-4 mr-2" />
        ⚠️ DEMO MODE ACTIVE - No real blockchain transactions will occur. 
        Data is simulated for demonstration purposes only.
      </div>
      
      {children}
    </div>
  );
};

// =============================================================================
// SECURITY: Blockchain Transaction Button with Demo Check
// =============================================================================

interface TransactionButtonProps {
  isDemoMode: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const TransactionButton: React.FC<TransactionButtonProps> = ({ 
  isDemoMode, 
  onClick, 
  children,
  className = '',
  variant = 'primary'
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleClick = () => {
    if (isDemoMode) {
      setShowConfirm(true);
      return;
    }
    onClick();
  };
  
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = variant === 'primary' 
    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70" 
    : "bg-card border border-border text-textPrimary hover:bg-card/80";
  
  return (
    <>
      <button 
        onClick={handleClick}
        className={`${baseStyles} ${variantStyles} ${isDemoMode ? 'opacity-75' : ''} ${className}`}
        disabled={isDemoMode}
      >
        {isDemoMode ? <Zap className="w-4 h-4" /> : null}
        {isDemoMode ? "🔒 Demo Mode - Action Disabled" : children}
      </button>
      
      {/* Demo mode info modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-warning/20 rounded-full">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-textPrimary">Demo Mode Active</h3>
                <p className="text-sm text-textMuted">Blockchain interactions disabled</p>
              </div>
            </div>
            
            <p className="text-textSecondary mb-4">
              This action is disabled in demo mode. Connect your wallet to anchor real portfolio data to the blockchain on Polygon Amoy or Base Sepolia testnets.
            </p>
            
            <div className="bg-surface/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-textMuted">
                <strong>Demo mode features:</strong>
              </p>
              <ul className="text-sm text-textSecondary mt-2 space-y-1">
                <li>• Simulated data storage</li>
                <li>• No real blockchain transactions</li>
                <li>• UI/UX preview only</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                Stay in Demo Mode
              </button>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Switch to Live Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// =============================================================================
// Mode Switching Confirmation Dialog
// =============================================================================

interface ModeSwitcherProps {
  isDemoMode: boolean;
  onToggle: () => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ isDemoMode, onToggle }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleToggle = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onToggle();
    setShowConfirm(false);
  };
  
  return (
    <>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isDemoMode 
            ? 'bg-warning/20 text-warning hover:bg-warning/30' 
            : 'bg-success/20 text-success hover:bg-success/30'
        }`}
      >
        <Zap className="w-4 h-4" />
        {isDemoMode ? 'Demo' : 'Live'}
      </button>
      
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${isDemoMode ? 'bg-success/20' : 'bg-warning/20'}`}>
                {isDemoMode ? (
                  <Zap className="w-6 h-6 text-success" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-warning" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  {isDemoMode ? 'Switch to Live Mode?' : 'Switch to Demo Mode?'}
                </h3>
              </div>
            </div>
            
            <p className="text-textSecondary mb-4">
              {isDemoMode 
                ? 'You are about to switch to live mode. This will connect to the blockchain and all transactions will be real. You will need a wallet connected to Polygon Amoy or Base Sepolia testnet.'
                : 'You are about to switch to demo mode. No real blockchain transactions will occur. All data will be simulated for demonstration purposes.'
              }
            </p>
            
            {isDemoMode && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-danger">
                  <strong>⚠️ Warning:</strong> Live mode requires actual cryptocurrency for gas fees.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleToggle}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isDemoMode 
                    ? 'bg-success text-success-foreground hover:bg-success/90' 
                    : 'bg-warning text-warning-foreground hover:bg-warning/90'
                }`}
              >
                {isDemoMode ? 'Switch to Live' : 'Switch to Demo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { 
    isConnected: walletConnected, 
    address: walletAddress,
    networkName,
    connect: connectWallet,
    isMetaMaskInstalled 
  } = useWallet();
  
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'portfolio' | 'analytics' | 'alerts' | 'verify' | 'premium'>('dashboard');
  const [demoLoading, setDemoLoading] = useState(true);

  // Demo mode loading effect
  useEffect(() => {
    if (isDemoMode && !user) {
      setTimeout(() => {
        setDemoLoading(false);
      }, 1500);
    } else {
      setDemoLoading(false);
    }
  }, [isDemoMode, user]);

  // Determine connection state
  const isConnected = isDemoMode || walletConnected || !!user;
  const displayAddress = isDemoMode 
    ? 'demo-user' 
    : walletAddress 
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
      : null;
  const displayNetwork = isDemoMode ? 'Demo Mode' : networkName || 'Unknown';
  const dataSource = isDemoMode ? 'Demo Mode' : (walletConnected ? 'Supabase + Web3' : 'Supabase');

  const handleConnect = async () => {
    if (isDemoMode) {
      // Demo mode - no wallet needed
      return;
    }

    if (!walletConnected && isMetaMaskInstalled) {
      await connectWallet();
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const renderContent = () => {
    if (!isConnected) {
      return <Splash 
        onConnect={handleConnect} 
        isDemoMode={isDemoMode}
        onToggleDemoMode={toggleDemoMode}
        isMetaMaskInstalled={isMetaMaskInstalled}
      />;
    }

    // Use demo loading for demo mode initial load
    const loading = isDemoMode ? demoLoading : authLoading;

    switch (currentView) {
      case 'portfolio':
        return <Portfolio isDemoMode={isDemoMode} />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'verify':
        return <Verify />;
      case 'premium':
        return <Premium />;
      case 'dashboard':
      default:
        return (
          <Dashboard 
            assetTypes={DEMO_ASSET_TYPES} 
            loading={loading} 
            isDemoMode={isDemoMode}
          />
        );
    }
  };

  return (
    <DemoModeGuard isDemoMode={isDemoMode}>
      <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary selection:bg-success/30">
        <Header 
          onNavigate={setCurrentView} 
          currentView={currentView}
          isConnected={isConnected}
          address={displayAddress}
          network={displayNetwork}
          isDemoMode={isDemoMode}
          onToggleDemoMode={toggleDemoMode}
          ModeSwitcher={() => <ModeSwitcher isDemoMode={isDemoMode} onToggle={toggleDemoMode} />}
        />
        
        <main className="container mx-auto px-4 py-8">
          {renderContent()}
        </main>

        {/* System Status Footer - Glassmorphism */}
        <div className="fixed bottom-4 right-4 backdrop-blur-xl bg-card/80 border border-border rounded-xl p-4 shadow-card-glow w-64">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-success" />
              <p className="text-sm font-medium text-textPrimary">System Status</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-textMuted">Connection</span>
              <span className={`font-medium ${isConnected ? 'text-success' : 'text-danger'}`}>
                {isConnected ? displayNetwork : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-textMuted flex items-center gap-1">
                <Database className="w-3 h-3" /> Data Source
              </span>
              <span className={`font-medium ${isDemoMode ? 'text-warning' : 'text-info'}`}>
                {dataSource}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-textMuted flex items-center gap-1">
                <Zap className="w-3 h-3" /> Latency
              </span>
              <span className="font-medium text-textPrimary">~120ms</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <button className="flex items-center justify-center w-full text-xs text-textMuted hover:text-textPrimary transition-colors py-1">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Network Status
            </button>
          </div>
        </div>
      </div>
    </DemoModeGuard>
  );
}

export default App;
