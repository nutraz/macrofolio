import { useState, useEffect, useCallback } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

/**
 * Authentication hook for managing user state
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false
  });

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (mounted) {
            setState({
              user: profile || { id: session.user.id, email: session.user.email! },
              loading: false,
              initialized: true
            });
          }
        } else if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, initialized: true });
          return;
        }

        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: profile || { id: session.user.id, email: session.user.email! },
            loading: false,
            initialized: true
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await auth.signUp(email, password);
    
    if (!error && data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: email
      });
    }

    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return await auth.signIn(email, password);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await auth.signOut();
    if (!error) {
      setState({ user: null, loading: false, initialized: true });
    }
    return { error };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single();

    if (!error) {
      setState(prev => ({ ...prev, user: data }));
    }

    return { data, error };
  }, [state.user]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!state.user
  };
}

export default useAuth;
