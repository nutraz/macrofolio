import React from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";

import { usePortfolio } from "../context/PortfolioContext";
import AssetFormModal from "../components/AssetFormModal";

function typeLabel(type: string) {
  switch (type) {
    case "stocks":
      return "Stock";
    case "etf":
      return "ETF";
    case "crypto":
      return "Crypto";
    case "gold":
      return "Commodity";
    case "real_estate":
      return "Real Estate";
    case "fixed_income":
      return "Fixed Income";
    default:
      return type;
  }
}

function stableChangePercent(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  }
  const r = (hash % 800) / 100; // 0..7.99
  return Number((r - 4).toFixed(1)); // -4.0..+4.0
}

function getTypeBadgeColor(type: string) {
  switch (type) {
    case "Stock":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Crypto":
      return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "ETF":
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "Commodity":
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    case "Real Estate":
      return "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30";
    case "Fixed Income":
      return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
  }
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const headers = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set<string>())
  );
  const escape = (v: unknown) => {
    const str = v === null || v === undefined ? "" : String(v);
    if (/[\",\n]/.test(str)) return `"${str.replace(/\"/g, '""')}"`;
    return str;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const AssetsTable: React.FC<{ isDemoMode?: boolean }> = ({ isDemoMode = true }) => {
  const { assets, addAsset, updateAsset, deleteAsset } = usePortfolio();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const editingAsset = React.useMemo(() => assets.find((a) => a.id === editingId) || null, [assets, editingId]);

  const totalValue = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);

  const exportRows = React.useMemo(
    () =>
      assets.map((a) => ({
        Name: a.name,
        Symbol: a.symbol,
        Type: typeLabel(a.type),
        Quantity: a.quantity,
        CurrentPrice: a.currentPrice,
        PurchasePrice: a.purchasePrice,
        PurchaseDate: a.purchaseDate,
        Notes: a.notes || "",
      })),
    [assets]
  );

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-card-glow animate-fade-in">
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-textPrimary transition-colors hover:text-white">Your Assets</h2>
          <p className="text-textMuted text-sm flex items-center gap-2">
            Track all your holdings in one place
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                <Zap className="w-3 h-3" />
                Demo
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-bg/50 rounded-xl px-4 py-3 border border-border transition-all duration-200 hover:bg-bg/70">
          <p className="text-textMuted text-xs uppercase tracking-wide">Total Value</p>
          <p className="text-2xl font-bold text-textPrimary transition-transform duration-200 hover:scale-105">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full" role="grid" aria-label="Assets table">
          <thead className="bg-bg/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Asset
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                24h Change
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                Actions
              </th>
              {!isDemoMode && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">
                  Status
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {assets.map((asset) => {
              const value = asset.quantity * asset.currentPrice;
              const change24h = stableChangePercent(asset.symbol);
              const badgeType = typeLabel(asset.type);

              return (
                <tr key={asset.id} className="interactive-row" tabIndex={0} role="row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-border transition-transform duration-200 hover:scale-110">
                        <span className="font-bold text-blue-400">{asset.symbol.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-textPrimary transition-colors hover:text-white">{asset.name}</div>
                        <div className="text-sm text-textMuted">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(badgeType)}`}>
                      {badgeType}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">{asset.quantity.toLocaleString()}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-textPrimary transition-colors hover:text-white">
                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        change24h >= 0
                          ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
                          : "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
                      }`}
                    >
                      {change24h >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {change24h >= 0 ? "+" : ""}
                      {change24h}%
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
                        aria-label={`Edit ${asset.symbol}`}
                        onClick={() => {
                          setEditingId(asset.id);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        className="p-2 rounded-lg hover:bg-danger/10 text-textMuted hover:text-danger transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
                        aria-label={`Delete ${asset.symbol}`}
                        onClick={async () => {
                          const ok = window.confirm(`Delete ${asset.name} (${asset.symbol})?`);
                          if (!ok) return;
                          await deleteAsset(asset.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  {!isDemoMode && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-info/10 text-info text-xs font-medium rounded-full border border-info/20">
                        <ExternalLink className="w-3 h-3" />
                        Verify
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-bg/50 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-textMuted text-sm transition-colors hover:text-textPrimary">
            <AlertCircle className="w-4 h-4" />
            <span>
              Showing {assets.length} assets • {isDemoMode ? "Demo data" : "Last anchored: Just now"}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              className="btn-ghost px-4 py-2 text-sm flex items-center transition-all duration-200 hover:bg-cardHover"
              aria-label="Export data to CSV"
              onClick={() => downloadCsv("macrofolio-assets.csv", exportRows)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              className="btn-primary px-4 py-2 text-sm flex items-center transition-all duration-200"
              aria-label="Add new asset"
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>
        </div>
      </div>

      <AssetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editingAsset}
        onSubmit={async (draft) => {
          if (editingAsset) {
            await updateAsset(editingAsset.id, draft);
          } else {
            await addAsset(draft);
          }
        }}
      />
    </div>
  );
};

export default AssetsTable;

