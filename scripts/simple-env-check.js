#!/usr/bin/env node

/**
 * Simple Environment Variables Checker
 * 
 * Quick check of required environment variables (works in any environment)
 * Usage: node scripts/simple-env-check.js
 */

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

console.log('🔍 Environment Variables Check\n');
console.log('='.repeat(60));

let missingRequired = 0;
let setOptional = 0;

console.log('\n🔴 REQUIRED VARIABLES:\n');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
    console.log(`     Value: ${value.substring(0, 30)}...`);
  } else {
    console.log(`  ❌ ${varName} - MISSING`);
    missingRequired++;
  }
  console.log();
});

console.log('\n🟡 OPTIONAL VARIABLES:\n');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}`);
    console.log(`     Value: ${value.substring(0, 30)}...`);
    setOptional++;
  } else {
    console.log(`  ⚠️  ${varName} - Not set (optional)`);
  }
  console.log();
});

console.log('='.repeat(60));
console.log('\n📊 Summary:\n');
console.log(`  ✅ Required: ${requiredVars.length - missingRequired}/${requiredVars.length}`);
console.log(`  ✅ Optional: ${setOptional}/${optionalVars.length}`);

if (missingRequired > 0) {
  console.log('\n❌ MISSING REQUIRED VARIABLES:');
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`   - ${varName}`);
    }
  });
  console.log('\n💡 Set these in your .env.local file or Vercel environment variables');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
}

