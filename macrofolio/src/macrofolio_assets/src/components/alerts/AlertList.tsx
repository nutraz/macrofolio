import React, { useState } from 'react';
import { Alert } from '../../lib/types/alert';
import AlertCard from './AlertCard';
import { Bell, Filter, Search, ArrowUpDown } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (alert: Alert) => void;
  assetPrices?: Record<string, number>;
}

const AlertList: React.FC<AlertListProps> = ({ alerts, onToggle, onDelete, onEdit, assetPrices = {} }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter === 'all') return true;
      return alert.status === filter;
    })
    .filter(alert => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        alert.assetName.toLowerCase().includes(searchLower) ||
        alert.assetSymbol.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const triggeredCount = alerts.filter(a => a.status === 'triggered').length;
  const pausedCount = alerts.filter(a => a.status === 'paused').length;

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cardHover/50 border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', count: alerts.length },
            { key: 'active', label: 'Active', count: activeCount },
            { key: 'triggered', label: 'Triggered', count: triggeredCount },
            { key: 'paused', label: 'Paused', count: pausedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-cardHover/50 text-textSecondary hover:bg-cardHover'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 bg-cardHover rounded text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="pl-10 pr-8 py-2.5 bg-cardHover/50 border border-border rounded-lg text-textPrimary focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="price">Price</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Bell className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-textPrimary">{alerts.length}</p>
              <p className="text-sm text-textMuted">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Bell className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-textPrimary">{activeCount}</p>
              <p className="text-sm text-textMuted">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Filter className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-textPrimary">{triggeredCount}</p>
              <p className="text-sm text-textMuted">Triggered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-textPrimary mb-2">No alerts found</h3>
          <p className="text-textMuted">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first alert to get notified of price changes'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              currentPrice={assetPrices[alert.assetId]}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertList;

