// Trackers API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  // Vercel uses plain object for headers, not Headers API
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

  if (req.method === 'GET') {
    try {
      // Get owned trackers
      const { data: ownedTrackers, error: ownedError } = await supabase
        .from('trackers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ownedError) throw ownedError;

      // Get shared trackers
      const { data: shares, error: sharesError } = await supabase
        .from('tracker_shares')
        .select('tracker_id')
        .eq('shared_with_user_id', userId);

      if (sharesError) throw sharesError;

      const sharedTrackerIds = (shares || []).map(s => s.tracker_id);
      let sharedTrackers = [];
      
      if (sharedTrackerIds.length > 0) {
        const { data, error: sharedError } = await supabase
          .from('trackers')
          .select('*')
          .in('id', sharedTrackerIds)
          .order('created_at', { ascending: false });
        
        if (sharedError) throw sharedError;
        sharedTrackers = data || [];
      }

      // Combine and deduplicate
      const allTrackers = [...(ownedTrackers || []), ...sharedTrackers];
      const uniqueTrackers = Array.from(
        new Map(allTrackers.map(t => [t.id, t])).values()
      );

      const trackersList = uniqueTrackers.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        isOwner: t.user_id === userId,
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
  } else if (req.method === 'PATCH') {
    // Transfer ownership
    try {
      const { id, newOwnerId, newOwnerEmail } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Tracker ID is required' });
      }

      if (!newOwnerId && !newOwnerEmail) {
        return res.status(400).json({ error: 'Either newOwnerId or newOwnerEmail is required' });
      }

      // Create admin client for ownership transfer (bypasses RLS)
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
      );

      // Verify user owns the tracker
      const { data: tracker, error: trackerError } = await supabase
        .from('trackers')
        .select('id, user_id')
        .eq('id', id)
        .single();

      if (trackerError || !tracker) {
        return res.status(404).json({ error: 'Tracker not found' });
      }

      if (tracker.user_id !== userId) {
        return res.status(403).json({ error: 'Only tracker owner can transfer ownership' });
      }

      // Look up new owner by email if needed
      let targetUserId = newOwnerId;
      if (newOwnerEmail && !targetUserId) {
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error looking up user by email:', userError);
          return res.status(500).json({ error: 'Failed to look up user by email', details: userError.message });
        }

        const user = users?.users?.find(u => u.email?.toLowerCase() === newOwnerEmail.toLowerCase());
        
        if (!user) {
          return res.status(404).json({ error: `User with email "${newOwnerEmail}" not found. They need to sign up first.` });
        }

        targetUserId = user.id;
      }

      if (targetUserId === userId) {
        return res.status(400).json({ error: 'Cannot transfer tracker to yourself' });
      }

      // Transfer ownership: Update tracker's user_id using admin client to bypass RLS
      const { error: updateError } = await supabaseAdmin
        .from('trackers')
        .update({
          user_id: targetUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Remove any existing shares between old owner and new owner for this tracker
      // Use admin client to ensure we can delete shares regardless of RLS
      await supabaseAdmin
        .from('tracker_shares')
        .delete()
        .eq('tracker_id', id)
        .eq('shared_with_user_id', targetUserId);

      // Remove old owner's share access if they had any
      await supabaseAdmin
        .from('tracker_shares')
        .delete()
        .eq('tracker_id', id)
        .eq('shared_with_user_id', userId);

      res.status(200).json({ success: true, message: 'Tracker ownership transferred successfully' });
    } catch (error) {
      console.error('Error transferring tracker ownership:', error);
      res.status(500).json({ error: 'Failed to transfer tracker ownership', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);

