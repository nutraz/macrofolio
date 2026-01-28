import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// ICP Network configuration
export const ICP_NETWORKS = {
  mainnet: {
    name: 'Internet Computer',
    host: 'https://ic0.app',
    explorerUrl: 'https://dashboard.internetcomputer.org'
  },
  local: {
    name: 'Local ICP',
    host: 'http://localhost:4943',
    explorerUrl: 'http://localhost:4943'
  }
};

// ICP Wallet State Interface
export interface ICPWalletState {
  isConnected: boolean;
  principal: string | null;
  network: string | null;
  loading: boolean;
  error: string | null;
  authClient: AuthClient | null;
}

// Default state
const defaultICPState: ICPWalletState = {
  isConnected: false,
  principal: null,
  network: null,
  loading: true,
  error: null,
  authClient: null
};

/**
 * Hook for managing Internet Identity (ICP) authentication
 * Provides wallet connection, disconnection, and state management
 */
export function useInternetIdentity() {
  const [state, setState] = useState<ICPWalletState>(defaultICPState);
  const authClientRef = useRef<AuthClient | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize auth client
  useEffect(() => {
    const initAuthClient = async () => {
      try {
        const authClient = await AuthClient.create();
        authClientRef.current = authClient;

        // Check if already logged in
        const isAuthenticated = await authClient.isAuthenticated();
        
        if (isAuthenticated && isMountedRef.current) {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          setState({
            isConnected: true,
            principal,
            network: 'Internet Computer',
            loading: false,
            error: null,
            authClient
          });
        } else if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            authClient
          }));
        }
      } catch (error: any) {
        console.error('Failed to initialize auth client:', error);
        if (isMountedRef.current) {
          setState({
            isConnected: false,
            principal: null,
            network: null,
            loading: false,
            error: error.message || 'Failed to initialize ICP authentication',
            authClient: null
          });
        }
      }
    };

    initAuthClient();
  }, []);

  /**
   * Connect to Internet Identity
   * Opens the II login page in a popup
   */
  const connect = useCallback(async (network: keyof typeof ICP_NETWORKS = 'mainnet'): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Create or get existing auth client
      let authClient = authClientRef.current;
      if (!authClient) {
        authClient = await AuthClient.create();
        authClientRef.current = authClient;
      }

      // Open II login in popup
      return new Promise((resolve) => {
        authClient!.login({
          // Official Internet Identity Service URLs
          identityProvider: network === 'mainnet' 
            ? 'https://identity.ic0.app'  // Production II service
            : 'http://localhost:4943',    // Local II canister
          onSuccess: async () => {
            if (!isMountedRef.current) return;
            
            const identity = authClient!.getIdentity();
            const principal = identity.getPrincipal().toString();
            
            setState({
              isConnected: true,
              principal,
              network: ICP_NETWORKS[network].name,
              loading: false,
              error: null,
              authClient
            });
            resolve({ success: true });
          },
          onError: (error: any) => {
            console.error('ICP login error:', error);
            if (!isMountedRef.current) return;
            
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message || 'Failed to login with Internet Identity'
            }));
            resolve({ success: false, error: error.message });
          }
        });
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to Internet Identity';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Disconnect from Internet Identity
   */
  const disconnect = useCallback(async () => {
    try {
      const authClient = authClientRef.current;
      if (authClient) {
        await authClient.logout();
      }
      
      setState({
        isConnected: false,
        principal: null,
        network: null,
        loading: false,
        error: null,
        authClient: authClientRef.current
      });
    } catch (error: any) {
      console.error('Failed to disconnect ICP:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        principal: null,
        network: null,
        loading: false,
        error: null
      }));
    }
  }, []);

  /**
   * Check if II is available in current browser
   * Uses a simple check to determine if the browser can access II
   */
  const isIIAvailable = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      // Check if the browser has required features for II
      const authClient = await AuthClient.create();
      
      // II is considered available if we can create an AuthClient
      // The actual II allowance is checked during the login flow
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get identity from auth client
   */
  const getIdentity = useCallback(() => {
    const authClient = authClientRef.current;
    if (!authClient || !authClient.isAuthenticated()) {
      return null;
    }
    return authClient.getIdentity();
  }, []);

  /**
   * Get principal ID as Principal object
   */
  const getPrincipal = useCallback((): Principal | null => {
    const identity = getIdentity();
    if (!identity) return null;
    return identity.getPrincipal();
  }, [getIdentity]);

  return {
    ...state,
    connect,
    disconnect,
    isIIAvailable,
    getIdentity,
    getPrincipal,
    networks: ICP_NETWORKS
  };
}

export default useInternetIdentity;

