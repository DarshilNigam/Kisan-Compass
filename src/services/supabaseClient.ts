/**
 * KISAN COMPASS — Supabase Client Configuration
 * 
 * Provides official Supabase authentication and database connection.
 * When environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are present, establishes live communication with the cloud PostgreSQL backend.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '[KISAN COMPASS] Running with Local Cryptographic Multi-Tenant Storage. ' +
    'To connect live Supabase cloud PostgreSQL, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}
