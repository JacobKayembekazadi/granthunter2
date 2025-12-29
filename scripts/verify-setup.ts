#!/usr/bin/env ts-node

/**
 * Setup Verification Script
 * 
 * This script verifies that all required environment variables and services are configured correctly.
 * Run with: npx tsx scripts/verify-setup.ts
 */

import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { samGovClient } from '@/lib/sam-gov/client';
import { redis } from '@/lib/redis';

interface VerificationResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function addResult(name: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
  results.push({ name, status, message, details });
  const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function verifyEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...\n');

  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const optionalVars = [
    'SAM_GOV_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY',
    'DEEPSEEK_API_KEY',
  ];

  let allRequiredPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      addResult(
        `Environment Variable: ${varName}`,
        'success',
        'Set',
        { length: value.length, preview: value.substring(0, 10) + '...' }
      );
    } else {
      addResult(
        `Environment Variable: ${varName}`,
        'error',
        'MISSING - Required for application to function'
      );
      allRequiredPresent = false;
    }
  }

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      addResult(
        `Environment Variable: ${varName}`,
        'success',
        'Set',
        { length: value.length, preview: value.substring(0, 10) + '...' }
      );
    } else {
      addResult(
        `Environment Variable: ${varName}`,
        'warning',
        'Not set (optional)'
      );
    }
  }

  return allRequiredPresent;
}

async function verifyDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...\n');

  try {
    // Try a simple query using Drizzle's sql template
    const { sql } = await import('drizzle-orm');
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    addResult(
      'Database Connection',
      'success',
      'Connected successfully',
      { result: testQuery }
    );
    return true;
  } catch (error: any) {
    addResult(
      'Database Connection',
      'error',
      'Failed to connect',
      { error: error.message }
    );
    return false;
  }
}

async function verifySupabaseConnection() {
  console.log('\n🔐 Testing Supabase Connection...\n');

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // This is expected if no user is logged in - it just means the connection works
      addResult(
        'Supabase Connection',
        'success',
        'Connection successful (no authenticated user)',
        { error: error.message }
      );
    } else {
      addResult(
        'Supabase Connection',
        'success',
        'Connected and authenticated',
        { userId: data.user?.id }
      );
    }
    return true;
  } catch (error: any) {
    addResult(
      'Supabase Connection',
      'error',
      'Failed to connect',
      { error: error.message }
    );
    return false;
  }
}

async function verifyRedisConnection() {
  console.log('\n💾 Testing Redis Connection...\n');

  try {
    // Test Redis connection with a simple ping
    await redis.set('test:connection', 'ok', { ex: 10 });
    const value = await redis.get('test:connection');

    if (value === 'ok') {
      addResult(
        'Redis Connection',
        'success',
        'Connected and operational',
        { testValue: value }
      );
      return true;
    } else {
      addResult(
        'Redis Connection',
        'warning',
        'Connected but test value mismatch',
        { expected: 'ok', got: value }
      );
      return false;
    }
  } catch (error: any) {
    addResult(
      'Redis Connection',
      'warning',
      'Not available (optional for caching)',
      { error: error.message }
    );
    return false;
  }
}

async function verifySamGovAPI() {
  console.log('\n🏛️  Testing SAM.gov API...\n');

  try {
    // Test with a simple search
    const results = await samGovClient.searchOpportunities({
      keywords: ['technology'],
      limit: 1,
    });

    addResult(
      'SAM.gov API',
      'success',
      'API is functional',
      {
        totalResults: results.total,
        opportunitiesReturned: results.opportunities.length,
        hasMore: results.hasMore,
      }
    );
    return true;
  } catch (error: any) {
    addResult(
      'SAM.gov API',
      'error',
      'API test failed',
      {
        error: error.message,
        hint: 'Check SAM_GOV_API_KEY environment variable and API endpoint URL',
      }
    );
    return false;
  }
}

async function verifyAPIRoutes() {
  console.log('\n🔌 Verifying API Routes Structure...\n');

  const requiredRoutes = [
    'app/api/dashboard/stats/route.ts',
    'app/api/dashboard/insights/route.ts',
    'app/api/users/me/route.ts',
    'app/api/opportunities/route.ts',
    'app/api/opportunities/[id]/route.ts',
    'app/api/opportunities/[id]/insights/route.ts',
    'app/api/agents/route.ts',
    'app/api/proposals/route.ts',
  ];

  const fs = require('fs');
  const path = require('path');

  let allRoutesExist = true;

  for (const route of requiredRoutes) {
    const routePath = path.join(process.cwd(), route);
    if (fs.existsSync(routePath)) {
      addResult(
        `API Route: ${route}`,
        'success',
        'File exists'
      );
    } else {
      addResult(
        `API Route: ${route}`,
        'error',
        'File missing'
      );
      allRoutesExist = false;
    }
  }

  return allRoutesExist;
}

async function generateSummary() {
  console.log('\n📊 Verification Summary\n');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log(`\n✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);

  if (errorCount > 0) {
    console.log('\n❌ ERRORS FOUND - Please fix these issues:\n');
    results
      .filter(r => r.status === 'error')
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
  }

  if (warningCount > 0) {
    console.log('\n⚠️  WARNINGS - These may affect functionality:\n');
    results
      .filter(r => r.status === 'warning')
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60));

  const allCriticalPassed = errorCount === 0;
  return allCriticalPassed;
}

async function main() {
  console.log('🚀 GrantHunter Setup Verification');
  console.log('='.repeat(60));

  await verifyEnvironmentVariables();
  await verifyAPIRoutes();

  // Only test connections if in Node.js environment
  if (typeof window === 'undefined') {
    await verifyDatabaseConnection();
    await verifySupabaseConnection();
    await verifyRedisConnection();
    await verifySamGovAPI();
  } else {
    console.log('\n⚠️  Running in browser - skipping connection tests');
  }

  const allPassed = await generateSummary();

  process.exit(allPassed ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });
}

export { verifyEnvironmentVariables, verifyDatabaseConnection, verifySupabaseConnection, verifyRedisConnection, verifySamGovAPI };



