# Frontend Migration Guide

This document shows how to update your frontend code to use the API instead of localStorage.

## Key Changes Required

### 1. Replace `loadState()` function

**Before (localStorage):**
```javascript
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultState));
}

let appState = loadState();
```

**After (API):**
```javascript
let appState = null;

async function loadState() {
  try {
    appState = await api.getAllData();
    if (!appState) {
      // Fallback to default state if API returns null
      appState = JSON.parse(JSON.stringify(defaultState));
    }
    return appState;
  } catch (error) {
    console.error('Failed to load state:', error);
    // Fallback to default state on error
    return JSON.parse(JSON.stringify(defaultState));
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  appState = await loadState();
  renderAll();
});
```

### 2. Replace `saveState()` function

**Before (localStorage):**
```javascript
function saveState(changedSections = ['all']) {
  appState.lastModified = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  
  if (changedSections.includes('all')) {
    renderAll();
  } else {
    updateSections(changedSections);
  }
}
```

**After (API):**
```javascript
async function saveState(changedSections = ['all']) {
  try {
    // Save settings
    if (changedSections.includes('all') || changedSections.includes('settings')) {
      await api.updateSettings(appState.settings);
    }

    // Save scenario rates
    if (changedSections.includes('all') || changedSections.includes('rates')) {
      await api.updateScenarioRates(appState.scenarioRates);
    }

    // Note: People, goals, and transactions are saved individually
    // when created/updated/deleted, not in bulk
    
    if (changedSections.includes('all')) {
      renderAll();
    } else {
      updateSections(changedSections);
    }
  } catch (error) {
    console.error('Failed to save state:', error);
    alert('Failed to save data. Please check your connection.');
  }
}
```

### 3. Update People Operations

**Before (localStorage):**
```javascript
// Add person
appState.people.push({
  id: uid(),
  name: name,
  currentSavings: parseFloat(currentSavings),
  fixedMonthlyContribution: parseFloat(fixedMonthlyContribution),
  incomes: incomes
});
saveState(['people']);
```

**After (API):**
```javascript
// Add person
try {
  const newPerson = {
    id: uid(),
    name: name,
    currentSavings: parseFloat(currentSavings),
    fixedMonthlyContribution: parseFloat(fixedMonthlyContribution),
    incomes: incomes
  };
  await api.createPerson(newPerson);
  appState.people.push(newPerson);
  renderPeople();
} catch (error) {
  console.error('Failed to add person:', error);
  alert('Failed to add person. Please try again.');
}
```

**Update person:**
```javascript
// Before: Direct array manipulation
const person = appState.people.find(p => p.id === personId);
person.name = newName;
saveState(['people']);

// After: API call
try {
  const person = appState.people.find(p => p.id === personId);
  person.name = newName;
  await api.updatePerson(person);
  renderPeople();
} catch (error) {
  console.error('Failed to update person:', error);
  alert('Failed to update person. Please try again.');
}
```

**Delete person:**
```javascript
// Before: Array filter
appState.people = appState.people.filter(p => p.id !== personId);
saveState(['people', 'goals', 'transactions']);

// After: API call
try {
  await api.deletePerson(personId);
  appState.people = appState.people.filter(p => p.id !== personId);
  renderPeople();
  renderGoals(); // Update goals that may reference this person
  renderTransactions(); // Update transactions that may reference this person
} catch (error) {
  console.error('Failed to delete person:', error);
  alert('Failed to delete person. Please try again.');
}
```

### 4. Update Goals Operations

Similar pattern to people:

```javascript
// Create goal
try {
  const newGoal = {
    id: uid(),
    name: name,
    target: parseFloat(target),
    deadline: deadline,
    owner: owner,
    priority: parseInt(priority)
  };
  await api.createGoal(newGoal);
  appState.goals.push(newGoal);
  renderGoals();
} catch (error) {
  console.error('Failed to add goal:', error);
  alert('Failed to add goal. Please try again.');
}

// Update goal
try {
  const goal = appState.goals.find(g => g.id === goalId);
  goal.name = newName;
  goal.target = parseFloat(newTarget);
  // ... update other fields
  await api.updateGoal(goal);
  renderGoals();
} catch (error) {
  console.error('Failed to update goal:', error);
  alert('Failed to update goal. Please try again.');
}

// Delete goal
try {
  await api.deleteGoal(goalId);
  appState.goals = appState.goals.filter(g => g.id !== goalId);
  renderGoals();
} catch (error) {
  console.error('Failed to delete goal:', error);
  alert('Failed to delete goal. Please try again.');
}
```

### 5. Update Transactions Operations

```javascript
// Create transaction
try {
  const newTransaction = {
    id: uid(),
    date: date,
    person: person,
    amount: parseFloat(amount),
    note: note || '',
    goalId: goalId || null
  };
  await api.createTransaction(newTransaction);
  appState.transactions.unshift(newTransaction);
  renderTransactions();
  renderDashboard(); // Update charts
} catch (error) {
  console.error('Failed to add transaction:', error);
  alert('Failed to add transaction. Please try again.');
}

// Update transaction
try {
  const tx = appState.transactions.find(t => t.id === txId);
  tx.date = newDate;
  tx.amount = parseFloat(newAmount);
  // ... update other fields
  await api.updateTransaction(tx);
  renderTransactions();
  renderDashboard();
} catch (error) {
  console.error('Failed to update transaction:', error);
  alert('Failed to update transaction. Please try again.');
}

// Delete transaction
try {
  await api.deleteTransaction(txId);
  appState.transactions = appState.transactions.filter(t => t.id !== txId);
  renderTransactions();
  renderDashboard();
} catch (error) {
  console.error('Failed to delete transaction:', error);
  alert('Failed to delete transaction. Please try again.');
}
```

### 6. Update Settings Operations

```javascript
// Update settings
try {
  const currency = $('#currencyCode').value;
  const locale = $('#localeSelect').value;
  const currentRatePct = parseFloat($('#currentRate').value);
  const apyPct = parseFloat($('#apy').value);
  const inflationPct = parseFloat($('#inflation').value);
  
  appState.settings = { currency, locale, currentRatePct, apyPct, inflationPct };
  await api.updateSettings(appState.settings);
  renderSettings();
  renderDashboard(); // Recalculate with new settings
} catch (error) {
  console.error('Failed to update settings:', error);
  alert('Failed to update settings. Please try again.');
}
```

### 7. Update Scenario Rates

```javascript
// Update scenario rates
try {
  const nums = $('#rateInput').value.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
  appState.scenarioRates = nums;
  await api.updateScenarioRates(nums);
  renderRatesTable();
} catch (error) {
  console.error('Failed to update scenario rates:', error);
  alert('Failed to update scenario rates. Please try again.');
}
```

### 8. Add Loading States

Add visual feedback for API operations:

```javascript
async function withLoading(element, asyncFunction) {
  const originalContent = element.innerHTML;
  element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
  element.disabled = true;
  
  try {
    await asyncFunction();
  } finally {
    element.innerHTML = originalContent;
    element.disabled = false;
  }
}

// Usage:
$('#addPersonBtn').addEventListener('click', async () => {
  await withLoading($('#addPersonBtn'), async () => {
    // ... add person logic
  });
});
```

### 9. Add Error Handling UI

```javascript
function showError(message) {
  // Create or update error banner
  let errorBanner = document.getElementById('error-banner');
  if (!errorBanner) {
    errorBanner = document.createElement('div');
    errorBanner.id = 'error-banner';
    errorBanner.className = 'alert alert-danger alert-dismissible fade show';
    errorBanner.style.position = 'fixed';
    errorBanner.style.top = '20px';
    errorBanner.style.right = '20px';
    errorBanner.style.zIndex = '9999';
    document.body.appendChild(errorBanner);
  }
  
  errorBanner.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    errorBanner.remove();
  }, 5000);
}

// Use in catch blocks:
catch (error) {
  showError(`Failed to save: ${error.message}`);
}
```

### 10. Handle Offline Mode (Optional)

Add a service worker or detect offline status:

```javascript
// Check if online
function isOnline() {
  return navigator.onLine;
}

// Show offline indicator
if (!isOnline()) {
  showWarning('You are offline. Changes will be saved when you reconnect.');
}

// Queue operations when offline
const offlineQueue = [];

async function queueOperation(operation) {
  if (isOnline()) {
    await operation();
  } else {
    offlineQueue.push(operation);
    showWarning('Queued for sync when online');
  }
}

// Sync queue when back online
window.addEventListener('online', async () => {
  while (offlineQueue.length > 0) {
    const operation = offlineQueue.shift();
    try {
      await operation();
    } catch (error) {
      console.error('Failed to sync queued operation:', error);
    }
  }
  showSuccess('All changes synced!');
});
```

## Complete Example: Migrated Add Person Function

Here's a complete example showing the before/after:

### Before:
```javascript
$('#addPersonBtn').addEventListener('click', () => {
  const name = $('#personName').value.trim();
  const currentSavings = parseFloat($('#personSavings').value) || 0;
  const fixedMonthlyContribution = parseFloat($('#personFixedContribution').value) || 0;
  
  // Collect incomes
  const incomes = [];
  // ... income collection logic
  
  appState.people.push({
    id: uid(),
    name,
    currentSavings,
    fixedMonthlyContribution,
    incomes
  });
  
  saveState(['people']);
  renderPeople();
  $('#addPersonForm').reset();
});
```

### After:
```javascript
$('#addPersonBtn').addEventListener('click', async () => {
  const name = $('#personName').value.trim();
  if (!name) {
    alert('Please enter a name');
    return;
  }
  
  const currentSavings = parseFloat($('#personSavings').value) || 0;
  const fixedMonthlyContribution = parseFloat($('#personFixedContribution').value) || 0;
  
  // Collect incomes
  const incomes = [];
  // ... income collection logic
  
  const newPerson = {
    id: uid(),
    name,
    currentSavings,
    fixedMonthlyContribution,
    incomes
  };
  
  try {
    // Show loading state
    $('#addPersonBtn').disabled = true;
    $('#addPersonBtn').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';
    
    await api.createPerson(newPerson);
    appState.people.push(newPerson);
    renderPeople();
    $('#addPersonForm').reset();
    
    // Reset button
    $('#addPersonBtn').disabled = false;
    $('#addPersonBtn').innerHTML = '+ Add Person';
  } catch (error) {
    console.error('Failed to add person:', error);
    showError(`Failed to add person: ${error.message}`);
    
    // Reset button
    $('#addPersonBtn').disabled = false;
    $('#addPersonBtn').innerHTML = '+ Add Person';
  }
});
```

## Summary

Main changes:
1. ✅ Replace `loadState()` with async API call
2. ✅ Replace `saveState()` with individual API calls per entity
3. ✅ Add error handling to all operations
4. ✅ Add loading states for better UX
5. ✅ Update all CRUD operations to use API
6. ✅ Initialize appState asynchronously on page load

The API client (`js/api.js`) handles all HTTP requests, so you just need to call the methods instead of manipulating localStorage.

