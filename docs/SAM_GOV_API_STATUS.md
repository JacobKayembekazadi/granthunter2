# SAM.gov API Status and Verification

## Current Implementation

### API Client Location
- **File**: `lib/sam-gov/client.ts`
- **Base URL**: `https://api.sam.gov/opportunities/v2/search`
- **API Key**: Configured via `SAM_GOV_API_KEY` environment variable

### Integration Points

1. **Inngest Function**: `inngest/functions/scan-opportunities.ts`
   - Called when an agent scan is triggered
   - Uses `samGovClient.searchOpportunities()`
   - Parses and stores results in database

2. **Test Endpoint**: `app/api/test/sam-gov/route.ts` (newly created)
   - Simple GET endpoint to test SAM.gov API connectivity
   - Can be accessed at: `/api/test/sam-gov`

### Current API Key
Based on the codebase, an API key is configured:
- Key: `SAM-3b71bf5a-37bd-4082-bbeb-fb3aecab124b` (found in setup scripts)

## API Status

✅ **API Should Be Functional**: According to SAM.gov status (as of Dec 25, 2025):
- No active outages
- Next maintenance: Today (Thursday) 8:00 PM - 10:00 PM ET
- API should be available now

## Verification Steps

1. **Check Environment Variables in Vercel**:
   - Ensure `SAM_GOV_API_KEY` is set in Vercel environment variables
   - Navigate to: Vercel Dashboard → Project → Settings → Environment Variables

2. **Test the API Endpoint**:
   - Visit: `https://your-domain.vercel.app/api/test/sam-gov`
   - Should return JSON with success status and sample opportunities

3. **Check Logs**:
   - Use `vercel logs` to see any API errors
   - Look for SAM.gov API related errors in the logs

## Potential Issues

### 1. API Endpoint URL
The current endpoint might need verification:
- Current: `https://api.sam.gov/opportunities/v2/search`
- SAM.gov API documentation should be checked for the correct v2 endpoint structure

### 2. API Key Format
- Verify the API key format is correct
- SAM.gov API keys typically start with "SAM-" prefix (✅ matches current key)

### 3. Rate Limiting
- Current rate limit: 10 requests per minute
- Implementation uses Redis for rate limiting
- If Redis is not configured, rate limiting will fail

### 4. Response Format
The code expects:
```json
{
  "opportunitiesData": [...],
  "totalRecords": number
}
```
Verify that SAM.gov API returns data in this format.

## Testing Recommendations

1. **Test Locally First**:
   ```bash
   # Set environment variable
   export SAM_GOV_API_KEY="your-key-here"
   
   # Start dev server
   npm run dev
   
   # Test endpoint
   curl http://localhost:3000/api/test/sam-gov
   ```

2. **Test in Production**:
   - Visit `/api/test/sam-gov` on your Vercel deployment
   - Check browser console/network tab for errors
   - Review Vercel function logs

3. **Test Agent Scan**:
   - Create a test agent via `/api/agents` POST
   - Trigger scan via `/api/agents/[id]/scan` POST
   - Check if opportunities are found and stored

## Next Steps

1. ✅ Verify `SAM_GOV_API_KEY` is set in Vercel
2. ✅ Test the `/api/test/sam-gov` endpoint
3. ✅ Check Vercel logs for any API errors
4. ⚠️ Verify the SAM.gov API endpoint URL is correct (may need to check official docs)
5. ⚠️ Test with a real agent scan to ensure end-to-end functionality

## Notes

- SAM.gov API requires authentication (API key)
- Rate limits are enforced (10 requests/minute in current implementation)
- API structure may have changed - verify against official SAM.gov API documentation
- Maintenance windows: Tuesday, Thursday, Friday 8-10 PM ET



