# ⚠️ DATABASE SETUP REQUIRED

## IMPORTANT: Action Required Before Using the Application

The application has been updated with authentication and security features, but a database migration needs to be applied to your Supabase project before the app will work correctly.

## What Needs to Be Done

You need to run a SQL migration that:
1. Adds a `user_id` column to the `campaigns` table
2. Updates all Row Level Security (RLS) policies to restrict data access by user
3. Ensures users can only see and modify their own campaign data

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** section
3. Create a new query
4. Copy the entire contents of this file:
   ```
   supabase/migrations/20251007000000_add_auth_support.sql
   ```
5. Paste the contents into the SQL Editor
6. Click **Run** to execute the migration
7. Wait for confirmation that the migration completed successfully

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Push the migration to your database
supabase db push
```

## Verification Steps

After applying the migration, verify it worked correctly:

### 1. Check if user_id column was added

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'user_id';
```

Expected result: Should return one row showing the `user_id` column exists.

### 2. Check if RLS policies were updated

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('campaigns', 'personas', 'creative_assets', 'ad_copy', 'leads')
ORDER BY tablename, policyname;
```

Expected result: Should return multiple policies with names like "Users can view own campaigns", "Users can create own campaigns", etc.

### 3. Check if index was created

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'campaigns' AND indexname = 'idx_campaigns_user_id';
```

Expected result: Should return one row showing the index exists.

## Handling Existing Data

If you have existing campaigns in your database before applying this migration, they will have `NULL` in the `user_id` column. You have two options:

### Option A: Assign all campaigns to a specific user

```sql
-- First, get a user ID from your auth.users table
SELECT id, email FROM auth.users LIMIT 5;

-- Then assign campaigns to that user
UPDATE campaigns
SET user_id = 'PASTE_USER_ID_HERE'
WHERE user_id IS NULL;
```

### Option B: Delete existing test campaigns

```sql
-- CAUTION: This will delete ALL campaigns without a user_id
DELETE FROM campaigns WHERE user_id IS NULL;
```

## What Happens If You Don't Apply the Migration?

If you try to use the application without applying this migration:

- ❌ Creating campaigns will **fail** (missing user_id column)
- ❌ Loading campaigns will **fail** (RLS policies won't match)
- ❌ Authentication will work, but no data operations will succeed
- ❌ You'll see errors in the browser console

## What the Migration Changes

### Before Migration
- RLS policies allow all operations with `USING (true)`
- No user ownership tracking
- All users can see all campaigns (if auth was added)

### After Migration
- RLS policies restrict access based on authentication
- Campaigns are owned by specific users
- Users can only see and modify their own data
- Secure multi-tenant architecture

## Troubleshooting

### Error: "relation campaigns does not exist"
- Make sure you've run the initial migrations first
- Check that your database has the campaigns table

### Error: "column user_id does not exist"
- The migration didn't apply successfully
- Try running it again through the SQL Editor

### Error: "permission denied for table campaigns"
- RLS policies are active but user_id is NULL
- Assign campaigns to users or delete orphaned campaigns

### Users can't create campaigns
- Verify the Edge Function is deployed
- Check that authentication is working
- Ensure the migration was applied successfully

## Need Help?

1. Check the Supabase logs in your dashboard
2. Look for errors in the browser console (F12)
3. Verify your .env file has correct Supabase credentials
4. Review the IMPLEMENTATION_NOTES.md for detailed information

## Migration Status

- [ ] Migration SQL file exists: `supabase/migrations/20251007000000_add_auth_support.sql`
- [ ] Migration has been applied to database
- [ ] Verification steps passed
- [ ] Existing campaigns (if any) have been assigned to users
- [ ] Application tested and working with authentication

---

**Once you've completed these steps, delete this file or mark it as [COMPLETED]**
