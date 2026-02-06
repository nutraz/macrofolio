import React from 'react';

interface DashboardLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DashboardLogo: React.FC<DashboardLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-lg`}>
        <img 
          src="/ChatGPT Image Jan 18, 2026, 05_03_10 PM.png" 
          alt="Macrofolio Logo" 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = `w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`;
              fallback.innerHTML = '<span class="font-bold text-white">M</span>';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    </div>
  );
};

export default DashboardLogo;

