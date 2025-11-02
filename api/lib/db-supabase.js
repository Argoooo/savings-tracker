// Database connection utility for Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase environment variables not set. Using fallback.');
}

// Create Supabase client with service role key for server-side operations
// Note: In production, use service role key only on server-side, never expose to client
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Query function for Supabase
// Note: Supabase uses a query builder, but we'll create a simple adapter
export async function query(queryText, params = []) {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  try {
    // Supabase uses RPC for raw SQL, but we'll use their query builder for safety
    // For now, we'll use sql.unsafe() equivalent through RPC
    // Note: This is a simplified approach - for production, consider using Supabase's query builder
    
    // For complex queries, we'll need to use Supabase RPC functions
    // For this migration, we'll keep using parameterized queries converted to Supabase format
    
    // Since Supabase has RLS enabled, we can use the client directly
    // The RLS policies will automatically filter by user_id
    
    // This is a placeholder - actual implementation would use Supabase's query methods
    // For now, we recommend using the Supabase client methods directly in each endpoint
    
    throw new Error('Use Supabase client methods directly instead of raw SQL. See updated API endpoints.');
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper to get Supabase client with user context
export function getSupabaseClient(userToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not set');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
    },
  });
}

