import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton Pattern (commented out for demonstration)
// This ensures only one instance of the Supabase client is created
// and reused throughout the application lifecycle
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  // If instance doesn't exist, create it (lazy initialization)
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Return the same instance on subsequent calls
  return supabaseInstance;
}

// Export the singleton instance as the default export
export const supabase = getSupabaseClient();
