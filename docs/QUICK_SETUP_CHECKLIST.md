# 🚀 Quick Setup Checklist

Follow this checklist in order. Check off each item as you complete it.

## Phase 1: Essential Services (Start Here)

### ☐ Supabase Setup
- [ ] Go to https://supabase.com and sign up
- [ ] Create new project (save database password!)
- [ ] Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Copy database connection string → `DATABASE_URL` (replace password)
- [ ] Enable pgvector: SQL Editor → Run `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Create storage bucket named `proposals` (private)
- [ ] Add storage policy for authenticated users

**Where to find:** Settings → API (for keys), Settings → Database (for connection string)

### ☐ Google Gemini API
- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Sign in with Google
- [ ] Click "Create API Key"
- [ ] Copy key → `GEMINI_API_KEY`

**Where to find:** https://aistudio.google.com/app/apikey

### ☐ Create .env.local File
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in Supabase values
- [ ] Fill in Gemini API key
- [ ] Save file

**File location:** Root of project (same folder as package.json)

---

## Phase 2: Core Functionality

### ☐ Inngest Setup
- [ ] Go to https://inngest.com and sign up
- [ ] Create new app named `grant-hunter`
- [ ] Copy Event Key → `INNGEST_EVENT_KEY`
- [ ] Copy Signing Key → `INNGEST_SIGNING_KEY`
- [ ] Add to `.env.local`

**Where to find:** Dashboard → Your App → Settings

### ☐ Anthropic (Claude) API
- [ ] Go to https://console.anthropic.com/ and sign up
- [ ] Go to API Keys section
- [ ] Create new key
- [ ] Copy key → `ANTHROPIC_API_KEY`
- [ ] Add payment method (required for production)
- [ ] Add to `.env.local`

**Where to find:** https://console.anthropic.com/ → API Keys

---

## Phase 3: Performance & Caching

### ☐ Upstash Redis
- [ ] Go to https://upstash.com and sign up
- [ ] Create new Redis database
- [ ] Copy REST URL → `UPSTASH_REDIS_REST_URL`
- [ ] Copy REST Token → `UPSTASH_REDIS_REST_TOKEN`
- [ ] Add to `.env.local`

**Where to find:** Dashboard → Your Database → REST API section

---

## Phase 4: Optional Enhancements

### ☐ DeepSeek API (Recommended - Very Cheap)
- [ ] Go to https://platform.deepseek.com/ and sign up
- [ ] Go to API Keys section
- [ ] Create new key
- [ ] Copy key → `DEEPSEEK_API_KEY`
- [ ] Add to `.env.local`

**Where to find:** Dashboard → API Keys

### ☐ OpenAI API (For Embeddings)
- [ ] Go to https://platform.openai.com/ and sign up
- [ ] Verify email and phone
- [ ] Go to API Keys section
- [ ] Create new secret key
- [ ] Copy key → `OPENAI_API_KEY`
- [ ] Add to `.env.local`

**Alternative:** Skip this and use local embeddings or add later

**Where to find:** Profile → API keys

### ☐ SAM.gov API (Optional)
- [ ] Go to https://api.sam.gov/ and register
- [ ] Request API key (may take 1-2 days)
- [ ] Copy key → `SAM_GOV_API_KEY`
- [ ] Add to `.env.local`

**Alternative:** Skip this and add opportunities manually

---

## Phase 5: Database Setup

### ☐ Run Database Migrations
- [ ] Open terminal in project folder
- [ ] Run: `npm install`
- [ ] Run: `npm run db:generate`
- [ ] Run: `npm run db:migrate`

**Or manually:** Copy schema SQL to Supabase SQL Editor and run

---

## Phase 6: Test Everything

### ☐ Start Development Server
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Should see login page

### ☐ Test Authentication
- [ ] Click "Sign up"
- [ ] Create account
- [ ] Should redirect to dashboard

### ☐ Test Basic Features
- [ ] Dashboard loads
- [ ] Can navigate between pages
- [ ] Navigator interface loads (needs Gemini key)

---

## Quick Reference: All URLs

| Service | Sign Up URL | Dashboard/Keys URL |
|---------|-------------|-------------------|
| Supabase | https://supabase.com | Dashboard → Settings → API |
| Inngest | https://inngest.com | Dashboard → Your App |
| Upstash | https://upstash.com | Dashboard → Your Database |
| Gemini | https://aistudio.google.com/app/apikey | Same page |
| Anthropic | https://console.anthropic.com/ | Dashboard → API Keys |
| DeepSeek | https://platform.deepseek.com/ | Dashboard → API Keys |
| OpenAI | https://platform.openai.com/ | Profile → API keys |
| SAM.gov | https://api.sam.gov/ | Entity Management → API Keys |

---

## Minimum to Get Started

If you want to test quickly, you only need:
1. ✅ Supabase (free)
2. ✅ Gemini API key (free)
3. ✅ Basic `.env.local` with these two

Then you can:
- Test UI
- Create accounts
- Navigate dashboard
- Test Navigator voice

Add other services as you need more features!

---

## Need Help?

- Full guide: See `SETUP_GUIDE.md`
- Environment template: See `.env.local.example`
- Issues? Check the troubleshooting section in `SETUP_GUIDE.md`




