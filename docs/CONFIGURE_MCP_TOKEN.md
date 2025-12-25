# Configure Your Supabase Access Token in Cursor MCP

You've provided your Supabase access token. Here's how to add it to Cursor's MCP configuration.

## Your Token (Keep This Secure!)
```
sbp_3247d2bab40faedf67ab1763ae8021c091e7116f
```

## Method 1: Via Cursor Settings UI (Easiest)

### Step 1: Open Cursor Settings
1. Press `Ctrl+,` (Windows) or `Cmd+,` (Mac)
2. Or: **File** → **Preferences** → **Settings**

### Step 2: Find MCP Configuration
1. In settings search, type: `mcp` or `model context protocol`
2. Look for **"MCP Servers"** or **"Model Context Protocol"**
3. Find the Supabase MCP entry

### Step 3: Add Second Account
1. Look for an option to **"Add Server"** or **"Add Account"**
2. Or duplicate the existing Supabase server
3. Configure it with:
   - **Name:** `supabase-granthunter` (or any name)
   - **Access Token:** `sbp_3247d2bab40faedf67ab1763ae8021c091e7116f`
   - **Server Type:** Supabase

### Step 4: Save and Restart
1. Save the configuration
2. Restart Cursor
3. Test by asking me to list projects

---

## Method 2: Manual Configuration File (If UI doesn't work)

### Step 1: Find MCP Config Location
The MCP configuration is typically in:
- **Windows:** `%APPDATA%\Cursor\User\globalStorage\` or `%APPDATA%\Cursor\User\settings.json`
- **Mac:** `~/Library/Application Support/Cursor/User/globalStorage/` or `~/Library/Application Support/Cursor/User/settings.json`
- **Linux:** `~/.config/Cursor/User/globalStorage/` or `~/.config/Cursor/User/settings.json`

### Step 2: Open Settings JSON
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Preferences: Open User Settings (JSON)`
3. Look for MCP configuration

### Step 3: Add Configuration
Look for something like:
```json
{
  "mcp": {
    "servers": {
      "supabase": {
        // existing config
      }
    }
  }
}
```

Add a second server:
```json
{
  "mcp": {
    "servers": {
      "supabase-primary": {
        // keep existing config
      },
      "supabase-granthunter": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-supabase",
          "--access-token",
          "sbp_3247d2bab40faedf67ab1763ae8021c091e7116f"
        ]
      }
    }
  }
}
```

Or if it uses a different format:
```json
{
  "mcpServers": {
    "supabase-granthunter": {
      "accessToken": "sbp_3247d2bab40faedf67ab1763ae8021c091e7116f"
    }
  }
}
```

### Step 4: Save and Restart
1. Save the JSON file
2. Restart Cursor completely

---

## Method 3: Environment Variable (Alternative)

Some MCP configurations support environment variables:

1. Create or edit `.env` file in your project root (or system environment)
2. Add:
   ```
   SUPABASE_ACCESS_TOKEN_GRANTHUNTER=sbp_3247d2bab40faedf67ab1763ae8021c091e7116f
   ```
3. Reference it in MCP config if supported

---

## Testing the Configuration

After configuring, test by asking me:
- "List all Supabase projects"
- "Can you see project xvrqtrkrqrcgypghjlvu?"

If I can see your GrantHunter project, the configuration worked!

---

## What I Can Do Once Configured

Once the token is configured and I can access your account, I'll be able to:
- ✅ List your projects (including `xvrqtrkrqrcgypghjlvu`)
- ✅ Enable pgvector extension automatically
- ✅ Run database migrations via MCP
- ✅ Create storage buckets
- ✅ Set up RLS policies
- ✅ Check project status
- ✅ All without manual SQL!

---

## Troubleshooting

### "Can't find MCP settings"
- Try searching for "MCP" in Cursor settings
- Check Cursor's documentation: https://cursor.sh/docs
- Look for "Model Context Protocol" in help menu

### "Token not working"
- Verify you're logged into the correct Supabase account
- Check the token hasn't expired (they don't expire, but can be revoked)
- Make sure the token has the right permissions

### "Still can't see the project"
- Restart Cursor completely
- Check if there are multiple MCP servers and I'm using the right one
- Verify the token is for the account with project `xvrqtrkrqrcgypghjlvu`

---

## Security Reminder

⚠️ **Keep your token secure:**
- Don't commit it to git
- Don't share it publicly
- Revoke it if compromised: https://supabase.com/dashboard/account/tokens

---

## Next Steps

1. Configure the token using one of the methods above
2. Restart Cursor
3. Ask me to test: "Can you list my Supabase projects?"
4. If I can see `xvrqtrkrqrcgypghjlvu`, I'll set up your database automatically!




