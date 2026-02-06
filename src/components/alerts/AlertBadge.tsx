import React from 'react';
import { Bell } from 'lucide-react';

interface AlertBadgeProps {
  count: number;
  onClick?: () => void;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center"
    >
      <Bell className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full transform scale-90">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};

export default AlertBadge;

