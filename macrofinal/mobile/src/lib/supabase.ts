import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config/supabase';

const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          // For mobile deep-link OAuth, use PKCE + exchangeCodeForSession.
          // Hermes may log a warning about WebCrypto SHA-256; it's noisy but PKCE still works.
          flowType: 'pkce',
        },
        global: {
          fetch,
        },
      })
    : null;
