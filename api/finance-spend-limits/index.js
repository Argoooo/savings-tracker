// Spend Limits API endpoint (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = authHeader?.replace('Bearer ', '') || '';
  const supabase = getSupabaseClient(token);

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

      if (!limitAmount || !period || !periodStart || !periodEnd) {
        return res.status(400).json({ error: 'Limit amount, period, start, and end dates are required' });
      }

      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({ error: 'Period must be daily, weekly, monthly, or yearly' });
      }

      const { data: limit, error } = await supabase
        .from('spend_limits')
        .insert({
          user_id: userId,
          account_id: accountId || null,
          category: category || null,
          limit_amount: limitAmount,
          period: period,
          current_spent: 0,
          period_start: periodStart,
          period_end: periodEnd
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        id: limit.id,
        limitAmount: parseFloat(limit.limit_amount),
        period: limit.period
      });
    } catch (error) {
      console.error('Error creating spend limit:', error);
      res.status(500).json({ error: 'Failed to create spend limit', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, limitAmount, currentSpent, periodStart, periodEnd, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Limit ID is required' });
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (limitAmount !== undefined) updateData.limit_amount = limitAmount;
      if (currentSpent !== undefined) updateData.current_spent = currentSpent;
      if (periodStart !== undefined) updateData.period_start = periodStart;
      if (periodEnd !== undefined) updateData.period_end = periodEnd;
      if (isActive !== undefined) updateData.is_active = isActive;

      const { error } = await supabase
        .from('spend_limits')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating spend limit:', error);
      res.status(500).json({ error: 'Failed to update spend limit', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Limit ID is required' });
      }

      const { error } = await supabase
        .from('spend_limits')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting spend limit:', error);
      res.status(500).json({ error: 'Failed to delete spend limit', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);






