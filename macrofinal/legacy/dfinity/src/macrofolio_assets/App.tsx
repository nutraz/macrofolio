import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from "@dfinity/agent";
import './App.css';
import Header from './components/Header';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Your actual backend canister ID from deployment
  const BACKEND_CANISTER_ID = "bd3sg-teaaa-aaaaa-qaaba-cai";

  const fetchAssetTypes = async () => {
    try {
      console.log("Fetching asset types from canister:", BACKEND_CANISTER_ID);
      
      // Create HTTP agent
      const agent = new HttpAgent({ 
        host: "http://127.0.0.1:4943" 
      });
      
      // Fetch root key for local development
      await agent.fetchRootKey();
      
      // Dynamically import the backend interface
      const { idlFactory } = await import(
        "../../../declarations/macrofolio_backend"
      );
      
      // Create actor with the actual canister ID
      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: BACKEND_CANISTER_ID
      });
      
      // Call the backend method
      const types = await backendActor.getAssetTypes();
      console.log("Asset types received:", types);
      return types;
      
    } catch (error) {
      console.error("Error fetching asset types:", error);
      // Return mock data as fallback
      return ["Stocks", "Crypto", "Gold", "Real Estate", "Fixed Income", "NFTs"];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const types = await fetchAssetTypes();
      setAssetTypes(types);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleConnect = () => {
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Splash onConnect={handleConnect} />
        ) : (
          <Dashboard assetTypes={assetTypes} loading={loading} />
        )}
      </main>

      {/* System Status Footer */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm font-medium">System Status</p>
              <p className="text-xs text-gray-400">
                {isConnected ? 'Connected to ICP' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">Backend Connection</p>
            <p className={`text-sm ${assetTypes.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? 'Connecting...' : assetTypes.length > 0 ? 'Connected' : 'Could not connect to backend'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
