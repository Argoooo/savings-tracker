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

        // Use service role client to bypass RLS since we've already verified access via tracker_id
        const { createClient } = await import('@supabase/supabase-js');
        const serviceRoleClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error: incomesError } = await serviceRoleClient
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

      // First, verify the person exists and belongs to this tracker
      const { data: existingPerson, error: checkError } = await supabase
        .from('people')
        .select('id')
        .eq('id', id)
        .eq('tracker_id', trackerId)
        .single();

      if (checkError || !existingPerson) {
        return res.status(404).json({ 
          error: 'Person not found', 
          details: `Person with id ${id} not found in tracker ${trackerId}` 
        });
      }

      // Update person (verify it belongs to user's tracker)
      const { data: updatedPerson, error: personError } = await supabase
        .from('people')
        .update({
          name,
          current_savings: currentSavings,
          fixed_monthly_contribution: fixedMonthlyContribution,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tracker_id', trackerId)
        .select()
        .single();

      if (personError) {
        console.error('Error updating person:', personError);
        throw personError;
      }

      if (!updatedPerson) {
        return res.status(404).json({ 
          error: 'Person not found', 
          details: 'Person update returned no rows' 
        });
      }

      // Use service role client to bypass RLS since we've already verified access via tracker_id
      const { createClient } = await import('@supabase/supabase-js');
      const serviceRoleClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Delete existing incomes and insert new ones
      const { error: deleteError } = await serviceRoleClient
        .from('incomes')
        .delete()
        .eq('person_id', id);

      if (deleteError) {
        console.error('Error deleting incomes:', deleteError);
        throw deleteError;
      }

      if (incomes && Array.isArray(incomes) && incomes.length > 0) {
        const incomesData = incomes.map(income => ({
          id: income.id,
          person_id: id,
          label: income.label,
          amount: income.amount,
          frequency: income.frequency || 'monthly'
        }));

        // Use service role client to bypass RLS since we've already verified access via tracker_id
        const { createClient } = await import('@supabase/supabase-js');
        const serviceRoleClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error: incomesError } = await serviceRoleClient
          .from('incomes')
          .insert(incomesData);

        if (incomesError) {
          console.error('Error inserting incomes:', incomesError);
          console.error('Incomes data:', incomesData);
          throw incomesError;
        }
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
