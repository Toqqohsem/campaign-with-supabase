import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjuroohluasvakqgnxpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdXJvb2hsdWFzdmFrcWdueHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODU0MTEsImV4cCI6MjA3Mzg2MTQxMX0.HHvLqBpigwZc6yEjCo2j10QRufyyLHSVdlqRkY7jpPE';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 30) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Try to query campaigns table
console.log('Test 1: Querying campaigns table...');
const { data: campaigns, error: campaignsError } = await supabase
  .from('campaigns')
  .select('*')
  .limit(1);

if (campaignsError) {
  console.log('❌ Campaigns query error:', campaignsError);
} else {
  console.log('✓ Campaigns query successful');
  console.log('  Data:', campaigns);
}

// Test 2: Check auth
console.log('\nTest 2: Checking auth session...');
const { data: { session }, error: authError } = await supabase.auth.getSession();

if (authError) {
  console.log('❌ Auth error:', authError);
} else {
  console.log('✓ Auth check successful');
  console.log('  Session:', session ? 'Active' : 'No session');
}

// Test 3: Try to list tables using service role (for diagnostics)
console.log('\nTest 3: Testing with service role key...');
const supabaseService = createClient(
  supabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdXJvb2hsdWFzdmFrcWdueHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI4NTQxMSwiZXhwIjoyMDczODYxNDExfQ.itfCGiBhmmLnv3AZiCSzT3zHXakN78kaGSCqL-waifo'
);

const { data: serviceCampaigns, error: serviceError } = await supabaseService
  .from('campaigns')
  .select('*')
  .limit(1);

if (serviceError) {
  console.log('❌ Service role query error:', serviceError);
} else {
  console.log('✓ Service role query successful');
  console.log('  Data:', serviceCampaigns);
}

console.log('\nConnection test complete.');
