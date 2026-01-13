// Finance Transactions API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

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

      if (!accountId || !type || amount === undefined) {
        return res.status(400).json({ error: 'Account ID, type, and amount are required' });
      }

      if (!['income', 'expense', 'transfer'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income, expense, or transfer' });
      }

      const { data: transaction, error } = await supabase
        .from('finance_transactions')
        .insert({
          user_id: userId,
          account_id: accountId,
          type: type,
          amount: amount,
          description: description || null,
          category: category || null,
          date: date || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        id: transaction.id,
        accountId: transaction.account_id,
        type: transaction.type,
        amount: parseFloat(transaction.amount)
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

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (accountId !== undefined) updateData.account_id = accountId;
      if (type !== undefined) updateData.type = type;
      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (date !== undefined) updateData.date = date;

      const { error } = await supabase
        .from('finance_transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
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

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);






