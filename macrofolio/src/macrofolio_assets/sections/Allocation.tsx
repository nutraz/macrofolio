// macrofolio/src/macrofolio_assets/src/sections/Allocation.tsx
import React from 'react';

const Allocation: React.FC = () => {
  const allocations = [
    { name: 'Stocks', value: 45, color: 'bg-blue-500' },
    { name: 'Crypto', value: 30, color: 'bg-purple-500' },
    { name: 'Gold', value: 15, color: 'bg-yellow-500' },
    { name: 'Real Estate', value: 10, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-48 h-48 relative mb-4 md:mb-0 md:mr-8">
          {/* Pie chart visualization */}
          <div className="w-full h-full rounded-full relative overflow-hidden">
            {allocations.reduce((acc, allocation, index) => {
              const prevPercent = acc;
              const percent = allocation.value;
              return (
                <React.Fragment key={allocation.name}>
                  <div
                    className={`absolute inset-0 ${allocation.color}`}
                    style={{
                      clipPath: `conic-gradient(from ${prevPercent * 3.6}deg, transparent 0, transparent ${percent * 3.6}deg, currentColor ${percent * 3.6}deg)`,
                    }}
                  />
                  {acc + percent}
                </React.Fragment>
              );
            }, 0)}
          </div>
        </div>
        <div className="flex-1">
          <div className="space-y-4">
            {allocations.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 ${item.color} rounded mr-3`}></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Value</span>
              <span className="font-semibold">$124,580.25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allocation;
