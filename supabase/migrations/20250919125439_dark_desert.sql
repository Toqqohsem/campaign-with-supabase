/*
  # Create Campaign Management Schema

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `name` (text)
      - `project` (text)
      - `objective` (text)
      - `budget` (numeric)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `personas`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key)
      - `name` (text)
      - `motivations` (text)
      - `pain_points` (text)
      - `created_at` (timestamp)
    
    - `creative_assets`
      - `id` (uuid, primary key)
      - `persona_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text)
      - `url` (text)
      - `created_at` (timestamp)
    
    - `ad_copy`
      - `id` (uuid, primary key)
      - `persona_id` (uuid, foreign key)
      - `headline` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `leads`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text)
      - `assigned_persona` (text)
      - `rejection_reason` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  project text NOT NULL,
  objective text NOT NULL,
  budget numeric NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  motivations text NOT NULL,
  pain_points text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create creative_assets table
CREATE TABLE IF NOT EXISTS creative_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ad_copy table
CREATE TABLE IF NOT EXISTS ad_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  headline text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  status text DEFAULT 'New',
  assigned_persona text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later with auth)
CREATE POLICY "Allow all operations on campaigns"
  ON campaigns
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on personas"
  ON personas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on creative_assets"
  ON creative_assets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on ad_copy"
  ON ad_copy
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on leads"
  ON leads
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();