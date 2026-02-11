import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, X } from "lucide-react";

interface ShareQrModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
}

export default function ShareQrModal({ open, onClose, url }: ShareQrModalProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share Macrofolio"
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">Open on your phone</h3>
            <p className="text-sm text-textMuted">Scan the QR to launch Macrofolio.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-xl p-4 ring-1 ring-black/5">
              <QRCodeSVG value={url} size={208} includeMargin />
            </div>
          </div>

          {isLocalhost && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-sm text-textSecondary">
              You’re running on <span className="font-medium text-warning">localhost</span>. Your phone
              can’t open this unless the dev server is exposed on your LAN (e.g. run Vite with{" "}
              <code className="px-1 py-0.5 bg-bg/60 rounded border border-border">--host</code>) and you
              scan the LAN URL.
            </div>
          )}

          <div className="bg-bg/40 border border-border rounded-xl p-3">
            <div className="text-xs text-textMuted mb-1">Link</div>
            <div className="text-sm text-textPrimary break-all">{url}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

