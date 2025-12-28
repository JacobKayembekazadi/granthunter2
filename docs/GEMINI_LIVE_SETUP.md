# Gemini Live API Setup

## Current Issue

The `useGeminiLive` hook requires a Gemini API key to function. Currently, it's looking for `NEXT_PUBLIC_GEMINI_API_KEY` on the client side.

## Options

### Option 1: Add NEXT_PUBLIC_GEMINI_API_KEY (Quick Fix)

**Note:** This exposes your API key to the client-side, which is less secure but required for Gemini Live API which runs in the browser.

1. Go to Vercel Dashboard → Environment Variables
2. Add: `NEXT_PUBLIC_GEMINI_API_KEY` with the same value as `GEMINI_API_KEY`
3. Redeploy

**Pros:**
- Quick to set up
- Works immediately

**Cons:**
- API key is exposed in client-side code
- Anyone can view the API key in browser dev tools

### Option 2: Server-Side Proxy (Recommended for Production)

Create a server-side API route that proxies the Gemini Live connection:

1. Create `/api/gemini-live/connect` endpoint
2. Handle authentication server-side
3. Use WebSocket or Server-Sent Events to proxy audio stream
4. Client connects to your API, not directly to Gemini

**Pros:**
- API key stays on server
- More secure

**Cons:**
- More complex implementation
- Requires additional infrastructure

## Current Status

The hook now handles missing API key gracefully - it won't crash the app, but Gemini Live functionality will be disabled until the key is configured.

## React Hydration Error #418

This error indicates server/client render mismatch. Common causes:
- Using `Date.now()` or `Math.random()` in render
- Browser-only APIs during SSR
- Text content differences

The error is likely from dynamic content. Ensure all dynamic values are:
1. Generated in `useEffect` (client-side only)
2. Or matched exactly between server and client renders



