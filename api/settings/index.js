// Settings API endpoint (requires authentication and trackerId)
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
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('tracker_id', trackerId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert({
            tracker_id: trackerId,
            currency: 'PHP',
            locale: 'en-PH',
            current_rate_pct: 12.00,
            apy_pct: 3.00,
            inflation_pct: 4.00
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return res.status(200).json({
          currency: newSettings.currency,
          locale: newSettings.locale,
          currentRatePct: parseFloat(newSettings.current_rate_pct),
          apyPct: parseFloat(newSettings.apy_pct),
          inflationPct: parseFloat(newSettings.inflation_pct)
        });
      }

      res.status(200).json({
        currency: data.currency,
        locale: data.locale,
        currentRatePct: parseFloat(data.current_rate_pct),
        apyPct: parseFloat(data.apy_pct),
        inflationPct: parseFloat(data.inflation_pct)
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { currency, locale, currentRatePct, apyPct, inflationPct } = req.body;

      // Upsert settings (insert or update)
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          tracker_id: trackerId,
          currency,
          locale,
          current_rate_pct: currentRatePct,
          apy_pct: apyPct,
          inflation_pct: inflationPct,
          updated_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        }, {
          onConflict: 'tracker_id'
        })
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
