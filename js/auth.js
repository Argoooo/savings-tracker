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
      const { data: { session } } = await this.supabase.auth.getSession();
      this.session = session;
      return session;
    } catch (error) {
      console.error('Error checking session:', error);
      return null;
    }
  }

  getToken() {
    return this.session?.access_token || null;
  }

  isAuthenticated() {
    return !!this.session;
  }

  async signUp(email, password) {
    if (!this.supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    if (!this.supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.session = data.session;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      this.session = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async resetPassword(email) {
    if (!this.supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  onAuthChange(event, session) {
    // This will be called whenever auth state changes
    // Override in your app to handle login/logout
    console.log('Auth state changed:', event, session ? 'Logged in' : 'Logged out');
    
    // Dispatch custom event for app to listen to
    window.dispatchEvent(new CustomEvent('auth-change', { 
      detail: { event, session, isAuthenticated: !!session } 
    }));
  }

  getHeaders() {
    const token = this.getToken();
    if (!token) return {};

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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

