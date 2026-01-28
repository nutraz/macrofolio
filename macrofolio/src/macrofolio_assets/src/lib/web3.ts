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

// Contract ABI (PortfolioAnchor) - Updated with new signature-based functions
const CONTRACT_ABI = [
  // Original functions (for backward compatibility during migration)
  'function anchor(string actionType, bytes32 dataHash) returns (bytes32)',
  'function batchAnchor(string[] actionTypes, bytes32[] dataHashes)',
  'event PortfolioAnchored(address indexed user, string actionType, bytes32 dataHash, uint256 timestamp)',
  // New signature-based functions (v1 schema)
  'function anchor(uint8 actionType, bytes32 dataHash, uint256 deadline, bytes signature) returns (bytes32)',
  'function batchAnchor(uint8[] actionTypes, bytes32[] dataHashes, uint256 deadline, bytes signature)',
  'function verifyAnchor(address user, bytes32 dataHash) view returns (bool)',
  'function getAnchorCount(address user) view returns (uint256)',
  'function getRemainingQuota(address user) view returns (uint256)',
  'function getNextAnchorTime(address user) view returns (uint256)',
  'function getSchemaVersion() view returns (uint8)',
  'function getDomainSeparator() view returns (bytes32)',
  'function nonces(address user) view returns (uint256)',
  // Events (v1 schema with indexed parameters)
  'event PortfolioAnchored(address indexed user, uint8 indexed actionType, bytes32 indexed dataHash, uint256 timestamp, uint8 schemaVersion)',
  'event AnchorRateLimited(address indexed user, uint256 remainingQuota)'
] as const;

// Action types for v1 schema
export enum ActionType {
  ADD_ASSET = 0,
  UPDATE_PORTFOLIO = 1,
  DELETE_ASSET = 2,
  REBALANCE = 3
}

// EIP-712 typed data types
const EIP712_TYPES = {
  Anchor: [
    { name: 'actionType', type: 'uint8' },
    { name: 'dataHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private currentNetwork: NetworkConfig | null = null;
  private cachedDomainSeparator: string | null = null;

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
    this.cachedDomainSeparator = null;
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
   * Anchor data to blockchain with EIP-712 signature (v1 schema)
   */
  async anchorData(actionType: ActionType, data: object, deadline?: number): Promise<AnchorResult> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized. Please connect your wallet first.');
    }

    // Serialize and hash data
    const dataString = JSON.stringify(data);
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

    // Get nonce and domain separator
    const address = await this.signer.getAddress();
    const nonce = await this.contract.nonces(address);
    const domainSeparator = await this.contract.getDomainSeparator();
    
    // Set deadline (default: 1 hour from now)
    const signatureDeadline = deadline || Math.floor(Date.now() / 1000) + 3600;

    // Create EIP-712 signature
    const signature = await this.signTypedData({
      domain: {
        name: 'PortfolioAnchor',
        version: '1',
        chainId: await this.getChainId(),
        verifyingContract: this.contract.target
      },
      types: EIP712_TYPES,
      primaryType: 'Anchor',
      message: {
        actionType,
        dataHash,
        nonce,
        deadline: signatureDeadline
      }
    });

    try {
      // Send transaction with signature
      const tx = await this.contract.anchor(
        actionType,
        dataHash,
        signatureDeadline,
        signature
      );
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
   * Sign typed data using EIP-712
   */
  async signTypedData(message: any): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Use ethers v6 signTypedData
      return await this.signer.signTypedData(
        message.domain,
        message.types,
        message.message
      );
    } catch (error: any) {
      console.error('EIP-712 signing failed:', error);
      throw new Error('Failed to sign message: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Verify anchor exists
   */
  async verifyAnchor(user: string, dataHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Web3 not initialized');
    }
    return await this.contract.verifyAnchor(user, dataHash);
  }

  /**
   * Get anchor count for connected user
   */
  async getAnchorCount(): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized');
    }
    const address = await this.signer.getAddress();
    return await this.contract.getAnchorCount(address);
  }

  /**
   * Get remaining anchor quota
   */
  async getRemainingQuota(): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized');
    }
    const address = await this.signer.getAddress();
    return await this.contract.getRemainingQuota(address);
  }

  /**
   * Get next allowed anchor timestamp
   */
  async getNextAnchorTime(): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized');
    }
    const address = await this.signer.getAddress();
    return await this.contract.getNextAnchorTime(address);
  }

  /**
   * Check if on correct network
   */
  async isCorrectNetwork(): Promise<boolean> {
    const chainId = await this.getChainId();
    const supportedChainIds = Object.values(NETWORKS).map(n => n.chainId);
    return supportedChainIds.includes(chainId);
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

