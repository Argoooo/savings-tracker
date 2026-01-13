// Finance Tracker Main Application
// Set Supabase credentials (same as login.html)
window.SUPABASE_URL = window.SUPABASE_URL || 'https://uqbcokdpldhrxccyddfz.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxYmNva2RwbGRocnhjY3lkZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTM5MzcsImV4cCI6MjA3NzY2OTkzN30.4yknX1zqpfloABqexwzl0ElLYVp4C_atUbNAR8P_1eU';

// Bank data with icons and colors
const BANK_DATA = {
  'PNB': { name: 'PNB', icon: '🏦', color: '#0066cc' },
  'PSBank': { name: 'PSBank', icon: '🏛️', color: '#0066cc' },
  'RCBC': { name: 'RCBC', icon: '🔷', color: '#0066cc' },
  'Rural Bank': { name: 'Rural Bank', icon: '🏪', color: '#666666' },
  'Salmon': { name: 'Salmon', icon: '🐟', color: '#ff6b35' },
  'Security Bank': { name: 'Security Bank', icon: '🔒', color: '#003366' },
  'BDO': { name: 'BDO', icon: '🏦', color: '#e31837' },
  'BPI': { name: 'BPI', icon: '🏦', color: '#e31837' },
  'Metrobank': { name: 'Metrobank', icon: '🏦', color: '#e31837' },
  'GCash': { name: 'GCash', icon: '💙', color: '#0070ba' },
  'PayMaya': { name: 'PayMaya', icon: '💳', color: '#00a859' }
};

let api = null;
let accounts = [];
let transactions = [];
let isBalanceVisible = true;

// Initialize app
async function init() {
  try {
    // Wait for auth to be ready
    if (!window.auth || !window.auth.supabase) {
      setTimeout(init, 100);
      return;
    }

    // Check authentication
    const session = await window.auth.checkSession();
    if (!session) {
      window.location.href = '/login.html';
      return;
    }

    // Initialize API
    api = new FinanceAPI(window.auth);

    // Load user info
    const user = session.user;
    if (user.email) {
      const username = user.email.split('@')[0];
      document.getElementById('username').textContent = `@${username}`;
    }

    // Load data
    await loadData();

    // Setup event listeners
    setupEventListeners();

    // Render initial UI
    render();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize app. Please refresh the page.');
  }
}

// Load all data
async function loadData() {
  try {
    [accounts, transactions] = await Promise.all([
      api.getAccounts(),
      api.getTransactions(null, 50)
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Add account card
  document.getElementById('addAccountCard').addEventListener('click', () => {
    showAddAccountModal();
  });

  // Close modals
  document.getElementById('closeModal').addEventListener('click', () => {
    hideAddAccountModal();
  });

  document.getElementById('closeAccountModal').addEventListener('click', () => {
    hideAccountDetailsModal();
  });

  // Account type tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const accountType = e.target.dataset.type;
      renderBankList(accountType);
    });
  });

  // Eye toggle for balance visibility
  document.getElementById('eyeToggle').addEventListener('click', () => {
    toggleBalanceVisibility();
  });

  // Spend limits card
  document.getElementById('spendLimitsCard').addEventListener('click', () => {
    alert('Spend Limits feature coming soon!');
  });

  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const page = e.currentTarget.dataset.page;
      if (page === 'finsights') {
        alert('Finsights feature coming soon!');
      }
    });
  });

  // Close modal on outside click
  document.getElementById('addAccountModal').addEventListener('click', (e) => {
    if (e.target.id === 'addAccountModal') {
      hideAddAccountModal();
    }
  });

  document.getElementById('accountDetailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'accountDetailsModal') {
      hideAccountDetailsModal();
    }
  });
}

// Render UI
function render() {
  renderNetWorth();
  renderAccounts();
  renderTransactions();
}

// Render net worth
function renderNetWorth() {
  const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const formatted = formatCurrency(total);
  document.getElementById('netWorth').textContent = isBalanceVisible ? formatted : '••••••';
}

// Render accounts
function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  grid.innerHTML = '';

  accounts.forEach(account => {
    const card = createAccountCard(account);
    grid.appendChild(card);
  });
}

// Create account card
function createAccountCard(account) {
  const card = document.createElement('div');
  card.className = 'account-card';
  card.addEventListener('click', () => showAccountDetails(account));

  const bankInfo = BANK_DATA[account.bankName] || { icon: '🏦', color: '#666666' };
  const balance = isBalanceVisible ? formatCurrency(account.balance) : '••••';

  card.innerHTML = `
    <div class="account-header">
      <div class="account-icon" style="background-color: ${bankInfo.color}">
        ${bankInfo.icon}
      </div>
      <div class="account-info">
        <div class="account-name">${account.name}</div>
        <div class="account-type-label">${account.accountType}</div>
      </div>
    </div>
    <div class="account-balance">${balance}</div>
  `;

  return card;
}

// Render transactions
function renderTransactions() {
  const list = document.getElementById('transactionsList');
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No transactions yet</p></div>';
    return;
  }

  // Group transactions by date
  const grouped = groupTransactionsByDate(transactions);

  Object.keys(grouped).forEach(date => {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'transaction-date';
    dateHeader.textContent = formatDate(date);
    list.appendChild(dateHeader);

    grouped[date].forEach(transaction => {
      const item = createTransactionItem(transaction);
      list.appendChild(item);
    });
  });
}

// Create transaction item
function createTransactionItem(transaction) {
  const item = document.createElement('div');
  item.className = 'transaction-item';

  const account = accounts.find(a => a.id === transaction.accountId);
  const bankInfo = account ? (BANK_DATA[account.bankName] || { icon: '💰', color: '#666666' }) : { icon: '💰', color: '#666666' };
  const amount = isBalanceVisible ? formatCurrency(Math.abs(transaction.amount)) : '•••';
  const amountClass = transaction.type === 'income' ? 'income' : 'expense';

  item.innerHTML = `
    <div class="transaction-icon" style="background-color: ${bankInfo.color}">
      ${bankInfo.icon}
    </div>
    <div class="transaction-details">
      <div class="transaction-description">${transaction.description || 'Transaction'}</div>
    </div>
    <div class="transaction-amount ${amountClass}">
      ${transaction.type === 'income' ? '+' : '-'}${amount}
    </div>
  `;

  return item;
}

// Show add account modal
function showAddAccountModal() {
  const modal = document.getElementById('addAccountModal');
  modal.classList.add('active');
  renderBankList('Savings');
}

// Hide add account modal
function hideAddAccountModal() {
  const modal = document.getElementById('addAccountModal');
  modal.classList.remove('active');
}

// Render bank list
function renderBankList(accountType) {
  const list = document.getElementById('bankList');
  list.innerHTML = '';

  const banks = Object.keys(BANK_DATA);
  
  banks.forEach(bankName => {
    const item = document.createElement('div');
    item.className = 'bank-item';
    
    const bankInfo = BANK_DATA[bankName];
    
    item.innerHTML = `
      <div class="bank-icon" style="background-color: ${bankInfo.color}">
        ${bankInfo.icon}
      </div>
      <div class="bank-name">${bankName} - ${accountType}</div>
    `;

    item.addEventListener('click', () => {
      createAccount(bankName, accountType);
    });

    list.appendChild(item);
  });
}

// Create account
async function createAccount(bankName, accountType) {
  try {
    const account = {
      name: `${bankName} - ${accountType}`,
      bankName: bankName,
      accountType: accountType,
      balance: 0,
      currency: 'PHP'
    };

    const result = await api.createAccount(account);
    
    // Reload data
    await loadData();
    render();
    
    hideAddAccountModal();
    showSuccess('Account added successfully!');
  } catch (error) {
    console.error('Error creating account:', error);
    showError('Failed to create account: ' + error.message);
  }
}

// Show account details
function showAccountDetails(account) {
  const modal = document.getElementById('accountDetailsModal');
  const title = document.getElementById('accountDetailsTitle');
  const content = document.getElementById('accountDetailsContent');

  title.textContent = account.name;
  
  const bankInfo = BANK_DATA[account.bankName] || { icon: '🏦', color: '#666666' };
  const balance = isBalanceVisible ? formatCurrency(account.balance) : '••••';

  content.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Bank</span>
      <span class="detail-value">${account.bankName}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Account Type</span>
      <span class="detail-value">${account.accountType}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Balance</span>
      <span class="detail-value">${balance}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Currency</span>
      <span class="detail-value">${account.currency}</span>
    </div>
  `;

  modal.classList.add('active');
}

// Hide account details modal
function hideAccountDetailsModal() {
  const modal = document.getElementById('accountDetailsModal');
  modal.classList.remove('active');
}

// Toggle balance visibility
function toggleBalanceVisibility() {
  isBalanceVisible = !isBalanceVisible;
  render();
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Group transactions by date
function groupTransactionsByDate(transactions) {
  const grouped = {};
  transactions.forEach(t => {
    const date = new Date(t.date).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(t);
  });
  return grouped;
}

// Show error message
function showError(message) {
  alert('Error: ' + message);
}

// Show success message
function showSuccess(message) {
  alert('Success: ' + message);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}






