// API endpoint to get all data for a specific tracker (requires authentication)
import { withAuth } from '../lib/auth.js';
import { getSupabaseClient } from '../lib/db-supabase.js';

async function handler(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    const { trackerId } = req.query; // Get tracker ID from query parameter

    if (!trackerId) {
      return res.status(400).json({ error: 'trackerId is required' });
    }

    // Vercel uses plain object for headers, not Headers API
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    const token = authHeader?.replace('Bearer ', '') || '';
    const supabase = getSupabaseClient(token);

    // Fetch all data in parallel, filtered by tracker_id
    const [settingsResult, peopleResult, goalsResult, transactionsResult, scenarioRatesResult] = await Promise.all([
      supabase.from('settings').select('*').eq('tracker_id', trackerId).single(),
      supabase.from('people').select('*').eq('tracker_id', trackerId).order('created_at', { ascending: true }),
      supabase.from('goals').select('*').eq('tracker_id', trackerId).order('priority', { ascending: true }).order('deadline', { ascending: true }),
      supabase.from('transactions').select('*').eq('tracker_id', trackerId).order('date', { ascending: false }),
      supabase.from('scenario_rates').select('rates').eq('tracker_id', trackerId).single()
    ]);

    // Check for errors
    if (settingsResult.error && settingsResult.error.code !== 'PGRST116') throw settingsResult.error;
    if (peopleResult.error) throw peopleResult.error;
    if (goalsResult.error) throw goalsResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (scenarioRatesResult.error && scenarioRatesResult.error.code !== 'PGRST116') throw scenarioRatesResult.error;

    // Fetch incomes for all people using service role to bypass RLS
    const people = peopleResult.data || [];
    
    // Use service role client for fetching incomes to bypass RLS
    const { createClient } = await import('@supabase/supabase-js');
    const serviceRoleClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const peopleWithIncomes = await Promise.all(
      people.map(async (person) => {
        const { data: incomes, error: incomesError } = await serviceRoleClient
          .from('incomes')
          .select('*')
          .eq('person_id', person.id)
          .order('created_at', { ascending: true });

        if (incomesError) {
          console.error(`Error fetching incomes for person ${person.id}:`, incomesError);
          throw incomesError;
        }

        console.log(`Fetched ${incomes?.length || 0} incomes for person ${person.id} (${person.name})`);

        return {
          ...person,
          incomes: (incomes || []).map(income => ({
            id: income.id,
            label: income.label,
            amount: parseFloat(income.amount),
            frequency: income.frequency
          }))
        };
      })
    );

    // Transform data to match frontend structure
    const settings = settingsResult.data || {};
    const scenarioRates = scenarioRatesResult.data?.rates 
      ? JSON.parse(scenarioRatesResult.data.rates)
      : [5, 10, 15, 20];

    const response = {
      trackerId: trackerId,
      settings: {
        currency: settings.currency || 'PHP',
        locale: settings.locale || 'en-PH',
        currentRatePct: parseFloat(settings.current_rate_pct || 12),
        apyPct: parseFloat(settings.apy_pct || 3),
        inflationPct: parseFloat(settings.inflation_pct || 4)
      },
      people: peopleWithIncomes.map(p => ({
        id: p.id,
        name: p.name,
        currentSavings: parseFloat(p.current_savings || 0),
        fixedMonthlyContribution: parseFloat(p.fixed_monthly_contribution || 0),
        incomes: p.incomes
      })),
      goals: (goalsResult.data || []).map(g => ({
        id: g.id,
        name: g.name,
        target: parseFloat(g.target),
        deadline: g.deadline,
        owner: g.owner || 'Household',
        priority: parseInt(g.priority || 999)
      })),
      transactions: (transactionsResult.data || []).map(t => ({
        id: t.id,
        date: t.date,
        person: t.person,
        amount: parseFloat(t.amount),
        note: t.note || '',
        goalId: t.goal_id || null
      })),
      scenarioRates,
      lastModified: settings.last_modified || new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}

// Export with auth middleware
export default withAuth(handler);
