import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import DemoPage from './pages/DemoPage'; // Import the new DemoPage

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Determine currentView based on location for Header
  const currentView = location.pathname.substring(1) || 'dashboard'; // Remove leading '/'

  // Inline styles as fallback
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: 'white',
  };

  return (
    <div style={containerStyle}>
      <Header onNavigate={(view) => navigate('/' + view)} currentView={currentView} />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={isConnected ? <Dashboard assetTypes={assetTypes} loading={loading} /> : <Splash onConnect={handleConnect} />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/demo" element={<DemoPage isConnected={isConnected} handleConnect={handleConnect} assetTypes={assetTypes} loading={loading} />} />
        </Routes>
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
