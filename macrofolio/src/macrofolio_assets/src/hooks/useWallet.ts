import { useState, useEffect, useCallback, useRef } from 'react';
import { web3Service, NETWORKS } from '../lib/web3';
import type { WalletState } from '../lib/types';
import { useToast } from '../components/Toast';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      chainId: string;
      selectedAddress: string | null;
    };
  }
}

interface WalletStateFull extends WalletState {
  loading: boolean;
  error: string | null;
  isCorrectNetwork: boolean;
  remainingQuota: number;
  nextAnchorTime: number | null;
}

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Connection timeout (10 seconds)
const CONNECTION_TIMEOUT = 10000;

/**
 * Wallet hook for managing Web3 connection state with security enhancements
 */
export function useWallet() {
  const toast = useToast();
  
  const [state, setState] = useState<WalletStateFull>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    balance: null,
    loading: false,
    error: null,
    isCorrectNetwork: false,
    remainingQuota: 0,
    nextAnchorTime: null
  });

  // Session management
  const lastActivityRef = useRef<number>(Date.now());
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check session timeout
  const checkSessionTimeout = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > SESSION_TIMEOUT) {
      console.warn('Session timeout - disconnecting wallet');
      disconnect();
      return true;
    }
    return false;
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check connection on mount
  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      if (!web3Service.isMetaMaskInstalled()) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'MetaMask is not installed'
          }));
        }
        return;
      }

      try {
        // Check if already connected by requesting accounts
        const accounts = await window.ethereum!.request({ 
          method: 'eth_accounts' 
        });

        if (accounts.length > 0 && mounted) {
          const address = accounts[0];
          const chainId = await web3Service.getChainId();
          const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
          const balance = await web3Service.getBalance();
          const isCorrectNetwork = Object.values(NETWORKS).some(n => n.chainId === chainId);

          // Update activity
          lastActivityRef.current = Date.now();

          setState({
            isConnected: true,
            address,
            chainId,
            networkName: network?.name || null,
            balance,
            loading: false,
            error: null,
            isCorrectNetwork,
            remainingQuota: 0,
            nextAnchorTime: null
          });
        } else if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    checkConnection();

    // Set up session timeout checker
    sessionTimerRef.current = setInterval(() => {
      if (state.isConnected) {
        checkSessionTimeout();
      }
    }, 60000); // Check every minute

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (mounted) {
          if (accounts.length === 0) {
            // MetaMask locked or user disconnected
            console.warn('Account disconnected - clearing session');
            toast.warning('Wallet Disconnected', 'Please reconnect to continue using Web3 features');
            disconnect();
          } else if (accounts[0] !== state.address) {
            // Account changed - disconnect for security
            console.warn('Account changed - disconnecting for security');
            toast.warning('Account Changed', 'For your security, please reconnect your wallet');
            disconnect();
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        if (mounted) {
          const numericChainId = parseInt(chainId, 16);
          const network = Object.values(NETWORKS).find(n => n.chainId === numericChainId);
          const isCorrectNetwork = Object.values(NETWORKS).some(n => n.chainId === numericChainId);
          
          console.warn('Network changed - verifying connection security');
          setState(prev => ({
            ...prev,
            chainId: numericChainId,
            networkName: network?.name || null,
            isCorrectNetwork
          }));
          
          // Disconnect if network changed unexpectedly
          if (!isCorrectNetwork) {
            toast.warning('Network Changed', `Please switch to a supported network (Polygon Amoy or Base Sepolia). Current: ${network?.name || 'Unknown'}`);
          } else {
            toast.info('Network Changed', `Connected to ${network?.name || 'Unknown'}`);
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }

    return () => {
      mounted = false;
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [state.isConnected, state.address, checkSessionTimeout]);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Show loading toast
    const _loadingToastId = 'wallet-connect-loading';
    toast.loading('Connecting Wallet...', 'Please approve the connection in MetaMask');

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout. Please try again.')), CONNECTION_TIMEOUT);
    });

    try {
      // Race between connection and timeout
      const connectionPromise = (async () => {
        const address = await web3Service.connect();
        const chainId = await web3Service.getChainId();
        const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
        const balance = await web3Service.getBalance();
        const isCorrectNetwork = Object.values(NETWORKS).some(n => n.chainId === chainId);

        // Update activity
        lastActivityRef.current = Date.now();

        setState({
          isConnected: true,
          address,
          chainId,
          networkName: network?.name || null,
          balance,
          loading: false,
          error: null,
          isCorrectNetwork,
          remainingQuota: 0,
          nextAnchorTime: null
        });

        // Update activity on user interaction
        window.addEventListener('click', updateActivity);
        window.addEventListener('keypress', updateActivity);

        return { success: true, address };
      })();

      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      // Show success toast
      toast.success('Wallet Connected', `Connected to ${state.networkName || 'wallet'}`);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      
      // Show error toast
      toast.error('Connection Failed', errorMessage);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [state.networkName, updateActivity, toast]);

  const disconnect = useCallback(async () => {
    await web3Service.disconnect();
    
    // Remove activity listeners
    window.removeEventListener('click', updateActivity);
    window.removeEventListener('keypress', updateActivity);
    
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: null,
      balance: null,
      loading: false,
      error: null,
      isCorrectNetwork: false,
      remainingQuota: 0,
      nextAnchorTime: null
    });
  }, [updateActivity]);

  const switchNetwork = useCallback(async (chainId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await web3Service.switchNetwork(chainId);
      const newChainId = await web3Service.getChainId();
      const network = Object.values(NETWORKS).find(n => n.chainId === newChainId);
      const balance = await web3Service.getBalance();
      const isCorrectNetwork = Object.values(NETWORKS).some(n => n.chainId === newChainId);

      setState(prev => ({
        ...prev,
        chainId: newChainId,
        networkName: network?.name || null,
        balance,
        isCorrectNetwork,
        loading: false,
        error: null
      }));

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to switch network';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const addNetwork = useCallback(async (networkKey: keyof typeof NETWORKS) => {
    const network = NETWORKS[networkKey];
    if (!network) return { success: false, error: 'Network not found' };

    try {
      await web3Service.addNetwork(network);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    if (!state.isConnected) return;
    
    try {
      const [remainingQuota, nextAnchorTime] = await Promise.all([
        web3Service.getRemainingQuota(),
        web3Service.getNextAnchorTime()
      ]);
      
      setState(prev => ({
        ...prev,
        remainingQuota,
        nextAnchorTime
      }));
    } catch (error) {
      console.error('Failed to refresh quota:', error);
    }
  }, [state.isConnected]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    addNetwork,
    refreshQuota,
    networks: NETWORKS,
    isMetaMaskInstalled: web3Service.isMetaMaskInstalled()
  };
}

export default useWallet;

