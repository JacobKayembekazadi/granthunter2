# Vercel Deployment Guide

## Quick Deploy

### Option 1: Using Vercel CLI (Recommended)

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `JacobKayembekazadi/granthunter2`
4. Vercel will auto-detect Next.js and configure it

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key

### Optional (for full functionality)
- `ANTHROPIC_API_KEY` - For Claude/Editor agent
- `DEEPSEEK_API_KEY` - For Scout agent (cost-efficient alternative)
- `SAM_GOV_API_KEY` - For SAM.gov integration
- `INNGEST_EVENT_KEY` - For background jobs
- `INNGEST_SIGNING_KEY` - For Inngest webhooks
- `UPSTASH_REDIS_REST_URL` - For rate limiting/caching
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

## Edge Functions vs Serverless Functions

### Current Configuration: Serverless Functions (Node.js Runtime)

**Why Serverless Functions?**
- ✅ Database connections (Drizzle ORM + Postgres) need connection pooling
- ✅ Document generation (docx/pdf-lib) requires Node.js APIs
- ✅ AI SDKs (Gemini, Claude) may not be Edge-compatible
- ✅ Inngest webhooks require Node.js runtime
- ✅ File system operations for document generation

**Function Timeouts:**
- Standard routes: 60 seconds
- Document generation: 300 seconds (5 minutes)
- AI insights: 120 seconds (2 minutes)

### When to Use Edge Functions

Edge Functions are good for:
- Simple authentication checks
- Lightweight data transformations
- Fast responses without heavy processing
- Routes that don't need Node.js APIs

**Example Edge Function Route:**
```typescript
// app/api/health/route.ts
export const runtime = 'edge';

export async function GET() {
  return Response.json({ status: 'ok' });
}
```

### Routes That MUST Stay Serverless

- `/api/proposals/**/generate-document` - Document generation
- `/api/agents/**/insights` - AI processing
- `/api/knowledge-base` - Database + embeddings
- `/api/inngest` - Inngest webhook
- All routes using `db` (Drizzle ORM)

## Post-Deployment Checklist

1. ✅ Set all environment variables in Vercel dashboard
2. ✅ Verify database connection works
3. ✅ Test authentication (signup/login)
4. ✅ Test API routes
5. ✅ Configure Inngest webhook URL (if using Inngest)
6. ✅ Set up custom domain (optional)

## Inngest Webhook Setup

If using Inngest for background jobs:

1. Get your Vercel deployment URL: `https://your-app.vercel.app`
2. In Inngest dashboard, set webhook URL to: `https://your-app.vercel.app/api/inngest`
3. Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` to Vercel env vars

## Troubleshooting

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build`

### Runtime Errors
- Check environment variables are set correctly
- Verify database connection string is correct
- Check function logs in Vercel dashboard

### Database Connection Issues
- Ensure `DATABASE_URL` includes proper encoding
- Check Supabase connection pooling settings
- Verify network access from Vercel IPs

## Performance Optimization

1. **Database Connection Pooling**: Already configured in `db/index.ts`
2. **Function Timeouts**: Configured in `vercel.json`
3. **Caching**: Consider adding Redis caching for frequently accessed data
4. **CDN**: Vercel automatically handles static assets

## Cost Considerations

- **Serverless Functions**: Pay per invocation + execution time
- **Edge Functions**: Lower cost, faster cold starts, but limited capabilities
- **Database**: Supabase free tier includes connection pooling
- **Storage**: Supabase Storage for proposal documents


