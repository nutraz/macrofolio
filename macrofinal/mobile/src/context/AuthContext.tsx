import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';
import {
  SUPABASE_REDIRECT_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PUBLISHABLE_KEY,
} from '../config/supabase';
import { supabase } from '../lib/supabase';
import {
  normalizeEthereumAddress,
  isValidEIP55Checksum,
  generateSigningChallenge,
  verifyWalletSignature,
  parseAuthDeepLink,
  withTimeout,
  STORAGE_KEYS,
  OAUTH_PROVIDER_MAP,
} from '../lib/walletAuth';

// Define Supabase client type
type SupabaseClient = Awaited<ReturnType<typeof import('@supabase/supabase-js')['createClient']>>;

// Auth timeout in milliseconds
const AUTH_OPERATION_TIMEOUT = 30000;

// Session validation timeout
const SESSION_CHECK_TIMEOUT = 5000;

// Fallback mock supabase client for development or when Supabase is not configured
const mockSupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_event: string, callback: ((event: string, session: unknown) => void) | null) => {
      if (callback) callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithOtp: async () => ({ data: { user: null, session: null }, error: null }),
    signInWithOAuth: async () => ({ data: { url: null }, error: null }),
    exchangeCodeForSession: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
} as unknown as SupabaseClient;

// Use real supabase client if available, otherwise use mock
const supabaseClient: SupabaseClient = (supabase as SupabaseClient) || mockSupabaseClient;

type User = {
  id: string;
  method: 'email' | 'google' | 'discord' | 'x' | 'apple' | 'wallet';
  email?: string;
  walletAddress?: string;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'discord' | 'x' | 'apple') => Promise<void>;
  signInWithWallet: (walletAddress: string, signature?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const WALLET_SESSION_KEY = STORAGE_KEYS.WALLET_SESSION;

/**
 * Safely map OAuth provider to internal method type
 * Throws on unknown providers instead of silently defaulting
 */
function providerToMethod(provider: unknown): User['method'] {
  const providerStr = String(provider);
  
  switch (providerStr) {
    case 'google':
      return 'google';
    case 'discord':
      return 'discord';
    case 'apple':
      return 'apple';
    case 'twitter':
      return 'x';
    case 'email':
      return 'email';
    default:
      console.warn(`[auth] Unknown OAuth provider: ${providerStr}, defaulting to email`);
      return 'email';
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getQueryParamFromUrl(url: string, name: string): string | null {
  // Use URL API for proper parsing (safer than regex)
  try {
    const parsedUrl = new URL(url);
    const value = parsedUrl.searchParams.get(name);
    return value ? decodeURIComponent(value) : null;
  } catch {
    // Fallback to regex for malformed URLs
    const match = url.match(new RegExp(`[?&]${name}=([^&#]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
}

/**
 * Validate and normalize email address
 */
function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error('Email is required');
  }
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new Error('Invalid email format');
  }
  return normalized;
}

/**
 * Validate session on app launch
 */
async function validateSession(client: SupabaseClient): Promise<boolean> {
  try {
    const result = await withTimeout(
      client.auth.getSession(),
      SESSION_CHECK_TIMEOUT,
      'Session validation timed out'
    );
    return !!result.data.session;
  } catch (error) {
    console.error('[auth] Session validation failed:', error);
    return false;
  }
}

/**
 * Securely store wallet session with verification data
 */
async function storeWalletSession(
  walletAddress: string,
  signature?: string,
  challenge?: string
): Promise<void> {
  const sessionData = {
    walletAddress,
    signature: signature || null,
    challenge: challenge || null,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(sessionData));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>({
    id: 'mock-user-123',
    email: 'demo@macrofolio.app',
    method: 'email',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (supabaseClient) {
          // Validate session with timeout
          const hasValidSession = await validateSession(supabaseClient);
          
          if (hasValidSession) {
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            if (session?.user) {
              const method = providerToMethod(session.user.app_metadata?.provider);
              if (mounted) {
                setUser({
                  id: `supabase:${session.user.id}`,
                  method,
                  email: session.user.email ?? undefined,
                });
                setLoading(false);
                return;
              }
            }
          }
        }

        // Check wallet session with validation
        const walletRaw = await AsyncStorage.getItem(WALLET_SESSION_KEY);
        if (walletRaw) {
          try {
            const parsed = JSON.parse(walletRaw) as {
              walletAddress?: unknown;
              signature?: string | null;
              timestamp?: number;
            };
            
            if (
              typeof parsed.walletAddress === 'string' &&
              parsed.walletAddress.trim().length > 0
            ) {
              const normalizedAddress = normalizeEthereumAddress(parsed.walletAddress);
              if (mounted) {
                setUser({
                  id: `wallet:${normalizedAddress}`,
                  method: 'wallet',
                  walletAddress: normalizedAddress,
                });
              }
            }
          } catch (parseError) {
            // Corrupt wallet session - clear it
            console.error('[auth] Corrupt wallet session, clearing:', parseError);
            await AsyncStorage.removeItem(WALLET_SESSION_KEY);
          }
        }
      } catch (error) {
        // Log error but don't expose details to user
        console.error('[auth] Session initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const client = supabaseClient;
    if (!client) return;

    const handleUrl = async (url: string) => {
      try {
        // Use secure URL parsing
        const parsed = parseAuthDeepLink(url);
        
        if (!parsed.valid) {
          throw new Error(parsed.error || 'Invalid deep link');
        }
        
        if (__DEV__) console.log('[auth] Deep link received:', url);

        if (parsed.errorDescription) {
          throw new Error(parsed.errorDescription);
        }

        const code = parsed.code;
        if (!code) {
          throw new Error('Missing OAuth code in redirect URL.');
        }

        // Exchange code with timeout
        const { data, error } = await withTimeout(
          client.auth.exchangeCodeForSession(code),
          AUTH_OPERATION_TIMEOUT,
          'OAuth code exchange timed out'
        );
        
        if (error) throw error;

        // Ensure we reflect the session after exchanging the code
        const sessionUser = data?.session?.user ?? (await client.auth.getSession()).data.session?.user;
        if (sessionUser) {
          const method = providerToMethod(sessionUser.app_metadata?.provider);
          setUser({
            id: `supabase:${sessionUser.id}`,
            method,
            email: sessionUser.email ?? undefined,
          });
        }
      } catch (e: any) {
        console.error('[auth] Deep link error:', e);
        Alert.alert('Auth error', e?.message || 'Failed to complete sign-in.');
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url).catch((error) => {
        console.error('[auth] Deep link handling failed:', error);
      });
    });

    // Handle cold start deep link (browser → app)
    Linking.getInitialURL()
      .then((url) => (url ? handleUrl(url) : undefined))
      .catch((error) => {
        console.error('[auth] Initial URL retrieval failed:', error);
      });

    // Use promise-based pattern to avoid race conditions
    const sessionPromise = client.auth.getSession();
    
    const {
      data: { subscription: authSub },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const method = providerToMethod(session.user.app_metadata?.provider);
      setUser({
        id: `supabase:${session.user.id}`,
        method,
        email: session.user.email ?? undefined,
      });
    });

    // Ensure session check completes
    sessionPromise.catch((error) => {
      console.error('[auth] Initial session check failed:', error);
    });

    return () => {
      subscription.remove();
      authSub.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const normalized = validateEmail(email);
    if (!supabaseClient) throw new Error('Supabase is not configured.');
    
    const { error } = await withTimeout(
      supabaseClient.auth.signInWithOtp({
        email: normalized,
        options: { emailRedirectTo: SUPABASE_REDIRECT_URL },
      }),
      AUTH_OPERATION_TIMEOUT,
      'Email sign-in timed out'
    );
    
    if (error) throw error;
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'discord' | 'x' | 'apple') => {
    if (!supabaseClient) throw new Error('Supabase is not configured.');
    
    // Use proper type mapping instead of 'as any'
    const supaProvider = OAUTH_PROVIDER_MAP[provider];
    if (!supaProvider) {
      throw new Error(`Invalid OAuth provider: ${provider}`);
    }
    
    const { data, error } = await withTimeout(
      supabaseClient.auth.signInWithOAuth({
        provider: supaProvider,
        options: {
          redirectTo: SUPABASE_REDIRECT_URL,
          skipBrowserRedirect: true,
        },
      }),
      AUTH_OPERATION_TIMEOUT,
      'OAuth initiation timed out'
    );
    
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned.');
    
    await Linking.openURL(data.url);
  }, []);

  const signInWithWallet = useCallback(
    async (walletAddress: string, signature?: string) => {
      // Validate and normalize wallet address
      const normalized = normalizeEthereumAddress(walletAddress);
      
      // If signature is provided, verify it
      if (signature) {
        const challenge = generateSigningChallenge(normalized);
        const isValid = verifyWalletSignature(challenge, signature, normalized);
        if (!isValid) {
          throw new Error('Invalid wallet signature');
        }
        
        // Store session with verification data
        await storeWalletSession(normalized, signature, challenge);
      } else {
        // No signature provided - store basic session
        // Note: In production, you should require signature verification
        console.warn('[auth] Wallet sign-in without signature - consider enabling signature verification');
        await AsyncStorage.setItem(
          WALLET_SESSION_KEY,
          JSON.stringify({ walletAddress: normalized, timestamp: Date.now() })
        );
      }
      
      const nextUser: User = {
        id: `wallet:${normalized}`,
        method: 'wallet',
        walletAddress: normalized,
      };
      
      setUser(nextUser);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(WALLET_SESSION_KEY);
      if (supabaseClient) {
        await withTimeout(
          supabaseClient.auth.signOut(),
          SESSION_CHECK_TIMEOUT,
          'Sign out timed out'
        );
      }
    } catch (error) {
      console.error('[auth] Sign out error:', error);
      // Still clear local session even if remote fails
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      signInWithEmail: signIn,
      signInWithOAuth,
      signInWithWallet,
      signOut,
    }),
    [loading, user, signIn, signInWithOAuth, signInWithWallet, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

