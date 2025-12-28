#!/usr/bin/env ts-node

/**
 * Vercel Environment Variables Checker
 * 
 * This script checks which environment variables are set in Vercel
 * and compares them with required variables.
 * 
 * Usage: npx tsx scripts/check-vercel-env.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface EnvVar {
  name: string;
  value: string;
  environment: string[];
}

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
  'INNGEST_EVENT_KEY',
  'INNGEST_SIGNING_KEY',
];

async function getVercelEnvVars(): Promise<EnvVar[]> {
  try {
    const { stdout } = await execAsync('vercel env ls --json');
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error('Error fetching Vercel environment variables:', error.message);
    console.log('\n💡 Make sure you are logged in to Vercel CLI:');
    console.log('   vercel login');
    return [];
  }
}

function checkEnvVar(envVar: EnvVar, varName: string): { found: boolean; envs: string[] } {
  if (envVar.name === varName) {
    return { found: true, envs: envVar.environment };
  }
  return { found: false, envs: [] };
}

async function main() {
  console.log('🔍 Checking Vercel Environment Variables\n');
  console.log('='.repeat(60));

  const vercelEnvVars = await getVercelEnvVars();

  if (vercelEnvVars.length === 0) {
    console.log('⚠️  Could not fetch Vercel environment variables.');
    console.log('   Make sure you are logged in: vercel login');
    return;
  }

  console.log(`\n📋 Found ${vercelEnvVars.length} environment variable(s) in Vercel\n`);

  // Check required variables
  console.log('🔴 REQUIRED VARIABLES:\n');
  let missingRequired = 0;

  for (const varName of requiredVars) {
    const found = vercelEnvVars.find(v => v.name === varName);
    if (found) {
      const envs = found.environment.join(', ');
      console.log(`  ✅ ${varName}`);
      console.log(`     Environments: ${envs}`);
      console.log(`     Value: ${found.value.substring(0, 20)}... (hidden)`);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
      missingRequired++;
    }
    console.log();
  }

  // Check optional variables
  console.log('🟡 OPTIONAL VARIABLES:\n');
  let missingOptional = 0;

  for (const varName of optionalVars) {
    const found = vercelEnvVars.find(v => v.name === varName);
    if (found) {
      const envs = found.environment.join(', ');
      console.log(`  ✅ ${varName}`);
      console.log(`     Environments: ${envs}`);
    } else {
      console.log(`  ⚠️  ${varName} - Not set (optional)`);
      missingOptional++;
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`  ✅ Required variables set: ${requiredVars.length - missingRequired}/${requiredVars.length}`);
  console.log(`  ⚠️  Optional variables set: ${optionalVars.length - missingOptional}/${optionalVars.length}`);

  if (missingRequired > 0) {
    console.log('\n❌ ACTION REQUIRED:');
    console.log('   Please set the missing required environment variables in Vercel:');
    console.log('   1. Go to: https://vercel.com/your-project/settings/environment-variables');
    console.log('   2. Add the missing variables');
    console.log('   3. Redeploy your application');
    console.log('\n   Or use the Vercel CLI:');
    console.log('   vercel env add VARIABLE_NAME production');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});



