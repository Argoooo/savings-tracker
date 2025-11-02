// Transactions API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const supabase = getSupabaseClient(req.headers.get('authorization')?.replace('Bearer ', ''));

  if (req.method === 'GET') {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const transactionsList = (transactions || []).map(t => ({
        id: t.id,
        date: t.date,
        person: t.person,
        amount: parseFloat(t.amount),
        note: t.note || '',
        goalId: t.goal_id || null
      }));

      res.status(200).json(transactionsList);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, date, person, amount, note, goalId } = req.body;

      const { error } = await supabase
        .from('transactions')
        .insert({
          id,
          user_id: userId,
          date,
          person,
          amount,
          note: note || '',
          goal_id: goalId || null
        });

      if (error) throw error;

      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, date, person, amount, note, goalId } = req.body;

      const { error } = await supabase
        .from('transactions')
        .update({
          date,
          person,
          amount,
          note: note || '',
          goal_id: goalId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this record

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
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this record

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
