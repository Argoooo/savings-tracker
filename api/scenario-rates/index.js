// Scenario rates API endpoint (requires authentication and trackerId)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  const userId = req.user.id;
  const { trackerId } = req.query; // Get from query parameter

  if (!trackerId) {
    return res.status(400).json({ error: 'trackerId is required' });
  }

  const supabase = getSupabaseClient(req.headers.get('authorization')?.replace('Bearer ', ''));

  if (req.method === 'GET') {
    try {
      const { data: scenarioRates, error } = await supabase
        .from('scenario_rates')
        .select('rates')
        .eq('tracker_id', trackerId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      const rates = scenarioRates?.rates 
        ? JSON.parse(scenarioRates.rates)
        : [5, 10, 15, 20];

      res.status(200).json(rates);
    } catch (error) {
      console.error('Error fetching scenario rates:', error);
      res.status(500).json({ error: 'Failed to fetch scenario rates', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const rates = req.body;

      if (!Array.isArray(rates)) {
        return res.status(400).json({ error: 'Rates must be an array' });
      }

      // Upsert scenario rates
      const { error } = await supabase
        .from('scenario_rates')
        .upsert({
          tracker_id: trackerId,
          rates: JSON.stringify(rates),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tracker_id'
        });

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating scenario rates:', error);
      res.status(500).json({ error: 'Failed to update scenario rates', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
