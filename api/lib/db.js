// Database connection utility
// Supports Neon (PostgreSQL), PlanetScale (MySQL), and Supabase (PostgreSQL)

import { sql } from '@vercel/postgres';

// For Neon/PostgreSQL (using Vercel Postgres)
// Vercel Postgres sql template tag works with template literals
// For parameterized queries, we can use sql.query() with template literals
export async function query(queryText, params = []) {
  try {
    if (Array.isArray(params) && params.length > 0) {
      // Replace $1, $2, etc. with actual values in a safe way
      // We'll build a template literal query
      let safeQuery = queryText;
      const values = [];
      
      // Extract parameters in order
      let paramIndex = 0;
      safeQuery = safeQuery.replace(/\$(\d+)/g, (match, num) => {
        const index = parseInt(num) - 1;
        if (params[index] !== undefined) {
          values.push(params[index]);
          return `$${values.length}`; // Re-number for sql template
        }
        return match;
      });
      
      // Use sql with template literal approach
      // Vercel Postgres supports parameterized queries differently
      // We'll use sql.unsafe() but with proper escaping
      const escapedParams = params.map(p => {
        if (typeof p === 'string') {
          return `'${p.replace(/'/g, "''")}'`;
        } else if (p === null) {
          return 'NULL';
        } else {
          return String(p);
        }
      });
      
      let finalQuery = queryText;
      escapedParams.forEach((escaped, index) => {
        finalQuery = finalQuery.replace(`$${index + 1}`, escaped);
      });
      
      const result = await sql.unsafe(finalQuery);
      return { rows: Array.isArray(result) ? result : (result.rows || []), rowCount: result.length || 0 };
    } else {
      const result = await sql.unsafe(queryText);
      return { rows: Array.isArray(result) ? result : (result.rows || []), rowCount: result.length || 0 };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Alternative implementations for other databases:

// For PlanetScale (MySQL) - uncomment if using PlanetScale
/*
import { connect } from '@planetscale/database';

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
};

const conn = connect(config);

export async function query(text, params) {
  try {
    // Convert PostgreSQL $1, $2 to MySQL ? placeholders
    let mysqlQuery = text;
    const mysqlParams = [];
    let paramIndex = 0;
    
    mysqlQuery = mysqlQuery.replace(/\$(\d+)/g, () => {
      mysqlParams.push(params[paramIndex++]);
      return '?';
    });
    
    const result = await conn.execute(mysqlQuery, mysqlParams);
    return { rows: result.rows || [], rowCount: result.rowsAffected || 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
*/

// For Supabase (PostgreSQL) - uncomment if using Supabase
/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function query(text, params) {
  // Supabase requires using their RPC or query builder
  // This is a simplified adapter - you'll need to adapt queries
  // For complex queries, consider using supabase.from().select() instead
  try {
    // Note: This is a placeholder - Supabase doesn't support raw SQL easily
    // You'll need to refactor queries to use Supabase's query builder
    // Or use their REST API directly
    const response = await supabase.rpc('execute_sql', { 
      query_text: text,
      params: params 
    });
    
    if (response.error) throw response.error;
    return { rows: response.data || [], rowCount: response.data?.length || 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
*/
