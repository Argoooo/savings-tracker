// Consolidated Finance API endpoint (accounts, transactions, spend-limits)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);
  
  // Get resource from URL path (e.g., /api/finance/accounts -> accounts)
  // Vercel provides the dynamic segment in req.query or we can parse from URL
  let resource = req.query?.resource;
  if (!resource && req.url) {
    const url = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
    const pathParts = url.pathname.split('/').filter(p => p);
    resource = pathParts[pathParts.length - 1]; // Last part of path
  }

  // Route to appropriate handler based on resource
  if (resource === 'accounts') {
    return handleAccounts(req, res, userId, supabase);
  } else if (resource === 'transactions') {
    return handleTransactions(req, res, userId, supabase);
  } else if (resource === 'spend-limits') {
    return handleSpendLimits(req, res, userId, supabase);
  } else {
    return res.status(404).json({ error: 'Resource not found' });
  }
}

// Accounts handler
async function handleAccounts(req, res, userId, supabase) {
  if (req.method === 'GET') {
    try {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const accountsList = (accounts || []).map(acc => ({
        id: acc.id,
        name: acc.name,
        bankName: acc.bank_name,
        accountType: acc.account_type,
        balance: parseFloat(acc.balance),
        currency: acc.currency,
        iconUrl: acc.icon_url,
        color: acc.color,
        createdAt: acc.created_at,
        updatedAt: acc.updated_at
      }));

      res.status(200).json(accountsList);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, bankName, accountType, balance, currency, iconUrl, color } = req.body;

      if (!name || !bankName || !accountType) {
        return res.status(400).json({ error: 'Name, bank name, and account type are required' });
      }

      const { data: account, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          name,
          bank_name: bankName,
          account_type: accountType,
          balance: balance || 0,
          currency: currency || 'PHP',
          icon_url: iconUrl,
          color,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: account.id,
        name: account.name,
        bankName: account.bank_name,
        accountType: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency,
        iconUrl: account.icon_url,
        color: account.color,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, bankName, accountType, balance, currency, iconUrl, color } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Account ID is required' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (bankName !== undefined) updateData.bank_name = bankName;
      if (accountType !== undefined) updateData.account_type = accountType;
      if (balance !== undefined) updateData.balance = balance;
      if (currency !== undefined) updateData.currency = currency;
      if (iconUrl !== undefined) updateData.icon_url = iconUrl;
      if (color !== undefined) updateData.color = color;
      updateData.updated_at = new Date().toISOString();

      const { data: account, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        id: account.id,
        name: account.name,
        bankName: account.bank_name,
        accountType: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency,
        iconUrl: account.icon_url,
        color: account.color,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      });
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: 'Failed to update account', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Account ID is required' });
      }

      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Transactions handler
async function handleTransactions(req, res, userId, supabase) {
  if (req.method === 'GET') {
    try {
      const { accountId, limit, offset } = req.query;

      let query = supabase
        .from('finance_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      if (limit) {
        query = query.limit(parseInt(limit));
      }

      if (offset) {
        query = query.offset(parseInt(offset));
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      const transactionsList = (transactions || []).map(t => ({
        id: t.id,
        accountId: t.account_id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description || '',
        category: t.category || '',
        date: t.date,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));

      res.status(200).json(transactionsList);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { accountId, type, amount, description, category, date } = req.body;

      if (!accountId || !type || !amount || !date) {
        return res.status(400).json({ error: 'Account ID, type, amount, and date are required' });
      }

      const { data: transaction, error } = await supabase
        .from('finance_transactions')
        .insert({
          user_id: userId,
          account_id: accountId,
          type,
          amount,
          description,
          category,
          date
        })
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      const balanceChange = type === 'income' ? amount : -amount;
      const { error: balanceError } = await supabase.rpc('update_account_balance', {
        account_id: accountId,
        amount_change: balanceChange
      });

      if (balanceError) {
        console.warn('Failed to update account balance:', balanceError);
      }

      res.status(201).json({
        id: transaction.id,
        accountId: transaction.account_id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, accountId, type, amount, description, category, date } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }

      const updateData = {};
      if (accountId !== undefined) updateData.account_id = accountId;
      if (type !== undefined) updateData.type = type;
      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (date !== undefined) updateData.date = date;
      updateData.updated_at = new Date().toISOString();

      const { data: transaction, error } = await supabase
        .from('finance_transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        id: transaction.id,
        accountId: transaction.account_id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }

      const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Spend Limits handler
async function handleSpendLimits(req, res, userId, supabase) {
  if (req.method === 'GET') {
    try {
      const { accountId } = req.query;

      let query = supabase
        .from('spend_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data: limits, error } = await query;

      if (error) throw error;

      const limitsList = (limits || []).map(l => ({
        id: l.id,
        accountId: l.account_id,
        category: l.category,
        limitAmount: parseFloat(l.limit_amount),
        period: l.period,
        currentSpent: parseFloat(l.current_spent),
        periodStart: l.period_start,
        periodEnd: l.period_end,
        createdAt: l.created_at,
        updatedAt: l.updated_at
      }));

      res.status(200).json(limitsList);
    } catch (error) {
      console.error('Error fetching spend limits:', error);
      res.status(500).json({ error: 'Failed to fetch spend limits', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { accountId, category, limitAmount, period, periodStart, periodEnd } = req.body;

      if (!accountId || !category || !limitAmount || !period) {
        return res.status(400).json({ error: 'Account ID, category, limit amount, and period are required' });
      }

      const { data: limit, error } = await supabase
        .from('spend_limits')
        .insert({
          user_id: userId,
          account_id: accountId,
          category,
          limit_amount: limitAmount,
          period,
          period_start: periodStart,
          period_end: periodEnd,
          current_spent: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: limit.id,
        accountId: limit.account_id,
        category: limit.category,
        limitAmount: parseFloat(limit.limit_amount),
        period: limit.period,
        currentSpent: parseFloat(limit.current_spent),
        periodStart: limit.period_start,
        periodEnd: limit.period_end,
        createdAt: limit.created_at,
        updatedAt: limit.updated_at
      });
    } catch (error) {
      console.error('Error creating spend limit:', error);
      res.status(500).json({ error: 'Failed to create spend limit', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, category, limitAmount, period, periodStart, periodEnd, currentSpent } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Spend limit ID is required' });
      }

      const updateData = {};
      if (category !== undefined) updateData.category = category;
      if (limitAmount !== undefined) updateData.limit_amount = limitAmount;
      if (period !== undefined) updateData.period = period;
      if (periodStart !== undefined) updateData.period_start = periodStart;
      if (periodEnd !== undefined) updateData.period_end = periodEnd;
      if (currentSpent !== undefined) updateData.current_spent = currentSpent;
      updateData.updated_at = new Date().toISOString();

      const { data: limit, error } = await supabase
        .from('spend_limits')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        id: limit.id,
        accountId: limit.account_id,
        category: limit.category,
        limitAmount: parseFloat(limit.limit_amount),
        period: limit.period,
        currentSpent: parseFloat(limit.current_spent),
        periodStart: limit.period_start,
        periodEnd: limit.period_end,
        createdAt: limit.created_at,
        updatedAt: limit.updated_at
      });
    } catch (error) {
      console.error('Error updating spend limit:', error);
      res.status(500).json({ error: 'Failed to update spend limit', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Spend limit ID is required' });
      }

      const { error } = await supabase
        .from('spend_limits')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ message: 'Spend limit deleted successfully' });
    } catch (error) {
      console.error('Error deleting spend limit:', error);
      res.status(500).json({ error: 'Failed to delete spend limit', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);

