# GrantHunter - Complete Setup Guide

## Step-by-Step Service Setup

### 1. Supabase Setup (Database, Auth, Storage)

#### Step 1.1: Create Account
1. Go to https://supabase.com
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

#### Step 1.2: Create New Project
1. Click "New Project" button
2. Fill in:
   - **Organization:** Select or create one
   - **Name:** `grant-hunter` (or any name)
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you (e.g., `US East`)
   - **Pricing Plan:** Free tier is fine to start
3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

#### Step 1.3: Get API Keys
1. In your project dashboard, click **Settings** (gear icon) in left sidebar
2. Click **API** in the settings menu
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

#### Step 1.4: Get Database Connection String
1. Still in Settings, click **Database**
2. Scroll to "Connection string"
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. This is your `DATABASE_URL`

#### Step 1.5: Enable pgvector Extension
1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click "New query"
3. Paste this SQL:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

#### Step 1.6: Create Storage Bucket
1. Click **Storage** in left sidebar
2. Click "Create bucket"
3. Fill in:
   - **Name:** `proposals`
   - **Public bucket:** Leave UNCHECKED (private)
4. Click "Create bucket"
5. Click on the `proposals` bucket
6. Go to **Policies** tab
7. Click "New Policy"
8. Select "For authenticated users" template
9. Policy name: `Allow authenticated uploads`
10. Policy definition:
    ```sql
    (bucket_id = 'proposals'::text) AND (auth.role() = 'authenticated'::text)
    ```
11. Click "Review" then "Save policy"

---

### 2. Inngest Setup (Workflow Orchestration)

#### Step 2.1: Create Account
1. Go to https://inngest.com
2. Click "Sign up" or "Get started"
3. Sign up with GitHub (recommended) or email
4. Verify email if required

#### Step 2.2: Create App
1. After login, you'll see "Create app" or similar
2. Click "Create app"
3. Fill in:
   - **App name:** `grant-hunter`
   - **Framework:** Next.js
4. Click "Create"

#### Step 2.3: Get API Keys
1. In your app dashboard, look for **Settings** or **API Keys**
2. You'll see:
   - **Event Key** → `INNGEST_EVENT_KEY`
   - **Signing Key** → `INNGEST_SIGNING_KEY`
3. Copy both keys

#### Step 2.4: Set Up Local Development (Optional)
1. Install Inngest CLI:
   ```bash
   npm install -g inngest-cli
   ```
2. For local dev, you can use:
   ```bash
   npx inngest-cli dev
   ```
   This runs a local Inngest server

#### Step 2.5: Configure Webhook (For Production)
1. In Inngest dashboard, go to **Apps** → Your app
2. Find **Sync URL** or **Webhook URL**
3. For production: `https://your-domain.com/api/inngest`
4. For local dev: Use Inngest Dev Server or `http://localhost:3000/api/inngest`

---

### 3. Upstash Redis Setup (Caching & Rate Limiting)

#### Step 3.1: Create Account
1. Go to https://upstash.com
2. Click "Sign up" or "Get started"
3. Sign up with GitHub (recommended) or email
4. Verify email if required

#### Step 3.2: Create Redis Database
1. After login, click "Create Database"
2. Fill in:
   - **Name:** `grant-hunter-cache`
   - **Type:** Regional (cheaper) or Global (faster)
   - **Region:** Choose closest to you
   - **Primary Region:** Same as above
   - **Plan:** Free tier is fine to start
3. Click "Create"

#### Step 3.3: Get Connection Details
1. Click on your database
2. You'll see **REST API** section
3. Copy:
   - **UPSTASH_REDIS_REST_URL** → The URL shown
   - **UPSTASH_REDIS_REST_TOKEN** → The token shown
4. These are your Redis credentials

---

### 4. Google Gemini API Key

#### Step 4.1: Get API Key
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the API key → `GEMINI_API_KEY`
6. **Note:** Free tier includes generous quotas

#### Step 4.2: Enable APIs (If Needed)
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search for "Generative Language API"
5. Click "Enable" if not already enabled

---

### 5. Anthropic Claude API Key

#### Step 5.1: Create Account
1. Go to https://console.anthropic.com/
2. Click "Sign up" or "Get started"
3. Sign up with email
4. Verify email

#### Step 5.2: Get API Key
1. After login, go to **API Keys** section
2. Click "Create Key"
3. Give it a name: `grant-hunter`
4. Copy the key → `ANTHROPIC_API_KEY`
5. **Note:** You get $5 free credit to start

#### Step 5.3: Add Payment (Required for Production)
1. Go to **Billing** section
2. Add payment method
3. Set usage limits if desired

---

### 6. DeepSeek API Key (Optional but Recommended)

#### Step 6.1: Create Account
1. Go to https://platform.deepseek.com/
2. Click "Sign up"
3. Sign up with email or GitHub
4. Verify email

#### Step 6.2: Get API Key
1. After login, go to **API Keys** section
2. Click "Create API Key"
3. Copy the key → `DEEPSEEK_API_KEY`
4. **Note:** Very affordable pricing, great for Scout role

---

### 7. OpenAI API Key (For Embeddings)

#### Step 7.1: Create Account
1. Go to https://platform.openai.com/
2. Click "Sign up"
3. Sign up with email or Google
4. Verify email and phone number

#### Step 7.2: Get API Key
1. After login, click your profile → **API keys**
2. Click "Create new secret key"
3. Give it a name: `grant-hunter-embeddings`
4. Copy the key → `OPENAI_API_KEY`
5. **Note:** You get $5 free credit

#### Alternative: Use Local Embeddings
If you want to skip OpenAI, you can use:
- Supabase's built-in embeddings (if available)
- Local model like `all-MiniLM-L6-v2` via Transformers.js
- Or skip RAG initially and add it later

---

### 8. SAM.gov API Key (Optional)

#### Step 8.1: Create Account
1. Go to https://api.sam.gov/
2. Click "Register" or "Get API Key"
3. You'll need a SAM.gov account (government contractors usually have this)
4. If you don't have one, you can:
   - Register at https://sam.gov/
   - Or skip this and add opportunities manually

#### Step 8.2: Get API Key
1. Log into SAM.gov
2. Go to **Entity Management** → **API Keys**
3. Request an API key
4. Copy the key → `SAM_GOV_API_KEY`
5. **Note:** Can take 1-2 business days for approval

---

## Complete .env.local Template

After getting all keys, create `.env.local` file in project root:

```env
# ============================================
# SUPABASE (Required)
# ============================================
# Get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get from: Supabase Dashboard → Settings → Database → Connection string (URI)
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# ============================================
# INNGEST (Required)
# ============================================
# Get from: Inngest Dashboard → Your App → Settings
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=signkey-prod-xxxxx

# ============================================
# UPSTASH REDIS (Required)
# ============================================
# Get from: Upstash Dashboard → Your Database → REST API
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxACQgYjY4YjMxYjEtYjY4Yi00YjMxYi0xYjY4Yi1iYjY4YjMxYjE=

# ============================================
# AI API KEYS (Required)
# ============================================
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Get from: https://console.anthropic.com/ → API Keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Get from: https://platform.deepseek.com/ → API Keys (Optional but recommended)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Get from: https://platform.openai.com/ → API Keys (For embeddings)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# ============================================
# SAM.GOV (Optional)
# ============================================
# Get from: https://api.sam.gov/ → API Keys
SAM_GOV_API_KEY=your_sam_gov_key_here

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

If you get errors, install missing packages manually:
```bash
npm install clsx tailwind-merge tailwindcss-animate class-variance-authority
npm install inngest
```

### Step 2: Set Up Database
```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations to Supabase
npm run db:migrate
```

Or manually in Supabase SQL Editor, run the schema SQL.

### Step 3: Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Priority Order (If You Want to Start Small)

### Minimum Viable Setup (Can test UI and basic features):
1. ✅ Supabase (free tier)
2. ✅ Gemini API key (free tier)
3. ✅ Basic .env.local with just these two

### Add Next (Core functionality):
4. ✅ Inngest (free tier)
5. ✅ Anthropic API key ($5 free credit)

### Add Next (Full features):
6. ✅ Upstash Redis (free tier)
7. ✅ DeepSeek API key (very cheap)
8. ✅ OpenAI API key (for embeddings)

### Optional:
9. SAM.gov API key (can add manually)

---

## Troubleshooting

### "Module not found" errors
- Run `npm install` again
- Check package.json has all dependencies

### Database connection errors
- Verify DATABASE_URL has correct password
- Check Supabase project is active
- Ensure pgvector extension is enabled

### Inngest not working
- Check webhook URL is correct
- For local: use `npx inngest-cli dev`
- Verify INNGEST_EVENT_KEY and SIGNING_KEY are correct

### AI API errors
- Verify API keys are correct
- Check API quotas/limits
- Ensure billing is set up (for Anthropic/OpenAI)

---

## Quick Test Checklist

After setup, test these:
- [ ] Can access http://localhost:3000
- [ ] Can sign up for account
- [ ] Can log in
- [ ] Dashboard loads
- [ ] Navigator voice connects (needs Gemini key)
- [ ] Can create search agent
- [ ] Can create proposal (will queue, needs Inngest)

---

## Need Help?

If you get stuck on any step, let me know which service and I can help troubleshoot!




