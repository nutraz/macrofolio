import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'portfolio' | 'analytics' | 'alerts'>('dashboard');

  useEffect(() => {
    const mockAssetTypes = [
      "Stocks / ETFs",
      "Crypto Assets", 
      "Gold & Silver",
      "Real Estate",
      "Fixed Income",
      "NFTs"
    ];
    
    setTimeout(() => {
      setAssetTypes(mockAssetTypes);
      setLoading(false);
    }, 1500);
  }, []);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const renderContent = () => {
    if (!isConnected) {
      return <Splash onConnect={handleConnect} />;
    }

    switch (currentView) {
      case 'portfolio':
        return <Portfolio />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'dashboard':
      default:
        return <Dashboard assetTypes={assetTypes} loading={loading} />;
    }
  };

  // Inline styles as fallback
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: 'white',
  };

  return (
    <div style={containerStyle}>
      <Header onNavigate={setCurrentView} currentView={currentView} />
      
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* System Status Footer */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: '#1f2937',
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '0.75rem',
            height: '0.75rem',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444'
          }}></div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>System Status</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {isConnected ? 'Connected to ICP' : 'Disconnected'}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #374151' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Backend Connection</p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: assetTypes.length > 0 ? '#34d399' : '#fbbf24'
          }}>
            {loading ? 'Connecting...' : 'Using Demo Data'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
