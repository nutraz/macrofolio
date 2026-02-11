import React from "react";
import { X } from "lucide-react";
import type { Asset } from "../context/PortfolioContext";

type DraftAsset = Omit<Asset, "id">;

const TYPE_OPTIONS: Array<{ value: Asset["type"]; label: string }> = [
  { value: "stocks", label: "Stocks" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "gold", label: "Gold" },
  { value: "real_estate", label: "Real Estate" },
  { value: "fixed_income", label: "Fixed Income" },
];

function safeNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function defaultDraft(): DraftAsset {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return {
    name: "",
    symbol: "",
    type: "crypto",
    quantity: 0,
    currentPrice: 0,
    purchasePrice: 0,
    purchaseDate: `${yyyy}-${mm}-${dd}`,
    notes: "",
    isPremium: false,
  };
}

interface AssetFormModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Asset | null;
  onSubmit: (draft: DraftAsset) => Promise<void> | void;
}

export default function AssetFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: AssetFormModalProps) {
  const [draft, setDraft] = React.useState<DraftAsset>(defaultDraft());
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (initial) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = initial;
      setDraft({ ...defaultDraft(), ...rest });
    } else {
      setDraft(defaultDraft());
    }
  }, [open, initial]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (!draft.symbol.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...draft,
        name: draft.name.trim(),
        symbol: draft.symbol.trim().toUpperCase(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">
              {isEdit ? "Edit asset" : "Add asset"}
            </h3>
            <p className="text-sm text-textMuted">
              {isEdit ? "Update your holding details." : "Track a new holding in your portfolio."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <div className="text-xs text-textMuted">Name</div>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                placeholder="Bitcoin"
                required
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-textMuted">Symbol</div>
              <input
                value={draft.symbol}
                onChange={(e) => setDraft((d) => ({ ...d, symbol: e.target.value }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                placeholder="BTC"
                required
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-textMuted">Type</div>
              <select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as Asset["type"] }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-textMuted">Purchase date</div>
              <input
                type="date"
                value={draft.purchaseDate}
                onChange={(e) => setDraft((d) => ({ ...d, purchaseDate: e.target.value }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                required
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-textMuted">Quantity</div>
              <input
                inputMode="decimal"
                value={String(draft.quantity)}
                onChange={(e) => setDraft((d) => ({ ...d, quantity: safeNumber(e.target.value) }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                placeholder="0.5"
              />
            </label>

            <label className="space-y-1">
              <div className="text-xs text-textMuted">Current price</div>
              <input
                inputMode="decimal"
                value={String(draft.currentPrice)}
                onChange={(e) => setDraft((d) => ({ ...d, currentPrice: safeNumber(e.target.value) }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                placeholder="70000"
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <div className="text-xs text-textMuted">Purchase price</div>
              <input
                inputMode="decimal"
                value={String(draft.purchasePrice)}
                onChange={(e) => setDraft((d) => ({ ...d, purchasePrice: safeNumber(e.target.value) }))}
                className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40"
                placeholder="42000"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <div className="text-xs text-textMuted">Notes (optional)</div>
            <textarea
              value={draft.notes || ""}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              className="w-full bg-bg/40 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-success/40 min-h-[84px]"
              placeholder="e.g. long-term hold"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost text-sm" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary text-sm" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Add asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

