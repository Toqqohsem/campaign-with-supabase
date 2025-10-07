# Deployment Checklist

Use this checklist to ensure your Campaign Scaffolding Tool is properly configured and ready for production.

## Pre-Deployment Steps

### 1. Database Configuration

- [ ] Apply the authentication migration:
  ```sql
  -- Run the contents of: supabase/migrations/20251007000000_add_auth_support.sql
  -- This adds user_id to campaigns and creates restrictive RLS policies
  ```

- [ ] Verify RLS policies are active:
  ```sql
  -- Check that policies exist
  SELECT schemaname, tablename, policyname
  FROM pg_policies
  WHERE tablename IN ('campaigns', 'personas', 'creative_assets', 'ad_copy', 'leads');
  ```

- [ ] If you have existing campaigns, assign them to users:
  ```sql
  -- Replace YOUR_USER_ID with an actual user ID from auth.users
  UPDATE campaigns
  SET user_id = 'YOUR_USER_ID'
  WHERE user_id IS NULL;
  ```

### 2. Edge Function Deployment

- [ ] Deploy the updated Edge Function:
  ```bash
  supabase functions deploy predict-lead-conversion
  ```

- [ ] Test the Edge Function:
  ```bash
  curl -i --location --request POST \
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/predict-lead-conversion' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"leadData":{"id":"test-id","demographics":{},"property_preferences":{},"interaction_history":[]}}'
  ```

### 3. Environment Variables

- [ ] Verify `.env` file contains:
  ```env
  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```

- [ ] Ensure environment variables are set in your hosting platform

### 4. Authentication Setup

- [ ] Enable Email authentication in Supabase Dashboard:
  - Go to Authentication > Providers
  - Ensure "Email" is enabled
  - Configure email templates (optional)

- [ ] Test authentication flow:
  - [ ] Can create new account
  - [ ] Can login with existing account
  - [ ] Can logout successfully
  - [ ] Cannot access app without authentication

### 5. Build and Test

- [ ] Run production build:
  ```bash
  npm run build
  ```

- [ ] Test the production build locally:
  ```bash
  npm run preview
  ```

- [ ] Verify all features work:
  - [ ] Dashboard loads correctly
  - [ ] Can create new campaign
  - [ ] Can add personas
  - [ ] Can upload CSV leads
  - [ ] Can view predictive insights
  - [ ] Can export campaign PDF

## Deployment Steps

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables through Netlify Dashboard
# Site settings > Environment variables
```

### Option 3: Static Hosting

```bash
# Build the project
npm run build

# Upload contents of 'dist' folder to your hosting provider
# Examples: AWS S3, Google Cloud Storage, Azure Static Web Apps
```

## Post-Deployment Verification

- [ ] Visit deployed URL
- [ ] Verify authentication redirects work correctly
- [ ] Create a test account
- [ ] Create a test campaign
- [ ] Upload test leads
- [ ] Trigger ML prediction on a lead
- [ ] Verify data persists after logout/login
- [ ] Test on mobile device
- [ ] Check browser console for errors

## Security Checklist

- [ ] All environment variables are properly secured
- [ ] RLS policies are active and tested
- [ ] Users can only see their own data
- [ ] Edge Function has proper CORS configuration
- [ ] No sensitive data in client-side code
- [ ] Authentication tokens are properly managed

## Performance Checklist

- [ ] Production build is optimized
- [ ] Images are compressed (if added in future)
- [ ] Database queries use indexes
- [ ] Edge Function responds within 2 seconds
- [ ] Page loads within 3 seconds

## Monitoring Setup (Optional but Recommended)

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (e.g., Google Analytics, Plausible)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Enable Supabase monitoring in dashboard

## Known Issues to Monitor

1. **Page Refresh on Prediction**: Currently uses `window.location.reload()` - consider implementing real-time subscriptions
2. **File Storage**: Assets are preview-only - implement Supabase Storage for persistence
3. **Bulk Operations**: Large CSV imports may be slow - consider batch processing

## Rollback Plan

If issues occur after deployment:

1. **Database Issues**:
   ```sql
   -- Rollback RLS policies (emergency only)
   -- This will make data public again - use with caution!
   DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
   -- ... repeat for other policies
   ```

2. **Application Issues**:
   - Revert to previous deployment
   - Check error logs in hosting platform
   - Verify environment variables are correct

3. **Edge Function Issues**:
   ```bash
   # Redeploy previous version
   supabase functions deploy predict-lead-conversion --no-verify-jwt
   ```

## Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Hosting Platform Support**: [Your hosting provider]
- **Development Team**: [Your contact info]

## Success Criteria

The deployment is successful when:

- [ ] Users can sign up and log in
- [ ] Users can create and manage campaigns
- [ ] Users can only see their own data
- [ ] ML predictions work correctly
- [ ] Application is accessible at production URL
- [ ] No console errors on key user flows
- [ ] Mobile experience is functional

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Deployment Status**: [ ] Success [ ] Issues [ ] Rolled Back

## Notes

_Add any deployment-specific notes here:_
