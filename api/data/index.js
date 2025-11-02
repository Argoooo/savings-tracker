// API endpoint to get all data (requires authentication)
import { withAuth } from '../lib/auth.js';
import { query } from '../lib/db.js';

async function handler(req, res) {
  try {
    const userId = req.user.id; // From auth middleware

    // Fetch all data in parallel, filtered by user_id
    const [settingsResult, peopleResult, goalsResult, transactionsResult, scenarioRatesResult] = await Promise.all([
      query('SELECT * FROM settings WHERE user_id = $1 LIMIT 1', [userId]),
      query('SELECT * FROM people WHERE user_id = $1 ORDER BY created_at', [userId]),
      query('SELECT * FROM goals WHERE user_id = $1 ORDER BY priority, deadline', [userId]),
      query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]),
      query('SELECT rates FROM scenario_rates WHERE user_id = $1 LIMIT 1', [userId])
    ]);

    // Fetch incomes for all people
    const people = peopleResult.rows || [];
    const peopleWithIncomes = await Promise.all(
      people.map(async (person) => {
        const incomesResult = await query(
          'SELECT * FROM incomes WHERE person_id = $1 ORDER BY created_at',
          [person.id]
        );
        return {
          ...person,
          incomes: (incomesResult.rows || []).map(income => ({
            id: income.id,
            label: income.label,
            amount: parseFloat(income.amount),
            frequency: income.frequency
          }))
        };
      })
    );

    // Transform data to match frontend structure
    const settings = settingsResult.rows[0] || {};
    const scenarioRates = scenarioRatesResult.rows[0]?.rates 
      ? JSON.parse(scenarioRatesResult.rows[0].rates)
      : [5, 10, 15, 20];

    const response = {
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
      goals: (goalsResult.rows || []).map(g => ({
        id: g.id,
        name: g.name,
        target: parseFloat(g.target),
        deadline: g.deadline,
        owner: g.owner || 'Household',
        priority: parseInt(g.priority || 999)
      })),
      transactions: (transactionsResult.rows || []).map(t => ({
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
