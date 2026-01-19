import { ethers } from 'ethers';
import type { NetworkConfig, AnchorResult } from './types';

// Network configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  polygonAmoy: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  }
};

// Contract ABI (PortfolioAnchor)
const CONTRACT_ABI = [
  'function anchor(string actionType, bytes32 dataHash) returns (bytes32)',
  'function batchAnchor(string[] actionTypes, bytes32[] dataHashes)',
  'event PortfolioAnchored(address indexed user, string actionType, bytes32 dataHash, uint256 timestamp)'
] as const;

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private currentNetwork: NetworkConfig | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   */
  async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use Web3 features.');
    }

    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another Web3 wallet.');
      }
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const chainId = await this.getChainId();
      
      // Set up contract
      this.setupContract(chainId);
      
      return address;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.currentNetwork = null;
  }

  /**
   * Get current network info
   */
  getNetwork(): NetworkConfig | null {
    return this.currentNetwork;
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    if (!this.provider) throw new Error('Not connected');
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Get wallet address
   */
  async getAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (!this.signer) throw new Error('Not connected');
    const address = await this.signer.getAddress();
    const balance = await this.signer.provider!.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.signer !== null && this.contract !== null;
  }

  /**
   * Set up contract for current network
   */
  private setupContract(chainId: number): void {
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      console.warn('Contract address not set. Web3 anchoring will not work.');
      return;
    }

    // Find network config
    const networkConfig = Object.values(NETWORKS).find(n => n.chainId === chainId);
    if (networkConfig) {
      this.currentNetwork = networkConfig;
    }

    if (this.signer) {
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
    }
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch network
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      // Reconnect to get new signer
      await this.connect();
    } catch (error: any) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        const networkConfig = Object.values(NETWORKS).find(n => n.chainId === chainId);
        if (networkConfig) {
          await this.addNetwork(networkConfig);
          await this.connect();
        } else {
          throw new Error(`Network with chainId ${chainId} not supported`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Add a network to MetaMask
   */
  async addNetwork(networkConfig: NetworkConfig): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum!.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${networkConfig.chainId.toString(16)}`,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        nativeCurrency: {
          name: networkConfig.nativeCurrency.name,
          symbol: networkConfig.nativeCurrency.symbol,
          decimals: networkConfig.nativeCurrency.decimals
        },
        blockExplorerUrls: [networkConfig.explorerUrl]
      }]
    });
  }

  /**
   * Anchor data to blockchain
   */
  async anchorData(actionType: string, data: object): Promise<AnchorResult> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized. Please connect your wallet first.');
    }

    // Serialize and hash data
    const dataString = JSON.stringify(data);
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

    try {
      // Send transaction
      const tx = await this.contract.anchor(actionType, dataHash);
      const receipt = await tx.wait();

      return {
        hash: dataHash,
        txHash: receipt.hash,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error('Anchoring failed:', error);
      throw new Error(error.message || 'Failed to anchor data to blockchain');
    }
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    if (!this.currentNetwork) {
      return '#';
    }
    return `${this.currentNetwork.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Get address URL for explorer
   */
  getAddressUrl(address: string): string {
    if (!this.currentNetwork) {
      return '#';
    }
    return `${this.currentNetwork.explorerUrl}/address/${address}`;
  }
}

export const web3Service = new Web3Service();
export default web3Service;

