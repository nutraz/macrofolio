import { useState, useEffect, useCallback } from 'react';
import { web3Service, NETWORKS } from '../lib/web3';
import type { WalletState, NetworkConfig } from '../lib/types';

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
}

/**
 * Wallet hook for managing Web3 connection state
 */
export function useWallet() {
  const [state, setState] = useState<WalletStateFull>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    balance: null,
    loading: false,
    error: null
  });

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

          setState({
            isConnected: true,
            address,
            chainId,
            networkName: network?.name || null,
            balance,
            loading: false,
            error: null
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

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (mounted) {
          if (accounts.length === 0) {
            setState({
              isConnected: false,
              address: null,
              chainId: null,
              networkName: null,
              balance: null,
              loading: false,
              error: null
            });
          } else {
            web3Service.getAddress().then(address => {
              if (mounted) {
                setState(prev => ({ ...prev, address }));
              }
            });
          }
        }
      });

      window.ethereum.on('chainChanged', async (chainId: string) => {
        if (mounted) {
          const numericChainId = parseInt(chainId, 16);
          const network = Object.values(NETWORKS).find(n => n.chainId === numericChainId);
          setState(prev => ({
            ...prev,
            chainId: numericChainId,
            networkName: network?.name || null
          }));
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const address = await web3Service.connect();
      const chainId = await web3Service.getChainId();
      const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
      const balance = await web3Service.getBalance();

      setState({
        isConnected: true,
        address,
        chainId,
        networkName: network?.name || null,
        balance,
        loading: false,
        error: null
      });

      return { success: true, address };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const disconnect = useCallback(async () => {
    await web3Service.disconnect();
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: null,
      balance: null,
      loading: false,
      error: null
    });
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await web3Service.switchNetwork(chainId);
      const newChainId = await web3Service.getChainId();
      const network = Object.values(NETWORKS).find(n => n.chainId === newChainId);
      const balance = await web3Service.getBalance();

      setState(prev => ({
        ...prev,
        chainId: newChainId,
        networkName: network?.name || null,
        balance,
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

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    addNetwork,
    networks: NETWORKS,
    isMetaMaskInstalled: web3Service.isMetaMaskInstalled()
  };
}

export default useWallet;

