import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Verify from './pages/Verify';
import { useAuth } from './hooks/useAuth';
import { useWallet } from './hooks/useWallet';
import { Activity, Database, Zap, ExternalLink } from 'lucide-react';

// Demo data
const DEMO_ASSET_TYPES = [
  "Stocks / ETFs",
  "Crypto Assets", 
  "Gold & Silver",
  "Real Estate",
  "Fixed Income",
  "NFTs"
];

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'portfolio' | 'analytics' | 'alerts' | 'verify'>('dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary selection:bg-success/30">
      <Header 
        onNavigate={setCurrentView} 
        currentView={currentView}
        isConnected={isConnected}
        address={displayAddress}
        network={displayNetwork}
        isDemoMode={isDemoMode}
        onToggleDemoMode={toggleDemoMode}
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
  );
}

export default App;
