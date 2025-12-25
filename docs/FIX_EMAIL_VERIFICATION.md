# Fix Email Verification Redirect URLs

## Problem
Email verification links are pointing to `localhost` instead of your production Vercel URL, causing `ERR_CONNECTION_REFUSED` errors.

## Solution

You need to update Supabase Authentication settings to include your production URL.

### Step 1: Update Supabase Dashboard Settings

1. Go to your Supabase Dashboard:
   - https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu/settings/auth

2. Scroll down to **"Site URL"** section

3. Update the **Site URL** to your production Vercel URL:
   ```
   https://granthunter-jacobkayembekazadi-gmailcoms-projects.vercel.app
   ```

4. Scroll down to **"Redirect URLs"** section

5. Click **"Add URL"** and add these URLs (one at a time):

   **For Production:**
   ```
   https://granthunter-jacobkayembekazadi-gmailcoms-projects.vercel.app/auth/callback
   ```

   **For Local Development (optional but recommended):**
   ```
   http://localhost:3000/auth/callback
   ```

   **Wildcard pattern (if you have multiple deployments):**
   ```
   https://*.vercel.app/auth/callback
   ```

6. Click **"Save"** at the bottom of the page

### Step 2: What Changed in the Code

✅ **Updated `app/(auth)/signup/page.tsx`**:
   - Added `emailRedirectTo` option to the signup call
   - Dynamically uses the current origin (works for both localhost and production)

✅ **Created `app/auth/callback/route.ts`**:
   - Handles the email verification callback from Supabase
   - Exchanges the verification code for a session
   - Redirects to login page after successful verification (user will be automatically logged in via session cookie)

### Step 3: Test the Fix

1. **Redeploy to Vercel** (if you haven't already):
   ```bash
   vercel --prod
   ```

2. **Test email verification**:
   - Go to your production signup page
   - Sign up with a new email
   - Check your email for the verification link
   - Click the link - it should now redirect to your production URL and then to the login page
   - The user will be automatically logged in via the session cookie set by Supabase

### Important Notes

- ⚠️ **After updating Supabase settings, existing email verification links will still point to localhost** - users will need to request a new verification email
- ✅ **New signups will work correctly** with the production URL
- 🔒 The callback route is already excluded from middleware authentication (it's under `/auth`)

### Production URLs

- **Main Production URL**: https://granthunter-jacobkayembekazadi-gmailcoms-projects.vercel.app
- **Vercel Custom Domain**: https://granthunter.vercel.app (if configured)

Both should be added to Supabase redirect URLs if you're using both.

