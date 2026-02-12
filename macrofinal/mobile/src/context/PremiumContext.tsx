import React, { createContext, useContext, ReactNode } from 'react';

// Define the context type
type PremiumContextType = {
  isPremium: boolean;
  loading: boolean;
  revenueCatEnabled: boolean;
};

// Create context with default values
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Mock provider for development - NO REVENUECAT DEPENDENCY
export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  // Mock values - pretend user is PREMIUM by default for development
  const mockContextValue: PremiumContextType = {
    isPremium: true, // Set to true for development so you can access all features
    loading: false,
    revenueCatEnabled: false, // Disable RevenueCat
  };

  return (
    <PremiumContext.Provider value={mockContextValue}>
      {children}
    </PremiumContext.Provider>
  );
};

// Custom hook
export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
