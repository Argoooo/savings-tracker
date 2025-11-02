// Frontend Authentication for Supabase
// Handles login, signup, logout, and token management

class AuthManager {
  constructor() {
    this.supabase = null;
    this.session = null;
    this.init();
  }

  init() {
    // Initialize Supabase client
    // Get these from your Supabase project settings
    const supabaseUrl = window.SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = window.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL and Anon Key must be set as environment variables or window variables');
      return;
    }

    // Use Supabase CDN
    if (typeof window.supabase !== 'undefined') {
      this.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    } else {
      // Load Supabase from CDN if not already loaded
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => {
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        this.checkSession();
      };
      document.head.appendChild(script);
    }

    // Check for existing session
    this.checkSession();

    // Listen for auth changes
    if (this.supabase) {
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.session = session;
        this.onAuthChange(event, session);
      });
    }
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

// Export singleton
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, auth };
}

