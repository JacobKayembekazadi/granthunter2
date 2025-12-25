# Testing Signup Flow

## Current Setup

1. **Middleware**: Re-enabled - redirects unauthenticated users to `/login`
2. **Signup Page**: Available at `/signup` (allowed by middleware)
3. **Database Trigger**: Should auto-create user record on signup

## How to Test

1. **Go directly to signup**: http://localhost:3000/signup
   - Should show the signup form
   - If you get redirected, there's a middleware issue

2. **Try signing up**:
   - Fill in: Full Name, Email, Password (min 8 chars)
   - Click "Initialize System Access"
   - Should create account and redirect to `/login`

3. **Check if user was created**:
   - Go to Supabase Dashboard → Authentication → Users
   - Should see the new user
   - Go to Table Editor → `users` table
   - Should see a record with matching email

## Common Issues

### Issue: "Can't access /signup"
- **Fix**: Go directly to http://localhost:3000/signup (not `/`)
- The middleware allows `/signup` path

### Issue: "Signup fails with database error"
- **Check**: Database trigger `handle_new_user` exists
- **Check**: `users` table exists
- **Fix**: Run the SQL migration again if needed

### Issue: "User created but not in users table"
- **Check**: Database trigger is working
- **Fix**: Manually verify trigger exists in Supabase SQL Editor

## Verify Database Trigger

Run this in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If missing, create it:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```


