// Finance Tracker API Client
const API_BASE = window.location.origin;

class FinanceAPI {
  constructor(authManager) {
    this.auth = authManager;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    
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
      
      if (response.status === 401) {
        if (this.auth && this.auth.supabase) {
          const { data: { session } } = await this.auth.supabase.auth.refreshSession();
          if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            const retryResponse = await fetch(url, { ...config, headers });
            if (retryResponse.ok) {
              const text = await retryResponse.text();
              return text ? JSON.parse(text) : null;
            }
          }
        }
        window.location.href = '/login.html';
        throw new Error('Unauthorized - please log in');
      }
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : { error: 'Unknown error' };
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}`, details: 'Failed to parse error response' };
        }
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      if (!responseText) {
        return null;
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Accounts
  async getAccounts() {
    return await this.request('/finance-accounts');
  }

  async createAccount(account) {
    return await this.request('/finance-accounts', {
      method: 'POST',
      body: account
    });
  }

  async updateAccount(id, account) {
    return await this.request('/finance-accounts', {
      method: 'PUT',
      body: { id, ...account }
    });
  }

  async deleteAccount(id) {
    return await this.request(`/finance-accounts?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Transactions
  async getTransactions(accountId = null, limit = 50) {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (limit) params.append('limit', limit);
    const query = params.toString();
    return await this.request(`/finance-transactions${query ? '?' + query : ''}`);
  }

  async createTransaction(transaction) {
    return await this.request('/finance-transactions', {
      method: 'POST',
      body: transaction
    });
  }

  async updateTransaction(id, transaction) {
    return await this.request('/finance-transactions', {
      method: 'PUT',
      body: { id, ...transaction }
    });
  }

  async deleteTransaction(id) {
    return await this.request(`/finance-transactions?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Spend Limits
  async getSpendLimits(accountId = null) {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    const query = params.toString();
    return await this.request(`/finance-spend-limits${query ? '?' + query : ''}`);
  }

  async createSpendLimit(limit) {
    return await this.request('/finance-spend-limits', {
      method: 'POST',
      body: limit
    });
  }

  async updateSpendLimit(id, limit) {
    return await this.request('/finance-spend-limits', {
      method: 'PUT',
      body: { id, ...limit }
    });
  }

  async deleteSpendLimit(id) {
    return await this.request(`/finance-spend-limits?id=${id}`, {
      method: 'DELETE'
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.FinanceAPI = FinanceAPI;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FinanceAPI };
}






