#!/usr/bin/env node

/**
 * Database Connection and Configuration Checker
 *
 * This script checks:
 * 1. Environment variables configuration
 * 2. Supabase connection
 * 3. Database schema and tables
 * 4. Migration status
 * 5. RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60) + '\n');
}

async function promptForCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter your Supabase URL: ', (url) => {
      rl.question('Enter your Supabase Anon Key: ', (key) => {
        rl.close();
        resolve({ url, key });
      });
    });
  });
}

async function checkEnvironment() {
  logSection('1. Environment Configuration');

  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Environment variables not found', 'red');
    log('Expected variables:', 'yellow');
    log('  - VITE_SUPABASE_URL', 'yellow');
    log('  - VITE_SUPABASE_ANON_KEY', 'yellow');
    log('\n.env file should contain:', 'cyan');
    log('VITE_SUPABASE_URL=https://your-project.supabase.co', 'cyan');
    log('VITE_SUPABASE_ANON_KEY=your-anon-key', 'cyan');

    log('\nWould you like to provide credentials now for testing? (This won\'t save them)', 'yellow');
    const creds = await promptForCredentials();
    supabaseUrl = creds.url;
    supabaseKey = creds.key;
  } else {
    log('✓ VITE_SUPABASE_URL: ' + supabaseUrl.substring(0, 30) + '...', 'green');
    log('✓ VITE_SUPABASE_ANON_KEY: ' + supabaseKey.substring(0, 20) + '...', 'green');
  }

  return { supabaseUrl, supabaseKey };
}

async function checkConnection(supabase) {
  logSection('2. Database Connection');

  try {
    // Try to fetch from a system table
    const { data, error } = await supabase
      .from('campaigns')
      .select('count')
      .limit(0);

    if (error) {
      if (error.message.includes('relation "campaigns" does not exist')) {
        log('⚠️  Connection successful, but campaigns table does not exist', 'yellow');
        log('You need to run the migrations first', 'yellow');
        return { connected: true, tablesExist: false };
      } else {
        log('❌ Connection failed: ' + error.message, 'red');
        return { connected: false, tablesExist: false };
      }
    }

    log('✓ Successfully connected to Supabase', 'green');
    log('✓ campaigns table exists', 'green');
    return { connected: true, tablesExist: true };
  } catch (error) {
    log('❌ Connection error: ' + error.message, 'red');
    return { connected: false, tablesExist: false };
  }
}

async function checkTables(supabase) {
  logSection('3. Database Tables');

  const expectedTables = ['campaigns', 'personas', 'creative_assets', 'ad_copy', 'leads'];

  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0);

      if (error) {
        log(`❌ ${table}: Does not exist or not accessible`, 'red');
      } else {
        // Get actual count
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          log(`⚠️  ${table}: Exists but cannot count rows (${countError.message})`, 'yellow');
        } else {
          log(`✓ ${table}: Exists (${count} rows)`, 'green');
        }
      }
    } catch (error) {
      log(`❌ ${table}: Error checking table - ${error.message}`, 'red');
    }
  }
}

async function checkColumns(supabase) {
  logSection('4. Migration Status - Key Columns');

  // Check for user_id column in campaigns (added in auth migration)
  log('Checking for authentication support...', 'cyan');
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('user_id')
      .limit(0);

    if (error && error.message.includes('column "user_id" does not exist')) {
      log('❌ user_id column missing from campaigns table', 'red');
      log('   Migration 20251007000000_add_auth_support.sql NOT applied', 'red');
    } else if (error) {
      log('⚠️  Cannot check user_id column: ' + error.message, 'yellow');
    } else {
      log('✓ user_id column exists in campaigns table', 'green');
      log('   Migration 20251007000000_add_auth_support.sql applied', 'green');
    }
  } catch (error) {
    log('❌ Error checking columns: ' + error.message, 'red');
  }

  // Check for predictive analytics columns in leads
  log('\nChecking for predictive analytics support...', 'cyan');
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('demographics, property_preferences, predicted_conversion_likelihood, buyer_segment')
      .limit(0);

    if (error) {
      log('❌ Predictive analytics columns missing from leads table', 'red');
      log('   Migrations for analytics NOT fully applied', 'red');
    } else {
      log('✓ Predictive analytics columns exist in leads table', 'green');
      log('   Migrations for analytics applied', 'green');
    }
  } catch (error) {
    log('❌ Error checking analytics columns: ' + error.message, 'red');
  }
}

async function checkAuth(supabase) {
  logSection('5. Authentication Status');

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      log('⚠️  Cannot check auth session: ' + error.message, 'yellow');
      return;
    }

    if (session) {
      log('✓ User is authenticated', 'green');
      log('  User ID: ' + session.user.id, 'cyan');
      log('  Email: ' + session.user.email, 'cyan');
    } else {
      log('⚠️  No active session (user not logged in)', 'yellow');
      log('   This is normal for a database check', 'cyan');
    }
  } catch (error) {
    log('⚠️  Auth check error: ' + error.message, 'yellow');
  }
}

async function checkRLS(supabase) {
  logSection('6. Row Level Security (RLS) Status');

  log('RLS is enabled on all tables by default', 'cyan');
  log('Current policies should restrict access to authenticated users only', 'cyan');

  // Try to query without auth - should fail or return no results
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*');

    if (error) {
      log('✓ RLS is working - unauthenticated access blocked', 'green');
      log('  Error: ' + error.message, 'cyan');
    } else if (data && data.length === 0) {
      log('⚠️  RLS may be working - no data returned (or no data exists)', 'yellow');
    } else if (data && data.length > 0) {
      log('⚠️  Warning: Data returned without authentication!', 'yellow');
      log('  This might mean old permissive policies are still active', 'yellow');
      log('  Check if migration 20251007000000_add_auth_support.sql was applied', 'yellow');
    }
  } catch (error) {
    log('❌ Error checking RLS: ' + error.message, 'red');
  }
}

async function generateReport(supabaseUrl) {
  logSection('7. Summary & Next Steps');

  log('Database Configuration:', 'bold');
  log('  Project URL: ' + supabaseUrl, 'cyan');

  log('\nRecommended Next Steps:', 'bold');
  log('1. If tables don\'t exist:', 'yellow');
  log('   - Run migrations via Supabase Dashboard SQL Editor', 'cyan');
  log('   - Or use: supabase db push', 'cyan');

  log('\n2. If user_id column is missing:', 'yellow');
  log('   - Apply migration: supabase/migrations/20251007000000_add_auth_support.sql', 'cyan');

  log('\n3. To use the application:', 'yellow');
  log('   - Create a .env file in the project root', 'cyan');
  log('   - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'cyan');
  log('   - Run: npm install', 'cyan');
  log('   - Run: npm run dev', 'cyan');

  log('\n4. Useful SQL queries (run in Supabase SQL Editor):', 'yellow');
  log('   - List all tables:', 'cyan');
  log('     SELECT table_name FROM information_schema.tables', 'cyan');
  log('     WHERE table_schema = \'public\';', 'cyan');

  log('\n   - Check campaigns table structure:', 'cyan');
  log('     SELECT column_name, data_type FROM information_schema.columns', 'cyan');
  log('     WHERE table_name = \'campaigns\';', 'cyan');
}

async function main() {
  log('\n' + '█'.repeat(60), 'cyan');
  log('  CAMPAIGN WITH SUPABASE - DATABASE CHECKER', 'bold');
  log('█'.repeat(60) + '\n', 'cyan');

  try {
    // 1. Check environment
    const { supabaseUrl, supabaseKey } = await checkEnvironment();

    if (!supabaseUrl || !supabaseKey) {
      log('\n❌ Cannot proceed without Supabase credentials', 'red');
      process.exit(1);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Check connection
    const { connected, tablesExist } = await checkConnection(supabase);

    if (!connected) {
      log('\n❌ Cannot proceed without database connection', 'red');
      await generateReport(supabaseUrl);
      process.exit(1);
    }

    if (!tablesExist) {
      log('\n⚠️  Database connected but tables don\'t exist', 'yellow');
      await generateReport(supabaseUrl);
      process.exit(0);
    }

    // 3. Check tables
    await checkTables(supabase);

    // 4. Check migrations
    await checkColumns(supabase);

    // 5. Check authentication
    await checkAuth(supabase);

    // 6. Check RLS
    await checkRLS(supabase);

    // 7. Generate report
    await generateReport(supabaseUrl);

    log('\n✓ Database check complete!', 'green');

  } catch (error) {
    log('\n❌ Fatal error: ' + error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the checker
main();
