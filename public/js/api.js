// API Client for Savings App
// Updated to use authentication with Supabase and support multiple trackers

const API_BASE = window.location.origin;

class SavingsAPI {
  constructor(authManager, trackerId) {
    this.auth = authManager;
    this.trackerId = trackerId;
  }

  async request(endpoint, options = {}) {
    // Add trackerId to all requests
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE}/api${endpoint}${separator}trackerId=${this.trackerId}`;
    
    // Get auth headers
    const headers = {
      'Content-Type': 'application/json',
      ...this.auth?.getHeaders(),
      ...options.headers
    };

    const config = {
      headers,
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 (unauthorized) - token expired or invalid
      if (response.status === 401) {
        // Try to refresh session
        if (this.auth && this.auth.supabase) {
          const { data: { session } } = await this.auth.supabase.auth.refreshSession();
          if (session) {
            // Retry with new token
            headers['Authorization'] = `Bearer ${session.access_token}`;
            const retryResponse = await fetch(url, { ...config, headers });
            if (retryResponse.ok) {
              const text = await retryResponse.text();
              return text ? JSON.parse(text) : null;
            }
          }
        }
        
        // Redirect to login if auth fails
        window.location.href = '/login.html';
        throw new Error('Unauthorized - please log in');
      }
      
      // Read response text once (can only be read once)
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : { error: 'Unknown error' };
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}`, details: 'Failed to parse error response', raw: responseText };
        }
        
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}`;
        const errorDetails = errorData.details || errorData;
        
        // Log detailed error information
        console.error(`❌ API Error [${endpoint}]:`, errorMessage);
        console.error('📋 Error Details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails,
          fullError: errorData,
          requestBody: options.body,
          responseText: responseText
        });
        console.error('📦 Full Error Object:', errorData);
        console.error('📤 Request Body:', options.body);
        console.error('📥 Response Text:', responseText);
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (!responseText) {
        return null;
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Tracker Shares management
  async getTrackerShares(trackerId) {
    return await this.request(`/tracker-shares?trackerId=${trackerId}`, {
      method: 'GET'
    });
  }

  async shareTracker(trackerId, sharedWithUserId, sharedWithEmail, permission = 'read') {
    return await this.request('/tracker-shares', {
      method: 'POST',
      body: {
        trackerId,
        sharedWithUserId,
        sharedWithEmail,
        permission
      }
    });
  }

  async updateSharePermission(shareId, permission) {
    return await this.request('/tracker-shares', {
      method: 'PUT',
      body: {
        shareId,
        permission
      }
    });
  }

  async removeShare(shareId) {
    return await this.request(`/tracker-shares?shareId=${shareId}`, {
      method: 'DELETE'
    });
  }

  // Trackers management
  async getTrackers() {
    // Trackers endpoint doesn't need trackerId
    const url = `${API_BASE}/api/trackers`;
    
    // Ensure we have auth headers - wait for session if needed
    if (!this.auth) {
      throw new Error('Auth manager not available');
    }
    
    console.log('🔍 getTrackers: Checking auth state...');
    console.log('🔍 Auth instance:', this.auth);
    console.log('🔍 Session before wait:', this.auth.session);
    
    // Wait for session to be available
    let attempts = 0;
    while (!this.auth.session && attempts < 10) {
      console.log(`⏳ Waiting for session... attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, 100));
      const session = await this.auth.checkSession();
      if (session) {
        this.auth.session = session; // Ensure session is set
        console.log('✅ Session retrieved from checkSession');
      }
      attempts++;
    }
    
    // Check if we have a token
    if (!this.auth.session) {
      console.error('❌ No session available after waiting');
      console.error('Auth instance state:', {
        hasAuth: !!this.auth,
        hasSupabase: !!this.auth?.supabase,
        session: this.auth?.session
      });
      throw new Error('No authentication session available');
    }
    
    // Try to refresh session if needed before getting token
    if (this.auth.session) {
      const expiresAt = this.auth.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt - now < 60) {
        console.log('🔄 Token expiring soon, refreshing session...');
        await this.auth.refreshSession();
      }
    }
    
    const token = this.auth.getToken();
    if (!token) {
      console.error('❌ No token available from auth instance');
      console.error('Auth instance:', this.auth);
      console.error('Session:', this.auth.session);
      throw new Error('No authentication token available');
    }
    
    console.log('✅ Token available, making request to:', url);
    console.log('🔍 Token expires at:', this.auth.session?.expires_at ? new Date(this.auth.session.expires_at * 1000).toISOString() : 'unknown');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('📤 Request headers:', { ...headers, 'Authorization': 'Bearer ***' });
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Failed to fetch trackers:', response.status, errorText);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Failed to fetch trackers: ${response.status}`);
    }
    return await response.json();
  }

  async createTracker(name, description = '') {
    const url = `${API_BASE}/api/trackers`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth?.getHeaders()
      },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) throw new Error('Failed to create tracker');
    return await response.json();
  }

  async updateTracker(id, name, description) {
    const url = `${API_BASE}/api/trackers`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth?.getHeaders()
      },
      body: JSON.stringify({ id, name, description })
    });
    if (!response.ok) throw new Error('Failed to update tracker');
    return await response.json();
  }

  async deleteTracker(id) {
    const url = `${API_BASE}/api/trackers?id=${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.auth?.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete tracker');
    return await response.json();
  }

  // Data operations (all require trackerId which is automatically added)
  async getAllData() {
    return await this.request('/data');
  }

  // Settings
  async getSettings() {
    return await this.request('/settings');
  }

  async updateSettings(settings) {
    return await this.request('/settings', {
      method: 'PUT',
      body: settings
    });
  }

  // People
  async getPeople() {
    return await this.request('/people');
  }

  async createPerson(person) {
    return await this.request('/people', {
      method: 'POST',
      body: person
    });
  }

  async updatePerson(person) {
    return await this.request('/people', {
      method: 'PUT',
      body: person
    });
  }

  async deletePerson(id) {
    return await this.request(`/people?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Goals
  async getGoals() {
    return await this.request('/goals');
  }

  async createGoal(goal) {
    return await this.request('/goals', {
      method: 'POST',
      body: goal
    });
  }

  async updateGoal(goal) {
    return await this.request('/goals', {
      method: 'PUT',
      body: goal
    });
  }

  async deleteGoal(id) {
    return await this.request(`/goals?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Transactions
  async getTransactions() {
    return await this.request('/transactions');
  }

  async createTransaction(transaction) {
    return await this.request('/transactions', {
      method: 'POST',
      body: transaction
    });
  }

  async updateTransaction(transaction) {
    return await this.request('/transactions', {
      method: 'PUT',
      body: transaction
    });
  }

  async deleteTransaction(id) {
    return await this.request(`/transactions?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Scenario Rates
  async getScenarioRates() {
    return await this.request('/scenario-rates');
  }

  async updateScenarioRates(rates) {
    return await this.request('/scenario-rates', {
      method: 'PUT',
      body: rates
    });
  }
}

// Initialize with auth manager and tracker ID (will be set after auth loads)
let api = null;
let currentTrackerId = null;

// Helper to initialize API with tracker
function initializeAPI(trackerId) {
  const authInstance = typeof window !== 'undefined' ? window.auth : (typeof auth !== 'undefined' ? auth : null);
  if (authInstance) {
    currentTrackerId = trackerId;
    api = new SavingsAPI(authInstance, trackerId);
    return api;
  }
  console.warn('⚠️ initializeAPI: auth not available');
  return null;
}

// Export for use in other modules (Browser)
if (typeof window !== 'undefined') {
  window.SavingsAPI = SavingsAPI;
  window.initializeAPI = initializeAPI;
  console.log('✅ api.js: SavingsAPI exported to window');
}

// Export for Node.js modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SavingsAPI, initializeAPI };
}
