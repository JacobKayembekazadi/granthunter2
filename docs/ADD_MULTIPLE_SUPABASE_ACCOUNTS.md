# Adding Multiple Supabase Accounts to MCP

You want to keep your current Supabase account AND add your other account (with project `xvrqtrkrqrcgypghjlvu`) to the MCP configuration.

## What I Need From You

To add your second account, I need one of these:

### Option 1: Supabase Access Token (Recommended)
1. Go to https://supabase.com/dashboard/account/tokens
2. Make sure you're logged into the account that has project `xvrqtrkrqrcgypghjlvu`
3. Click **"Generate new token"**
4. Name it: `Cursor MCP - GrantHunter`
5. Copy the token
6. **Give me the token** and I can help configure it

### Option 2: Project-Specific Access Token
If available, get a project-specific access token:
1. Go to your project: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu
2. Settings → API → Look for "Access Token" or "Service Token"
3. Copy it and share with me

### Option 3: Service Role Key (Less Secure)
You already have this in `.env.local`:
- `SUPABASE_SERVICE_ROLE_KEY`

But this is less ideal for MCP as it has full admin access.

## How MCP Multi-Account Works

The Supabase MCP can be configured with multiple accounts in a few ways:

### Method A: Multiple MCP Server Instances
- Each Supabase account gets its own MCP server instance
- Cursor can have multiple MCP servers configured
- Each has a different name/identifier

### Method B: Account Switching
- Single MCP server with multiple authenticated accounts
- Switch between accounts when making requests
- Requires the MCP to support this (depends on implementation)

## What I Can Do With the Token

Once you give me the access token, I can:

1. **Check MCP Configuration Format**
   - Look at how Cursor stores MCP config
   - Determine if we can add a second server instance
   - Or if we need to modify the existing one

2. **Create Configuration**
   - Add your second account as a separate MCP server
   - Name it something like "Supabase-GrantHunter"
   - Keep the original as "Supabase" or "Supabase-Primary"

3. **Test Connection**
   - Verify I can access both accounts
   - List projects from both
   - Confirm I can see `xvrqtrkrqrcgypghjlvu`

## Steps to Get Your Token

### Step 1: Log into Correct Account
1. Go to https://supabase.com
2. Make sure you're logged into the account that has project `xvrqtrkrqrcgypghjlvu`
3. Verify by checking: https://supabase.com/dashboard/project/xvrqtrkrqrcgypghjlvu

### Step 2: Generate Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name: `Cursor MCP - GrantHunter Project`
4. Description (optional): `For Cursor MCP access to GrantHunter project`
5. Click **"Generate token"**
6. **IMPORTANT:** Copy the token immediately - you won't see it again!
7. Store it securely

### Step 3: Share Token
- Paste the token here in chat
- Or if you prefer, I can guide you through adding it manually

## Security Notes

⚠️ **Important Security Considerations:**

1. **Access Token Scope:**
   - The token will have access to all projects in that account
   - Make sure you're comfortable with this level of access
   - You can revoke it anytime from the tokens page

2. **Token Storage:**
   - Cursor stores MCP config locally
   - Tokens are encrypted in Cursor's storage
   - Don't commit tokens to git

3. **Best Practice:**
   - Use project-specific tokens if available
   - Rotate tokens periodically
   - Revoke unused tokens

## Alternative: Manual Configuration

If you prefer to configure it manually:

1. **Find MCP Config Location:**
   - Windows: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\`
   - Or check Cursor Settings → MCP

2. **Add Second Server:**
   ```json
   {
     "mcpServers": {
       "supabase-primary": {
         // existing config
       },
       "supabase-granthunter": {
         "command": "...",
         "args": ["--token", "YOUR_TOKEN_HERE"]
       }
     }
   }
   ```

3. **Restart Cursor**

## What Happens After

Once configured, I'll be able to:
- ✅ Access both Supabase accounts
- ✅ List projects from both
- ✅ Work with your GrantHunter project (`xvrqtrkrqrcgypghjlvu`)
- ✅ Keep access to your current account
- ✅ Switch between accounts as needed

## Ready to Proceed?

**Just share your Supabase access token** (from the account with `xvrqtrkrqrcgypghjlvu`), and I'll:
1. Help configure it in Cursor's MCP settings
2. Test the connection
3. Start setting up your database automatically!

---

**Quick Link to Get Token:**
https://supabase.com/dashboard/account/tokens




