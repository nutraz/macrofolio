/**
 * Supabase Configuration
 * 
 * IMPORTANT: For production, use environment variables (.env files)
 * Never commit actual API keys to version control!
 * 
 * Setup for environment variables:
 * 1. Copy .env.example to .env
 * 2. Fill in your actual Supabase credentials
 * 3. Add .env* to .gitignore
 * 
 * For React Native, use react-native-config or similar library
 */

// Default values for development (these are public/anon keys, safe for development)
// In production, override these with environment variables
export const SUPABASE_URL = 'https://kqscqyuhfyxnawioycak.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = ''; // Leave empty to use ANON_KEY
export const SUPABASE_ANON_KEY = ''; // Leave empty to use PUBLISHABLE_KEY

// Deep link used for OAuth + magic links.
// Make sure your Supabase redirect URLs allow this value.
export const SUPABASE_REDIRECT_URL = 'macrofolio://auth/callback';

// Validate configuration - check if keys are set
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  (SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY)
);

