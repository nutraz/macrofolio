import React from 'react';

interface AnalyticsProps {
  // Add props if needed
}

const Analytics: React.FC<AnalyticsProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Analytics</h1>
        <p className="text-gray-400">Deep insights into your portfolio performance.</p>
        
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Performance Metrics</h3>
            <p className="text-gray-400">ROI, Sharpe ratio, and other key metrics.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Risk Analysis</h3>
            <p className="text-gray-400">Portfolio volatility and risk assessment.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Correlation Matrix</h3>
            <p className="text-gray-400">Understand how your assets move together.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
