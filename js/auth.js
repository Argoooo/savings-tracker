// Frontend Authentication for Supabase
// Handles login, signup, logout, and token management

class AuthManager {
  constructor() {
    this.supabase = null;
    this.session = null;
    this.init();
  }

  init() {
    // Wait for Supabase library and window variables to be available
    if (typeof window.supabase === 'undefined') {
      // Supabase script might still be loading, retry
      setTimeout(() => this.init(), 100);
      return;
    }

    // Get credentials from window variables (set in HTML before this script)
    const supabaseUrl = window.SUPABASE_URL;
    const supabaseAnonKey = window.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL and Anon Key must be set as window.SUPABASE_URL and window.SUPABASE_ANON_KEY');
      return;
    }

    // Create Supabase client
    this.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

    // Check for existing session
    this.checkSession();

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.onAuthChange(event, session);
    });
  }

  async checkSession() {
    if (!this.supabase) return null;
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      this.session = data.session;
      return data.session;
    } catch (error) {
      console.error('Session check error:', error);
      return null;
    }
  }

  async signIn(email, password) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    this.session = data.session;
    return data.session;
  }

  async signUp(email, password) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    this.session = data.session;
    return data.session;
  }

  async signOut() {
    if (!this.supabase) return;
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.session = null;
  }

  async resetPassword(email) {
    if (!this.supabase) throw new Error('Supabase not initialized');
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login.html`
    });
    if (error) throw error;
  }

  getToken() {
    return this.session?.access_token || null;
  }

  getHeaders() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  isAuthenticated() {
    return !!this.session;
  }

  onAuthChange(event, session) {
    // Override this method for custom auth change handling
    if (event === 'SIGNED_OUT') {
      // Redirect to login on sign out
      if (window.location.pathname !== '/login.html' && !window.location.pathname.includes('login')) {
        window.location.href = '/login.html';
      }
    }
  }
}

// Export singleton - CRITICAL for browser use
const auth = new AuthManager();

// Make available globally (for browser)
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
  window.auth = auth;
  console.log('✅ auth.js: AuthManager and auth exported to window');
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, auth };
}

