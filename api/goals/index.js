// Goals API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const supabase = getSupabaseClient(req.headers.get('authorization')?.replace('Bearer ', ''));

  if (req.method === 'GET') {
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true })
        .order('deadline', { ascending: true });

      if (error) throw error;

      const goalsList = (goals || []).map(g => ({
        id: g.id,
        name: g.name,
        target: parseFloat(g.target),
        deadline: g.deadline,
        owner: g.owner || 'Household',
        priority: parseInt(g.priority || 999)
      }));

      res.status(200).json(goalsList);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, name, target, deadline, owner, priority } = req.body;

      const { error } = await supabase
        .from('goals')
        .insert({
          id,
          user_id: userId,
          name,
          target,
          deadline,
          owner: owner || 'Household',
          priority: priority || 999
        });

      if (error) throw error;

      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, target, deadline, owner, priority } = req.body;

      const { error } = await supabase
        .from('goals')
        .update({
          name,
          target,
          deadline,
          owner,
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this record

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this record

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Failed to delete goal', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
