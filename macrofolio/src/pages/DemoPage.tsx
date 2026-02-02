import React, { useState, useEffect } from 'react';
import Dashboard from '../pages/Dashboard'; // Assuming Dashboard is in the same directory or adjust path
import Splash from '../pages/Splash';

interface DemoPageProps {
  isConnected: boolean;
  handleConnect: () => void;
  assetTypes: string[];
  loading: boolean;
}

const DemoPage: React.FC<DemoPageProps> = ({ isConnected, handleConnect, assetTypes, loading }) => {
  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-8">
        <p className="text-gray-300 text-lg mb-4">
          Welcome to the Macrofolio Web Demo! This demonstration showcases the core features of the application using mock data. It's designed to give you a quick overview of portfolio tracking and analytics without requiring real blockchain interaction.
        </p>
        {!isConnected && (
          <button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Connect Wallet (Demo)
          </button>
        )}
      </div>
      {isConnected ? (
        <Dashboard assetTypes={assetTypes} loading={loading} />
      ) : (
        <Splash onConnect={handleConnect} />
      )}
    </>
  );
};

export default DemoPage;
