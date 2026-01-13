// Finance Accounts API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

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
          name: name,
          bank_name: bankName,
          account_type: accountType,
          balance: balance || 0,
          currency: currency || 'PHP',
          icon_url: iconUrl || null,
          color: color || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        id: account.id,
        name: account.name,
        bankName: account.bank_name,
        accountType: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, bankName, accountType, balance, currency, iconUrl, color, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Account ID is required' });
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name !== undefined) updateData.name = name;
      if (bankName !== undefined) updateData.bank_name = bankName;
      if (accountType !== undefined) updateData.account_type = accountType;
      if (balance !== undefined) updateData.balance = balance;
      if (currency !== undefined) updateData.currency = currency;
      if (iconUrl !== undefined) updateData.icon_url = iconUrl;
      if (color !== undefined) updateData.color = color;
      if (isActive !== undefined) updateData.is_active = isActive;

      const { error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
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

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);






