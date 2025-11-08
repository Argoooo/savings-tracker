// Transactions API endpoint (requires authentication and trackerId)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const { trackerId } = req.query; // Get from query parameter

  if (!trackerId) {
    return res.status(400).json({ error: 'trackerId is required' });
  }

  // Vercel uses plain object for headers, not Headers API
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

  if (req.method === 'GET') {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tracker_id', trackerId)
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
          tracker_id: trackerId,
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
        .eq('tracker_id', trackerId); // Ensure it's in the correct tracker

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
        .eq('tracker_id', trackerId); // Ensure it's in the correct tracker

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
