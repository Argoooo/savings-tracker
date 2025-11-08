// People API endpoint (requires authentication and trackerId)
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
      const { data: people, error } = await supabase
        .from('people')
        .select('*')
        .eq('tracker_id', trackerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch incomes for each person
      const peopleWithIncomes = await Promise.all(
        (people || []).map(async (person) => {
          const { data: incomes, error: incomesError } = await supabase
            .from('incomes')
            .select('*')
            .eq('person_id', person.id)
            .order('created_at', { ascending: true });

          if (incomesError) throw incomesError;

          return {
            id: person.id,
            name: person.name,
            currentSavings: parseFloat(person.current_savings || 0),
            fixedMonthlyContribution: parseFloat(person.fixed_monthly_contribution || 0),
            incomes: (incomes || []).map(income => ({
              id: income.id,
              label: income.label,
              amount: parseFloat(income.amount),
              frequency: income.frequency
            }))
          };
        })
      );

      res.status(200).json(peopleWithIncomes);
    } catch (error) {
      console.error('Error fetching people:', error);
      res.status(500).json({ error: 'Failed to fetch people', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { id, name, currentSavings, fixedMonthlyContribution, incomes } = req.body;

      // Insert person
      const { data: person, error: personError } = await supabase
        .from('people')
        .insert({
          id,
          tracker_id: trackerId,
          name,
          current_savings: currentSavings || 0,
          fixed_monthly_contribution: fixedMonthlyContribution || 0
        })
        .select()
        .single();

      if (personError) throw personError;

      // Insert incomes if provided
      if (incomes && Array.isArray(incomes) && incomes.length > 0) {
        const incomesData = incomes.map(income => ({
          id: income.id,
          person_id: id,
          label: income.label,
          amount: income.amount,
          frequency: income.frequency || 'monthly'
        }));

        const { error: incomesError } = await supabase
          .from('incomes')
          .insert(incomesData);

        if (incomesError) throw incomesError;
      }

      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating person:', error);
      res.status(500).json({ error: 'Failed to create person', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, currentSavings, fixedMonthlyContribution, incomes } = req.body;

      // Update person (verify it belongs to user's tracker)
      const { error: personError } = await supabase
        .from('people')
        .update({
          name,
          current_savings: currentSavings,
          fixed_monthly_contribution: fixedMonthlyContribution,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tracker_id', trackerId); // Ensure it's in the correct tracker

      if (personError) throw personError;

      // Delete existing incomes and insert new ones
      const { error: deleteError } = await supabase
        .from('incomes')
        .delete()
        .eq('person_id', id);

      if (deleteError) throw deleteError;

      if (incomes && Array.isArray(incomes) && incomes.length > 0) {
        const incomesData = incomes.map(income => ({
          id: income.id,
          person_id: id,
          label: income.label,
          amount: income.amount,
          frequency: income.frequency || 'monthly'
        }));

        const { error: incomesError } = await supabase
          .from('incomes')
          .insert(incomesData);

        if (incomesError) throw incomesError;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating person:', error);
      res.status(500).json({ error: 'Failed to update person', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Person ID is required' });
      }

      // Delete person (verify it belongs to user's tracker)
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id)
        .eq('tracker_id', trackerId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting person:', error);
      res.status(500).json({ error: 'Failed to delete person', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
