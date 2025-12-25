/**
 * Direct Database Setup Script
 * Uses Supabase service role key to set up database
 * Run with: npx tsx scripts/setup-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvrqtrkrqrcgypghjlvu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cnF0cmtycXJjZ3lwZ2hqbHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NzgzMCwiZXhwIjoyMDgyMTczODMwfQ.xvjmsSUS_E-9-78akuohWx_Bdj1H8KXRDR81Eh3vp1U';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'db', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 001_initial_schema.sql');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Some errors are expected (like "already exists")
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('does not exist')) {
            console.error(`  ⚠️  Error: ${error.message.substring(0, 100)}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err: any) {
        // Try direct SQL execution via REST API
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (!response.ok) {
            const text = await response.text();
            if (!text.includes('already exists') && !text.includes('duplicate')) {
              console.error(`  ⚠️  SQL Error: ${text.substring(0, 100)}`);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            successCount++;
          }
        } catch (fetchErr) {
          // Skip - will need manual setup
          console.error(`  ⚠️  Could not execute: ${statement.substring(0, 50)}...`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Setup complete! ${successCount} statements executed, ${errorCount} errors`);
    console.log('\n📝 Note: Some statements may need to be run manually in Supabase SQL Editor');
    console.log('   Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/sql/new');
    console.log('   Copy and paste the contents of: db/migrations/001_initial_schema.sql\n');

  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📝 Please run the SQL migration manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/sql/new');
    console.log('   2. Open: db/migrations/001_initial_schema.sql');
    console.log('   3. Copy entire file and paste into SQL Editor');
    console.log('   4. Click Run\n');
    process.exit(1);
  }
}

setupDatabase();



