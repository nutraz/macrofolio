import React from "react";
import { Zap } from "lucide-react";
import AssetsTable from "../sections/AssetsTable";

interface PortfolioProps {
  isDemoMode?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isDemoMode = true }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Portfolio</h1>
          <p className="text-textMuted mt-1 flex items-center gap-2">
            Add, edit, and delete assets.
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                <Zap className="w-3 h-3" />
                Demo
              </span>
            )}
          </p>
        </div>
      </div>

      <AssetsTable isDemoMode={isDemoMode} />
    </div>
  );
};

export default Portfolio;

