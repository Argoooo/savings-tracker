// Trackers API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const supabase = getSupabaseClient(req.headers.get('authorization')?.replace('Bearer ', ''));

  if (req.method === 'GET') {
    try {
      const { data: trackers, error } = await supabase
        .from('trackers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const trackersList = (trackers || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));

      res.status(200).json(trackersList);
    } catch (error) {
      console.error('Error fetching trackers:', error);
      res.status(500).json({ error: 'Failed to fetch trackers', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description } = req.body;

      const { data: tracker, error } = await supabase
        .from('trackers')
        .insert({
          user_id: userId,
          name: name || 'My Savings Tracker',
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;

      // Create default settings for new tracker
      await supabase
        .from('settings')
        .insert({
          tracker_id: tracker.id,
          currency: 'PHP',
          locale: 'en-PH',
          current_rate_pct: 12.00,
          apy_pct: 3.00,
          inflation_pct: 4.00
        });

      // Create default scenario rates for new tracker
      await supabase
        .from('scenario_rates')
        .insert({
          tracker_id: tracker.id,
          rates: '[5,10,15,20]'
        });

      res.status(201).json({ 
        success: true, 
        id: tracker.id,
        name: tracker.name
      });
    } catch (error) {
      console.error('Error creating tracker:', error);
      res.status(500).json({ error: 'Failed to create tracker', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, description } = req.body;

      const { error } = await supabase
        .from('trackers')
        .update({
          name,
          description: description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this tracker

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating tracker:', error);
      res.status(500).json({ error: 'Failed to update tracker', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Tracker ID is required' });
      }

      // Delete tracker (cascade will delete all related data)
      const { error } = await supabase
        .from('trackers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user owns this tracker

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting tracker:', error);
      res.status(500).json({ error: 'Failed to delete tracker', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);

