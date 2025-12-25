# How to Switch Supabase MCP to Your Account

The Supabase MCP is currently connected to a different account. Here's how to switch it to your account that has the project `xvrqtrkrqrcgypghjlvu`.

## Method 1: Re-authenticate via Cursor Settings (Recommended)

### Step 1: Open Cursor Settings
1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Or go to **File** → **Preferences** → **Settings**

### Step 2: Find MCP Configuration
1. In the settings search bar, type: `mcp` or `model context protocol`
2. Look for **MCP Settings** or **Model Context Protocol**
3. Or navigate to: **Features** → **MCP** → **Supabase**

### Step 3: Re-authenticate
1. Find the Supabase MCP server configuration
2. Look for an **"Authenticate"** or **"Re-authenticate"** button
3. Click it - this will open a browser window
4. Sign in with the account that has your project (`xvrqtrkrqrcgypghjlvu`)
5. Authorize Cursor to access your Supabase account

### Step 4: Verify Connection
After re-authenticating, I should be able to see your project. You can test by asking me to list your projects again.

---

## Method 2: Manual Configuration (If Method 1 doesn't work)

### Step 1: Find MCP Config File
The MCP configuration is usually stored in:
- **Windows:** `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\` or similar
- **Mac:** `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/`
- **Linux:** `~/.config/Cursor/User/globalStorage/cursor.mcp/`

Or check Cursor's settings JSON:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Preferences: Open User Settings (JSON)`
3. Look for MCP-related configuration

### Step 2: Check for Supabase MCP Config
Look for a file or setting that contains:
- `supabase` in the name
- MCP server configuration
- Authentication tokens

### Step 3: Clear and Re-authenticate
1. If you find the config, you may need to:
   - Remove/clear the existing Supabase authentication
   - Restart Cursor
   - Re-authenticate when prompted

---

## Method 3: Use Supabase Access Token (Advanced)

If the above methods don't work, you can manually configure the MCP with an access token:

### Step 1: Get Supabase Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Give it a name: `Cursor MCP`
4. Copy the token (you won't see it again!)

### Step 2: Configure MCP with Token
The exact location depends on Cursor's MCP implementation, but you'll need to:
1. Find the Supabase MCP server configuration
2. Add or update the access token
3. Restart Cursor

---

## Quick Test After Switching

Once you've re-authenticated, I can test the connection by running:

```typescript
// I'll run this to verify
mcp_supabase_list_projects()
```

If I can see your project `xvrqtrkrqrcgypghjlvu`, then I can:
- ✅ Enable pgvector extension
- ✅ Run database migrations
- ✅ Create storage buckets
- ✅ Set up RLS policies
- ✅ All automatically via MCP!

---

## Alternative: Use SQL Migrations (Current Approach)

If switching the MCP connection is difficult, you can continue using the SQL migration files I created:
- `db/migrations/001_initial_schema.sql` - Run in Supabase SQL Editor
- `db/migrations/002_storage_setup.sql` - Run in Supabase SQL Editor

This works just as well, just requires manual copy-paste.

---

## Need Help?

If you can't find the MCP settings:
1. Check Cursor's documentation: https://cursor.sh/docs
2. Look for "MCP" or "Model Context Protocol" in Cursor's help
3. Try restarting Cursor after making changes
4. Let me know what you see in the settings and I can help troubleshoot!




