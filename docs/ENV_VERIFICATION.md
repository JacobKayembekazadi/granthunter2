# Environment Variables Verification Guide

## Quick Status ✅

Based on Vercel CLI check, all required environment variables are currently set:

✅ **Required Variables (All Set):**
- `DATABASE_URL` - Production, Preview, Development
- `NEXT_PUBLIC_SUPABASE_URL` - Production, Preview, Development
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production, Preview, Development
- `SUPABASE_SERVICE_ROLE_KEY` - Production, Preview, Development

✅ **Optional Variables (Set):**
- `GEMINI_API_KEY` - Production, Preview, Development
- `SAM_GOV_API_KEY` - Production, Preview, Development

## Verification Scripts

### 1. Simple Local Check (Fastest)
```bash
node scripts/simple-env-check.js
```
Checks if environment variables are set in your current environment (`.env.local` or system env).

### 2. Check Vercel Environment Variables
```bash
npm run verify:env
# or
npx tsx scripts/check-vercel-env.ts
```
Lists all environment variables set in Vercel and compares with required variables.

### 3. Full Setup Verification
```bash
npm run verify:setup
# or
npx tsx scripts/verify-setup.ts
```
Comprehensive check including:
- Environment variables
- Database connection
- Supabase connection
- Redis connection
- SAM.gov API connectivity
- API routes structure

## Manual Vercel Check

You can also check Vercel environment variables via CLI:
```bash
vercel env ls
```

Or via the dashboard:
1. Go to: https://vercel.com/jacobkayembekazadi-gmailcoms-projects/granthunter/settings/environment-variables
2. View all variables and their environments

## Adding Missing Variables

If you need to add a variable to Vercel:

### Via CLI:
```bash
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME development
```

### Via Dashboard:
1. Go to project settings → Environment Variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments (Production, Preview, Development)
5. Click "Save"

## Current Status Summary

| Variable | Status | Environments |
|----------|--------|--------------|
| DATABASE_URL | ✅ Set | All |
| NEXT_PUBLIC_SUPABASE_URL | ✅ Set | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Set | All |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Set | All |
| GEMINI_API_KEY | ✅ Set | All |
| SAM_GOV_API_KEY | ✅ Set | All |
| UPSTASH_REDIS_REST_URL | ⚠️ Optional | - |
| UPSTASH_REDIS_REST_TOKEN | ⚠️ Optional | - |
| ANTHROPIC_API_KEY | ⚠️ Optional | - |
| DEEPSEEK_API_KEY | ⚠️ Optional | - |

## Next Steps

Since all required variables are set, the 500 errors are likely due to:
1. **Database connection issues** - Check if database is accessible from Vercel
2. **Runtime errors** - Check Vercel function logs for specific error messages
3. **API endpoint issues** - Verify the actual error in logs

To debug:
1. Check Vercel function logs: `vercel logs <deployment-url>`
2. Test endpoints individually: `/api/test/sam-gov`, `/api/dashboard/stats`
3. Check browser console for specific error messages

