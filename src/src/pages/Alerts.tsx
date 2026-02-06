import React from 'react';

interface AlertsProps {
  // Add props if needed
}

const Alerts: React.FC<AlertsProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Smart Alerts</h1>
        <p className="text-gray-400">Get notified about important portfolio events.</p>
        
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Price Alerts</h3>
            <p className="text-gray-400">Set alerts for price movements and thresholds.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Portfolio Alerts</h3>
            <p className="text-gray-400">Notifications for allocation changes and trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
