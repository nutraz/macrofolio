// macrofolio/src/macrofolio_assets/src/sections/AssetsTable.tsx
import React from 'react';

interface Asset {
  id: number;
  name: string;
  type: string;
  quantity: number;
  price: number;
  value: number;
  change: number;
}

const AssetsTable: React.FC = () => {
  const assets: Asset[] = [
    { id: 1, name: 'Apple Inc.', type: 'Stock', quantity: 10, price: 182.63, value: 1826.30, change: 2.5 },
    { id: 2, name: 'Bitcoin', type: 'Crypto', quantity: 0.5, price: 42580.00, value: 21290.00, change: 3.2 },
    { id: 3, name: 'Gold', type: 'Commodity', quantity: 50, price: 64.28, value: 3214.00, change: -0.5 },
    { id: 4, name: 'Vanguard S&P 500', type: 'ETF', quantity: 25, price: 415.32, value: 10383.00, change: 1.8 },
    { id: 5, name: 'Tesla Inc.', type: 'Stock', quantity: 5, price: 218.89, value: 1094.45, change: -1.2 },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Your Assets</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-semibold text-blue-600">{asset.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    asset.type === 'Crypto' ? 'bg-purple-100 text-purple-800' :
                    asset.type === 'Stock' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${asset.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${asset.value.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">Showing {assets.length} assets</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add New Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsTable;
