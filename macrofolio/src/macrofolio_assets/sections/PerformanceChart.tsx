// macrofolio/src/macrofolio_assets/src/sections/PerformanceChart.tsx
import React from 'react';

const PerformanceChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-500">Performance chart will appear here</p>
        {/* In a real app, you would integrate with a charting library like Recharts or Chart.js */}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-lg font-semibold text-green-600">+2.5%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-lg font-semibold text-green-600">+5.1%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-lg font-semibold text-red-600">-1.2%</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
