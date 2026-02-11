import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Verify from './pages/Verify';
import Premium from './pages/Premium';
import { ToastProvider } from './components/Toast';
import { useAuth } from './hooks/useAuth';
import { useWallet } from './hooks/useWallet';
import { PortfolioProvider } from './context/PortfolioContext';

import { Activity, Database, Zap, ExternalLink, ShieldAlert } from 'lucide-react';

// Demo data
const DEMO_ASSET_TYPES = ['Stocks / ETFs', 'Crypto Assets', 'Gold & Silver', 'Real Estate', 'Fixed Income', 'NFTs'];

interface DemoModeGuardProps {
  isDemoMode: boolean;
  children: React.ReactNode;
}

const DemoModeGuard: React.FC<DemoModeGuardProps> = ({ isDemoMode, children }) => {
  if (!isDemoMode) return <>{children}</>;

  return (
    <div className="relative">
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-10">
        <div className="text-9xl font-bold text-warning rotate-[-45deg]">DEMO MODE</div>
      </div>

      <div className="sticky top-0 z-40 bg-warning/90 text-warning-foreground px-4 py-2 text-center font-medium">
        <ShieldAlert className="inline w-4 h-4 mr-2" />
        ⚠️ DEMO MODE ACTIVE - No real blockchain transactions will occur. Data is simulated for demonstration purposes
        only.
      </div>

      {children}
    </div>
  );
};

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
          isDemoMode ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-success/20 text-success hover:bg-success/30'
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
                {isDemoMode ? <Zap className="w-6 h-6 text-success" /> : <ShieldAlert className="w-6 h-6 text-warning" />}
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
                : 'You are about to switch to demo mode. No real blockchain transactions will occur. All data will be simulated for demonstration purposes.'}
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

interface WalletData {
  isConnected: boolean;
  address: string | null;
  networkName: string | null;
  connect: () => Promise<unknown>;
  isMetaMaskInstalled: boolean;
  loading: boolean;
}

const WalletProviderContent: React.FC<{
  onWalletData: (walletData: WalletData) => React.ReactNode;
}> = ({ onWalletData }) => {
  const {
    isConnected: walletConnected,
    address: walletAddress,
    networkName,
    connect: connectWallet,
    isMetaMaskInstalled,
    loading: walletLoading,
  } = useWallet();

  return onWalletData({
    isConnected: walletConnected,
    address: walletAddress,
    networkName,
    connect: connectWallet,
    isMetaMaskInstalled,
    loading: walletLoading,
  });
};

const AppContent: React.FC<{
  walletData: WalletData;
}> = ({ walletData }) => {
  const { user, loading: authLoading } = useAuth();
  const {
    isConnected: walletConnected,
    address: walletAddress,
    networkName,
    connect: connectWallet,
    isMetaMaskInstalled,
    loading: walletLoading,
  } = walletData;

  const [isDemoMode, setIsDemoMode] = useState(() => {
    const demoMode = import.meta.env.VITE_DEMO_MODE;
    return demoMode !== 'false';
  });
  const [currentView, setCurrentView] = useState<'dashboard' | 'portfolio' | 'analytics' | 'alerts' | 'verify' | 'premium'>(
    'dashboard',
  );
  const [demoLoading, setDemoLoading] = useState(true);
  const [isLandingPage, setIsLandingPage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParams = ['ref', 'share', 'invite', 'referral', 'landing'];
    if (shareParams.some((param) => params.has(param))) setIsLandingPage(true);
  }, []);

  useEffect(() => {
    if (isDemoMode && !user) {
      const t = setTimeout(() => setDemoLoading(false), 1500);
      return () => clearTimeout(t);
    }
    setDemoLoading(false);
  }, [isDemoMode, user]);

  const isConnected = isLandingPage ? false : isDemoMode || walletConnected || !!user;

  const displayAddress = isDemoMode
    ? 'demo-user'
    : walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : null;

  const displayNetwork = isDemoMode ? 'Demo Mode' : networkName || 'Unknown';
  const dataSource = isDemoMode ? 'Demo Mode' : walletConnected ? 'Supabase + Web3' : 'Supabase';

  const handleConnectMetaMask = async () => {
    if (isDemoMode) return;
    if (!walletConnected && isMetaMaskInstalled) await connectWallet();
  };

  const toggleDemoMode = () => setIsDemoMode(!isDemoMode);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Splash
          onConnectMetaMask={handleConnectMetaMask}
          isDemoMode={isDemoMode}
          onToggleDemoMode={toggleDemoMode}
          isMetaMaskInstalled={isMetaMaskInstalled}
          walletLoading={walletLoading}
        />
      );
    }

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
        return <Dashboard assetTypes={DEMO_ASSET_TYPES} loading={loading} isDemoMode={isDemoMode} />;
    }
  };

  return (
    <DemoModeGuard isDemoMode={isDemoMode}>
      <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary selection:bg-success/30">
        <Header
          onNavigate={setCurrentView}
          currentView={currentView}
          address={displayAddress}
          network={displayNetwork}
          isDemoMode={isDemoMode}
          onToggleDemoMode={toggleDemoMode}
          ModeSwitcher={() => <ModeSwitcher isDemoMode={isDemoMode} onToggle={toggleDemoMode} />}
        />

        <main className="container mx-auto px-4 py-8">{renderContent()}</main>

        <div className="fixed bottom-4 right-4 backdrop-blur-xl bg-card/80 border border-border rounded-xl p-4 shadow-card-glow w-64">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-success" />
              <p className="text-sm font-medium text-textPrimary">System Status</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
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
              <span className={`font-medium ${isDemoMode ? 'text-warning' : 'text-info'}`}>{dataSource}</span>
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
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WalletProviderContent
          onWalletData={(walletData) => (
            <PortfolioProvider isDemoMode={true}>
              <AppContent walletData={walletData} />
            </PortfolioProvider>
          )}
        />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

