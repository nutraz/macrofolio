import { createClient } from '@supabase/supabase-js';

// Environment variables (must be set in .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  // Sign up with email/password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Listen to auth changes
  onAuthChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Get user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Reset password (for password recovery)
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update user metadata
  updateUser: async (metadata: { email?: string; password?: string; data?: Record<string, any> }) => {
    const { data, error } = await supabase.auth.updateUser(metadata);
    return { data, error };
  },
};

// Database helper functions
export const db = {
  // Users
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    create: async (userData: { id: string; email: string; wallet_address?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },
    update: async (id: string, updates: { wallet_address?: string; email?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Assets
  assets: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    create: async (asset: Omit<import('./types').Asset, 'id' | 'created_at' | 'total_value'>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert(asset)
        .select()
        .single();
      return { data, error };
    },
    update: async (id: string, updates: Partial<import('./types').Asset>) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Transactions
  transactions: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, assets(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    create: async (transaction: Omit<import('./types').Transaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      return { data, error };
    },
    updateStatus: async (id: string, status: string, txHash?: string) => {
      const updates: any = { status };
      if (txHash) updates.tx_hash = txHash;
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Anchors (blockchain proofs)
  anchors: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    create: async (anchor: Omit<import('./types').Anchor, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('anchors')
        .insert(anchor)
        .select()
        .single();
      return { data, error };
    },
  },
};

export default supabase;

