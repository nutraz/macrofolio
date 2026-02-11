import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { SUPABASE_REDIRECT_URL } from '../config/supabase';
import { supabase } from '../lib/supabase';

type User = {
  id: string;
  method: 'email' | 'google' | 'facebook' | 'discord' | 'x' | 'apple' | 'wallet';
  email?: string;
  walletAddress?: string;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'discord' | 'x' | 'apple') => Promise<void>;
  signInWithWallet: (walletAddress: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const WALLET_SESSION_KEY = 'macrofolio.auth.wallet.v1';

function providerToMethod(provider: unknown): User['method'] {
  if (provider === 'google') return 'google';
  if (provider === 'facebook') return 'facebook';
  if (provider === 'discord') return 'discord';
  if (provider === 'apple') return 'apple';
  if (provider === 'twitter') return 'x';
  return 'email';
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getQueryParamFromUrl(url: string, name: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(name);
  } catch {
    // Fallback for environments without URL support.
    const match = url.match(new RegExp(`[?&]${name}=([^&#]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          if (session?.user) {
            const method = providerToMethod(session.user.app_metadata?.provider);
            if (mounted)
              setUser({
                id: `supabase:${session.user.id}`,
                method,
                email: session.user.email ?? undefined,
              });
            return;
          }
        }

        const walletRaw = await AsyncStorage.getItem(WALLET_SESSION_KEY);
        if (walletRaw) {
          const parsed = JSON.parse(walletRaw) as { walletAddress?: unknown };
          if (typeof parsed.walletAddress === 'string' && parsed.walletAddress.trim().length > 0) {
            if (mounted)
              setUser({
                id: `wallet:${parsed.walletAddress.trim()}`,
                method: 'wallet',
                walletAddress: parsed.walletAddress.trim(),
              });
            return;
          }
        }
      } catch {
        // Ignore corrupt session.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const handleUrl = async (url: string) => {
      try {
        if (!url.startsWith(SUPABASE_REDIRECT_URL)) return;
        if (__DEV__) console.log('[auth] deep link:', url);

        const errorDescription = getQueryParamFromUrl(url, 'error_description');
        if (errorDescription) throw new Error(errorDescription);

        const code = getQueryParamFromUrl(url, 'code');
        if (!code) throw new Error('Missing OAuth code in redirect URL.');

        const { data, error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;

        // Some environments may not immediately emit an auth state change event.
        // Ensure we reflect the session after exchanging the code.
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
        Alert.alert('Auth error', e?.message || 'Failed to complete sign-in.');
      }
    };

    const subscription = Linking.addEventListener('url', async ({ url }) => {
      await handleUrl(url);
    });

    // Handle cold start deep link (browser → app).
    Linking.getInitialURL()
      .then((url) => (url ? handleUrl(url) : undefined))
      .catch(() => {});

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

    return () => {
      subscription.remove();
      authSub.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new Error('Email is required');
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: SUPABASE_REDIRECT_URL },
    });
    if (error) throw error;
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'discord' | 'x' | 'apple') => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const supaProvider = provider === 'x' ? ('twitter' as any) : (provider as any);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supaProvider,
      options: {
        redirectTo: SUPABASE_REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned.');
    await Linking.openURL(data.url);
  }, []);

  const signInWithWallet = useCallback(async (walletAddress: string) => {
    const normalized = walletAddress.trim();
    if (!normalized) throw new Error('Wallet address is required');
    const nextUser: User = { id: `wallet:${normalized}`, method: 'wallet', walletAddress: normalized };
    await AsyncStorage.setItem(WALLET_SESSION_KEY, JSON.stringify({ walletAddress: normalized }));
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(WALLET_SESSION_KEY);
    if (supabase) await supabase.auth.signOut();
    setUser(null);
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
