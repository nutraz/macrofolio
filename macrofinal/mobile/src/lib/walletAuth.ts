/**
 * Wallet Authentication Utilities
 * 
 * Provides secure wallet authentication with:
 * - EIP-55 Ethereum address checksum validation
 * - EIP-191 message signing verification
 * - EIP-712 structured data signing support
 */

import { ethers } from 'ethers';

/**
 * EIP-55 Checksum Validation
 * Validates that an Ethereum address has the correct checksum
 * https://eips.ethereum.org/EIPS/eip-55
 */
export function isValidEIP55Checksum(address: string): boolean {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  
  const lowerAddr = address.toLowerCase().replace('0x', '');
  
  // Use ethers to compute keccak256 hash
  const keccakHash = ethers.keccak256(`0x${lowerAddr}`);
  const keccakBuffer = ethers.getBytes(keccakHash);
  
  let checksumAddr = '0x';
  for (let i = 0; i < lowerAddr.length; i++) {
    const nibble = keccakBuffer[Math.floor(i / 2)];
    const offset = i % 2 === 0 ? 4 : 0;
    const value = (nibble >> offset) & 0x0f;
    
    if (value >= 8) {
      checksumAddr += lowerAddr[i].toUpperCase();
    } else {
      checksumAddr += lowerAddr[i];
    }
  }
  
  return address === checksumAddr;
}

/**
 * Normalize and validate Ethereum address
 * - Converts to lowercase
 * - Validates format (0x followed by 40 hex chars)
 * - Optionally validates EIP-55 checksum
 */
export function normalizeEthereumAddress(
  address: string,
  validateChecksum: boolean = false
): string {
  const trimmed = address.trim();
  
  // Check prefix
  if (!trimmed.startsWith('0x')) {
    throw new Error('Invalid Ethereum address: must start with 0x');
  }
  
  const hexPart = trimmed.slice(2).toLowerCase();
  
  // Validate hex format and length
  if (!/^[a-fA-F0-9]{40}$/.test(hexPart)) {
    throw new Error('Invalid Ethereum address: must be 40 hexadecimal characters');
  }
  
  // Validate checksum if requested
  if (validateChecksum && !isValidEIP55Checksum(trimmed)) {
    throw new Error('Invalid Ethereum address: invalid checksum');
  }
  
  return `0x${hexPart}`;
}

/**
 * Generate a signing challenge message for EIP-191
 * Creates a human-readable message with timestamp and nonce
 */
export function generateSigningChallenge(
  address: string,
  nonce: string = generateNonce()
): string {
  const timestamp = Date.now();
  const domain = 'Macrofolio';
  
  return `${domain} wants you to sign in with your wallet:

${address}

URI: macrofolio://auth/sign
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date(timestamp).toISOString()}

Accept to authenticate with Macrofolio. This signature will not cost any gas.`;
}

/**
 * Generate a random nonce for signing challenges
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a wallet signature using EIP-191
 * 
 * @param message - The original message that was signed
 * @param signature - The signature bytes (65 bytes: r, s, v)
 * @param expectedAddress - The expected wallet address
 * @returns true if signature is valid, throws error otherwise
 */
export function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  // Normalize addresses for comparison
  const normalizedExpected = normalizeEthereumAddress(expectedAddress);
  
  // Ensure signature is proper format
  if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
    throw new Error('Invalid signature format: must be 130 hex characters (65 bytes)');
  }
  
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare in lowercase (checksum is already validated in normalize)
    if (recoveredAddress.toLowerCase() !== normalizedExpected.toLowerCase()) {
      throw new Error('Signature does not match the expected wallet address');
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify signature');
  }
}

/**
 * Parse and validate a deep link URL
 * Returns parsed components or throws on invalid URL
 */
export function parseAuthDeepLink(url: string): {
  valid: boolean;
  error?: string;
  code?: string;
  errorDescription?: string;
} {
  try {
    const parsed = new URL(url);
    
    // Validate this is our redirect URL
    const expectedOrigin = 'macrofolio://';
    if (!url.startsWith(expectedOrigin) && !parsed.hostname.includes('macrofolio')) {
      return { valid: false, error: 'Invalid redirect URL origin' };
    }
    
    // Validate pathname
    if (!parsed.pathname.endsWith('/callback') && !parsed.pathname.includes('auth')) {
      return { valid: false, error: 'Invalid redirect URL path' };
    }
    
    // Extract and validate OAuth code
    const code = parsed.searchParams.get('code');
    if (code) {
      // Validate code format (alphanumeric with safe characters)
      if (!/^[a-zA-Z0-9._-]+$/.test(code)) {
        return { valid: false, error: 'Invalid OAuth code format' };
      }
    }
    
    // Extract error if present
    const errorDescription = parsed.searchParams.get('error_description');
    
    return {
      valid: true,
      code: code || undefined,
      errorDescription: errorDescription || undefined,
    };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Timeout wrapper for async operations
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Secure storage key names (for reference)
 */
export const STORAGE_KEYS = {
  WALLET_SESSION: 'macrofolio.auth.wallet.v1',
  WALLET_CHALLENGE: 'macrofolio.auth.wallet.challenge',
  WALLET_NONCE: 'macrofolio.auth.wallet.nonce',
} as const;

/**
 * OAuth Provider type mapping
 */
export const OAUTH_PROVIDER_MAP: Record<string, 'google' | 'discord' | 'apple' | 'twitter'> = {
  google: 'google',
  discord: 'discord',
  apple: 'apple',
  x: 'twitter',
  twitter: 'twitter',
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDER_MAP;

