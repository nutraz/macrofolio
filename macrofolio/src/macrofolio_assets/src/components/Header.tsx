import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Settings, Bell, Search, Menu, X, Zap, CheckCircle, Crown, Globe, Fingerprint } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  address: string | null;
  network: string | null;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  ModeSwitcher?: () => React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  address,
  network,
  isDemoMode,
  onToggleDemoMode,
  ModeSwitcher,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'verify', label: 'Verify', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'premium', label: 'Premium', icon: Crown, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo - Brand Block */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative group">
                {/* Enhanced logo with visible glow and ring border */}
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img 
                  src="/logo.png" 
                  alt="Macrofolio Logo" 
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl ring-1 ring-primary/40 drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl ring-1 ring-primary/40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-transform duration-300 hover:scale-105';
                      fallback.innerHTML = '<span class="font-bold text-white text-xl">M</span>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="hidden sm:block leading-tight">
                <h1 className="text-lg font-semibold text-textPrimary transition-colors hover:text-white">Macrofolio</h1>
                <p className="text-xs text-textMuted">Portfolio Tracker</p>
              </div>
            </div>
          </div>

          {/* Center: Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-card/50 rounded-xl p-1 border border-border/50" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate('/' + item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50 flex items-center gap-2 ${
                  currentView === item.id
                    ? 'bg-border text-textPrimary shadow-lg'
                    : 'text-textMuted hover:text-textPrimary hover:bg-border/50 active:scale-[0.98]'
                } ${item.highlight ? 'bg-gradient-to-r from-warning/20 to-orange-500/20 border border-warning/30 hover:from-warning/30 hover:to-orange-500/30' : ''}`}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.icon && <item.icon className={`w-4 h-4 ${item.highlight ? 'text-warning' : ''}`} />}
                {item.label}
                {item.highlight && <span className="text-xs text-warning ml-1">★</span>}
              </button>
            ))}
          </nav>

          {/* Right: System Status Cluster & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mode Switcher (from App.tsx) */}
            {ModeSwitcher && (
              <div className="hidden md:block">
                <ModeSwitcher />
              </div>
            )}

            {/* Demo Mode Toggle (fallback if ModeSwitcher not provided) */}
            {!ModeSwitcher && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg/50 rounded-lg border border-border/50">
                <Zap className={`w-4 h-4 ${isDemoMode ? 'text-warning' : 'text-success'}`} />
                <span className={`text-xs font-medium ${isDemoMode ? 'text-warning' : 'text-success'}`}>
                  {isDemoMode ? 'Demo' : 'Live'}
                </span>
                <button
                  onClick={onToggleDemoMode}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    isDemoMode ? 'bg-warning/30' : 'bg-success/30'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    isDemoMode ? 'left-0.5' : 'left-auto right-0.5'
                  }`} />
                </button>
              </div>
            )}

            {/* Search (decorative) */}
            <div className="hidden md:flex items-center bg-card/50 rounded-lg px-3 py-1.5 border border-border/50 transition-all duration-200 focus-within:border-success/30">
              <Search className="w-4 h-4 text-textMuted mr-2 transition-colors focus-within:text-success" />
              <input 
                type="text" 
                placeholder="Search..." 
                aria-label="Search"
                className="bg-transparent border-none outline-none text-sm text-textMuted placeholder-textMuted w-32 focus:w-48 transition-all focus:text-textPrimary"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <button 
                className="relative p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
                aria-label="Notifications - 1 unread"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full animate-pulse" aria-hidden="true"></span>
              </button>

              {/* Settings */}
              <button 
                className="p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-border mx-1"></div>

              {/* User Status Cluster */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-textPrimary">
                    {isDemoMode 
                      ? 'Demo User' 
                      : address || 'User'
                    }
                  </p>
                  <p className={`text-xs ${isDemoMode ? 'text-warning' : 'text-success'}`}>
                    {isDemoMode 
                      ? 'Demo Mode' 
                      : network || 'Connected'
                    }
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 ${
                  isDemoMode 
                    ? 'bg-warning/10 border border-warning/20' 
                    : 'bg-success/10 border border-success/20'
                } rounded-lg transition-all duration-200 ${
                  isDemoMode ? 'hover:bg-warning/20' : 'hover:bg-success/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isDemoMode ? 'bg-warning' : 'bg-success'
                  }`} aria-hidden="true"></div>
                  <span className={`text-sm font-medium ${
                    isDemoMode ? 'text-warning' : 'text-success'
                  }`}>
                    {isDemoMode ? 'Demo' : 'Connected'}
                  </span>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-card/50 text-textMuted hover:text-textPrimary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav 
            className="lg:hidden py-4 border-t border-border animate-slide-down"
            role="navigation" 
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate('/' + item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    currentView === item.id
                      ? 'bg-border text-textPrimary'
                      : 'text-textMuted hover:text-textPrimary hover:bg-border/50'
                  }`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Demo Toggle */}
              <button
                onClick={() => {
                  onToggleDemoMode();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${isDemoMode ? 'text-warning' : 'text-success'}`} />
                  {isDemoMode ? 'Demo Mode' : 'Live Mode'}
                </span>
                <span className={`text-xs ${
                  isDemoMode ? 'text-warning' : 'text-success'
                }`}>
                  {isDemoMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
