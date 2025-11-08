// Tracker Shares API endpoint
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

  if (req.method === 'GET') {
    try {
      const { trackerId } = req.query;

      if (!trackerId) {
        return res.status(400).json({ error: 'trackerId is required' });
      }

      // Verify user owns the tracker or has access
      const { data: tracker, error: trackerError } = await supabase
        .from('trackers')
        .select('id, user_id')
        .eq('id', trackerId)
        .single();

      if (trackerError || !tracker) {
        return res.status(404).json({ error: 'Tracker not found' });
      }

      // Check if user owns tracker or has share access
      const isOwner = tracker.user_id === userId;
      const { data: share } = await supabase
        .from('tracker_shares')
        .select('*')
        .eq('tracker_id', trackerId)
        .eq('shared_with_user_id', userId)
        .single();

      if (!isOwner && !share) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get all shares for this tracker (only owner can see all shares)
      if (isOwner) {
        const { data: shares, error: sharesError } = await supabase
          .from('tracker_shares')
          .select(`
            id,
            tracker_id,
            shared_with_user_id,
            permission,
            shared_by_user_id,
            created_at,
            updated_at
          `)
          .eq('tracker_id', trackerId)
          .order('created_at', { ascending: false });

        if (sharesError) throw sharesError;

        // Look up user emails for each share
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
        const usersMap = new Map((allUsers?.users || []).map(u => [u.id, u.email]));

        // Enrich shares with email addresses
        const sharesWithEmails = (shares || []).map(share => ({
          ...share,
          shared_with_email: usersMap.get(share.shared_with_user_id) || null
        }));

        return res.status(200).json(sharesWithEmails);
      } else {
        // Shared user can only see their own share
        // Look up email for the share
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(share.shared_with_user_id);
        
        return res.status(200).json([{
          ...share,
          shared_with_email: userData?.user?.email || null
        }]);
      }
    } catch (error) {
      console.error('Error fetching tracker shares:', error);
      return res.status(500).json({ error: 'Failed to fetch tracker shares', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { trackerId, sharedWithUserId, sharedWithEmail, permission = 'read' } = req.body;

      if (!trackerId) {
        return res.status(400).json({ error: 'trackerId is required' });
      }
      
      if (!sharedWithUserId && !sharedWithEmail) {
        return res.status(400).json({ error: 'Either sharedWithUserId or sharedWithEmail is required' });
      }

      if (!['read', 'write'].includes(permission)) {
        return res.status(400).json({ error: 'permission must be "read" or "write"' });
      }

      // Verify user owns the tracker
      const { data: tracker, error: trackerError } = await supabase
        .from('trackers')
        .select('id, user_id')
        .eq('id', trackerId)
        .single();

      if (trackerError || !tracker) {
        return res.status(404).json({ error: 'Tracker not found' });
      }

      if (tracker.user_id !== userId) {
        return res.status(403).json({ error: 'Only tracker owner can share' });
      }

      // If email provided, look up user by email
      let targetUserId = sharedWithUserId;
      if (sharedWithEmail && !targetUserId) {
        // Use service role key to look up user by email
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error looking up user by email:', userError);
          return res.status(500).json({ error: 'Failed to look up user by email', details: userError.message });
        }

        const user = users?.users?.find(u => u.email?.toLowerCase() === sharedWithEmail.toLowerCase());
        
        if (!user) {
          return res.status(404).json({ error: `User with email "${sharedWithEmail}" not found. They need to sign up first.` });
        }

        targetUserId = user.id;
      }

      if (targetUserId === userId) {
        return res.status(400).json({ error: 'Cannot share tracker with yourself' });
      }

      // Create share
      const { data: share, error: shareError } = await supabase
        .from('tracker_shares')
        .insert({
          tracker_id: trackerId,
          shared_with_user_id: targetUserId,
          permission,
          shared_by_user_id: userId,
        })
        .select()
        .single();

      if (shareError) {
        if (shareError.code === '23505') { // Unique constraint violation
          return res.status(409).json({ error: 'Tracker already shared with this user' });
        }
        throw shareError;
      }

      return res.status(201).json(share);
    } catch (error) {
      console.error('Error creating tracker share:', error);
      return res.status(500).json({ error: 'Failed to create tracker share', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { shareId, trackerId } = req.query;

      if (!shareId && !trackerId) {
        return res.status(400).json({ error: 'shareId or trackerId is required' });
      }

      let query = supabase.from('tracker_shares').delete();

      if (shareId) {
        // Delete specific share
        query = query.eq('id', shareId);
      } else {
        // Delete all shares for tracker (only owner can do this)
        query = query.eq('tracker_id', trackerId);
      }

      // Verify user has permission to delete
      if (shareId) {
        const { data: share } = await supabase
          .from('tracker_shares')
          .select('tracker_id, shared_with_user_id')
          .eq('id', shareId)
          .single();

        if (share) {
          const { data: tracker } = await supabase
            .from('trackers')
            .select('user_id')
            .eq('id', share.tracker_id)
            .single();

          if (tracker.user_id !== userId && share.shared_with_user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
          }
        }
      } else {
        // Verify user owns tracker
        const { data: tracker } = await supabase
          .from('trackers')
          .select('user_id')
          .eq('id', trackerId)
          .single();

        if (tracker.user_id !== userId) {
          return res.status(403).json({ error: 'Only tracker owner can delete all shares' });
        }
      }

      const { error } = await query;

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting tracker share:', error);
      return res.status(500).json({ error: 'Failed to delete tracker share', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { shareId, permission } = req.body;

      if (!shareId || !permission) {
        return res.status(400).json({ error: 'shareId and permission are required' });
      }

      if (!['read', 'write'].includes(permission)) {
        return res.status(400).json({ error: 'permission must be "read" or "write"' });
      }

      // Verify user owns the tracker
      const { data: share } = await supabase
        .from('tracker_shares')
        .select('tracker_id')
        .eq('id', shareId)
        .single();

      if (!share) {
        return res.status(404).json({ error: 'Share not found' });
      }

      const { data: tracker } = await supabase
        .from('trackers')
        .select('user_id')
        .eq('id', share.tracker_id)
        .single();

      if (tracker.user_id !== userId) {
        return res.status(403).json({ error: 'Only tracker owner can update share permissions' });
      }

      const { data: updatedShare, error } = await supabase
        .from('tracker_shares')
        .update({ permission, updated_at: new Date().toISOString() })
        .eq('id', shareId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(updatedShare);
    } catch (error) {
      console.error('Error updating tracker share:', error);
      return res.status(500).json({ error: 'Failed to update tracker share', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);

