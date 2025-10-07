/*
  # Expand Leads Table for Predictive Buyer Patterns

  1. New Columns Added
    - `demographics` (jsonb) - Store demographic information like age range, income bracket, family size
    - `property_preferences` (jsonb) - Store property preferences like bedrooms, location, budget range
    - `interaction_history` (jsonb) - Log interactions with leads (website visits, emails, calls)
    - `predicted_conversion_likelihood` (numeric) - Store conversion probability score (0.0 to 1.0)
    - `buyer_segment` (text) - Categorize leads into buyer segments

  2. Security
    - Maintain existing RLS policies
    - New columns inherit the same security model
*/

-- Add new columns for predictive buyer patterns
DO $$
BEGIN
  -- Add demographics column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'demographics'
  ) THEN
    ALTER TABLE leads ADD COLUMN demographics jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add property_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'property_preferences'
  ) THEN
    ALTER TABLE leads ADD COLUMN property_preferences jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add interaction_history column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'interaction_history'
  ) THEN
    ALTER TABLE leads ADD COLUMN interaction_history jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add predicted_conversion_likelihood column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'predicted_conversion_likelihood'
  ) THEN
    ALTER TABLE leads ADD COLUMN predicted_conversion_likelihood numeric(3,2) DEFAULT NULL;
  END IF;

  -- Add buyer_segment column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'buyer_segment'
  ) THEN
    ALTER TABLE leads ADD COLUMN buyer_segment text DEFAULT NULL;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_buyer_segment ON leads(buyer_segment);
CREATE INDEX IF NOT EXISTS idx_leads_conversion_likelihood ON leads(predicted_conversion_likelihood);

-- Add check constraint for conversion likelihood to ensure it's between 0 and 1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'leads_conversion_likelihood_range'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_conversion_likelihood_range 
    CHECK (predicted_conversion_likelihood >= 0.0 AND predicted_conversion_likelihood <= 1.0);
  END IF;
END $$;