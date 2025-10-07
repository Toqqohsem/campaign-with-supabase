/*
  # Add Authentication Support and Update RLS Policies

  1. Database Changes
    - Add user_id column to campaigns table to track ownership
    - Add index for user_id for better query performance

  2. Security Changes
    - Drop existing permissive policies that allow public access
    - Create restrictive policies that only allow authenticated users to access their own data
    - Ensure all related tables (personas, assets, ad_copy, leads) inherit campaign ownership

  3. Notes
    - After running this migration, users will only see their own campaigns
    - All existing campaigns will need to be assigned to a user manually if needed
    - The frontend has been updated to set user_id when creating campaigns
*/

-- Add user_id column to campaigns table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on campaigns" ON campaigns;
DROP POLICY IF EXISTS "Allow all operations on personas" ON personas;
DROP POLICY IF EXISTS "Allow all operations on creative_assets" ON creative_assets;
DROP POLICY IF EXISTS "Allow all operations on ad_copy" ON ad_copy;
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;

-- Campaigns policies
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Personas policies (based on campaign ownership)
CREATE POLICY "Users can view personas of own campaigns"
  ON personas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = personas.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create personas for own campaigns"
  ON personas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = personas.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update personas of own campaigns"
  ON personas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = personas.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = personas.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete personas of own campaigns"
  ON personas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = personas.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Creative assets policies (based on persona/campaign ownership)
CREATE POLICY "Users can view assets of own campaigns"
  ON creative_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = creative_assets.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets for own campaigns"
  ON creative_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = creative_assets.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assets of own campaigns"
  ON creative_assets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = creative_assets.persona_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = creative_assets.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets of own campaigns"
  ON creative_assets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = creative_assets.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Ad copy policies (based on persona/campaign ownership)
CREATE POLICY "Users can view ad copy of own campaigns"
  ON ad_copy FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = ad_copy.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ad copy for own campaigns"
  ON ad_copy FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = ad_copy.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ad copy of own campaigns"
  ON ad_copy FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = ad_copy.persona_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = ad_copy.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ad copy of own campaigns"
  ON ad_copy FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personas
      JOIN campaigns ON campaigns.id = personas.campaign_id
      WHERE personas.id = ad_copy.persona_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Leads policies (based on campaign ownership)
CREATE POLICY "Users can view leads of own campaigns"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = leads.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for own campaigns"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = leads.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads of own campaigns"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = leads.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = leads.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leads of own campaigns"
  ON leads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = leads.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create index for user_id on campaigns for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
