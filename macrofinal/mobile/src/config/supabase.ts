// Supabase project settings (required for real auth).
// For client apps, use the Publishable key (`sb_publishable_...`) or the legacy `anon` key.
// Never use `sb_secret_...` or `service_role` in a mobile app.
export const SUPABASE_URL = 'https://kqscqyuhfyxnawioycak.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NDkkkqLY3qWqNa2dtGvizg_TjH07ftG';

// Optional legacy key (JWT). Keep empty unless needed.
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxc2NxeXVoZnl4bmF3aW95Y2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTUwNjcsImV4cCI6MjA4NjM3MTA2N30.PLwwy08eJ2TcymEGSMB3UC2-K21TyrY_NmZIgS6xzv0';

// Deep link used for OAuth + magic links.
// Make sure your Supabase redirect URLs allow this value.
export const SUPABASE_REDIRECT_URL = 'macrofolio://auth/callback';
