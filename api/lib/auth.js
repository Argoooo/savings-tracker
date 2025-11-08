// Authentication middleware for Supabase
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient(authToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  });

  return supabase;
}

// Verify JWT token and get user
export async function verifyAuth(req) {
  try {
    // Check for authorization header (case-insensitive)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No authorization header found');
      console.error('Available headers:', Object.keys(req.headers || {}));
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.error('❌ Empty token after Bearer prefix');
      return { user: null, error: 'Empty token' };
    }
    
    console.log('🔍 Verifying token, length:', token.length);
    const supabase = getSupabaseClient(token);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('❌ Token verification failed:', error?.message || 'No user');
      return { user: null, error: error?.message || 'Invalid token' };
    }

    console.log('✅ Token verified, user:', user.id);
    return { user, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: error.message };
  }
}

// Middleware wrapper for protected routes
export function withAuth(handler) {
  return async (req, res) => {
    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { user, error } = await verifyAuth(req);

    if (!user || error) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: error || 'Authentication required' 
      });
    }

    // Add user to request context
    req.user = user;

    return handler(req, res);
  };
}

