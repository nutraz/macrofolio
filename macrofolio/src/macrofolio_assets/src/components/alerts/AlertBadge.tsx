import React from 'react';
import { Bell } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';

interface AlertBadgeProps {
  onClick?: () => void;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ onClick }) => {
  const { triggeredAlerts } = useAlerts();
  const count = triggeredAlerts.length;

  if (count === 0) {
    return (
      <button
        onClick={onClick}
        className="relative p-2 hover:bg-cardHover rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-textMuted" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-cardHover rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5 text-warning animate-bounce" />
      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-danger text-danger-foreground text-xs font-bold rounded-full animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};

export default AlertBadge;

