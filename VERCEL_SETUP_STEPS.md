# Vercel Setup Steps - Complete Guide

## Step 1: Connect GitHub Repository ✅ (Do This First)

### Why connect the repo?
- ✅ Automatic deployments on every push
- ✅ Preview deployments for pull requests
- ✅ Better integration with your workflow
- ✅ Easy rollbacks

### How to connect:
1. Go to: https://vercel.com/jacobkayembekazadi-gmailcoms-projects/granthunter/settings/git
2. Click "Connect Git Repository"
3. Select "GitHub"
4. Authorize Vercel to access your repositories
5. Select: `JacobKayembekazadi/granthunter2`
6. Click "Import"

**OR use CLI:**
```bash
# This will prompt you to connect
vercel git connect
```

## Step 2: Add Environment Variables ✅ (Do This Second)

### Why add env vars?
- Required for the app to function
- Database connections won't work without them
- API keys needed for AI features

### How to add:
1. Go to: https://vercel.com/jacobkayembekazadi-gmailcoms-projects/granthunter/settings/environment-variables
2. Click "Add New"
3. Add each variable below (select **Production**, **Preview**, and **Development** for each):

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://xvrqtrkrqrcgypghjlvu.supabase.co
Environments: Production, Preview, Development

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_FX14Enlcyz-ZXhEly9Ol9A_Yih-PTeE
Environments: Production, Preview, Development

SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cnF0cmtycXJjZ3lwZ2hqbHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NzgzMCwiZXhwIjoyMDgyMTczODMwfQ.xvjmsSUS_E-9-78akuohWx_Bdj1H8KXRDR81Eh3vp1U
Environments: Production, Preview, Development

DATABASE_URL
Value: postgresql://postgres:Am2j4L%269%23rD%2F4Wi@db.xvrqtrkrqrcgypghjlvu.supabase.co:5432/postgres
Environments: Production, Preview, Development

GEMINI_API_KEY
Value: AIzaSyCSLlthr_RcWJ2LouKz03PCtsX3uDQujO0
Environments: Production, Preview, Development

SAM_GOV_API_KEY
Value: SAM-3b71bf5a-37bd-4082-bbeb-fb3aecab124b
Environments: Production, Preview, Development
```

### Optional Variables (for full functionality):

```
ANTHROPIC_API_KEY
Value: your_anthropic_api_key_here
(Only if you want Claude/Editor agent)

DEEPSEEK_API_KEY
Value: your_deepseek_api_key_here
(Only if you want Scout agent alternative)

INNGEST_EVENT_KEY
Value: your_inngest_event_key
(Only if using Inngest for background jobs)

INNGEST_SIGNING_KEY
Value: your_inngest_signing_key
(Only if using Inngest)

UPSTASH_REDIS_REST_URL
Value: your_redis_url
(Only if using Redis for rate limiting)

UPSTASH_REDIS_REST_TOKEN
Value: your_redis_token
(Only if using Redis)
```

## Step 3: Trigger New Deployment ✅

### After adding env vars:
1. Go to: https://vercel.com/jacobkayembekazadi-gmailcoms-projects/granthunter/deployments
2. Click "Redeploy" on the latest deployment
3. OR push a new commit to trigger automatic deployment:
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push origin main
   ```

## Quick Checklist

- [ ] Connect GitHub repository
- [ ] Add all required environment variables
- [ ] Verify variables are set for Production, Preview, and Development
- [ ] Trigger new deployment (or push to GitHub)
- [ ] Check deployment status
- [ ] Test the deployed app

## Troubleshooting

### If build still fails after adding env vars:
1. Check build logs in Vercel dashboard
2. Verify all env vars are spelled correctly
3. Make sure DATABASE_URL is URL-encoded properly
4. Check for TypeScript errors: `npm run build` locally

### If deployment succeeds but app doesn't work:
1. Check runtime logs in Vercel dashboard
2. Verify database connection
3. Test API routes
4. Check browser console for errors

