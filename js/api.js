// API Client for Savings App
// Updated to use authentication with Supabase

const API_BASE = window.location.origin;

class SavingsAPI {
  constructor(authManager) {
    this.auth = authManager;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    
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
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Data operations
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

// Initialize with auth manager (will be set after auth.js loads)
let api = null;

// Wait for auth to be available
if (typeof auth !== 'undefined') {
  api = new SavingsAPI(auth);
} else {
  // Create placeholder that will be replaced
  api = new SavingsAPI(null);
  
  // Update when auth becomes available
  window.addEventListener('auth-ready', () => {
    api = new SavingsAPI(auth);
  });
}
