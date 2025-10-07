/*
  # Add ML Triggers and Database Functions

  1. Database Functions
    - Function to call Edge Function for lead prediction
    - Function to handle lead data changes
  
  2. Triggers
    - Trigger on leads table for automatic prediction
    - Trigger for interaction history updates
  
  3. Indexes
    - Performance indexes for prediction queries
*/

-- Create function to call the Edge Function for predictions
CREATE OR REPLACE FUNCTION predict_lead_conversion(lead_row leads)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_data jsonb;
  function_url text;
BEGIN
  -- Only process if we have meaningful data to analyze
  IF lead_row.demographics IS NOT NULL OR 
     lead_row.property_preferences IS NOT NULL OR 
     lead_row.interaction_history IS NOT NULL THEN
    
    -- Prepare lead data for the Edge Function
    lead_data := jsonb_build_object(
      'id', lead_row.id,
      'demographics', COALESCE(lead_row.demographics, '{}'::jsonb),
      'property_preferences', COALESCE(lead_row.property_preferences, '{}'::jsonb),
      'interaction_history', COALESCE(lead_row.interaction_history, '[]'::jsonb)
    );
    
    -- Get the Supabase URL from environment (you'll need to set this)
    function_url := current_setting('app.supabase_url', true) || '/functions/v1/predict-lead-conversion';
    
    -- Make async call to Edge Function using pg_net extension
    -- Note: This requires the pg_net extension to be enabled
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
        ),
        body := jsonb_build_object('leadData', lead_data)
      );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the main operation
    RAISE WARNING 'Failed to call prediction function: %', SQLERRM;
END;
$$;

-- Create trigger function for lead changes
CREATE OR REPLACE FUNCTION handle_lead_prediction_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger prediction if relevant data has changed
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.demographics IS DISTINCT FROM NEW.demographics OR
       OLD.property_preferences IS DISTINCT FROM NEW.property_preferences OR
       OLD.interaction_history IS DISTINCT FROM NEW.interaction_history
     )) THEN
    
    -- Call prediction function asynchronously
    PERFORM predict_lead_conversion(NEW);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on leads table
DROP TRIGGER IF EXISTS trigger_predict_lead_conversion ON leads;
CREATE TRIGGER trigger_predict_lead_conversion
  AFTER INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_prediction_trigger();

-- Create indexes for better performance on prediction queries
CREATE INDEX IF NOT EXISTS idx_leads_conversion_likelihood 
  ON leads (predicted_conversion_likelihood DESC) 
  WHERE predicted_conversion_likelihood IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_buyer_segment 
  ON leads (buyer_segment) 
  WHERE buyer_segment IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_demographics 
  ON leads USING GIN (demographics) 
  WHERE demographics IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_property_preferences 
  ON leads USING GIN (property_preferences) 
  WHERE property_preferences IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_interaction_history 
  ON leads USING GIN (interaction_history) 
  WHERE interaction_history IS NOT NULL;

-- Create a view for high-value leads (conversion likelihood > 70%)
CREATE OR REPLACE VIEW high_value_leads AS
SELECT 
  l.*,
  c.name as campaign_name,
  c.project as campaign_project
FROM leads l
JOIN campaigns c ON l.campaign_id = c.id
WHERE l.predicted_conversion_likelihood > 0.7
ORDER BY l.predicted_conversion_likelihood DESC;

-- Create a view for buyer segment analytics
CREATE OR REPLACE VIEW buyer_segment_analytics AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  l.buyer_segment,
  COUNT(*) as lead_count,
  AVG(l.predicted_conversion_likelihood) as avg_conversion_likelihood,
  COUNT(*) FILTER (WHERE l.status = 'Converted') as converted_count,
  ROUND(
    (COUNT(*) FILTER (WHERE l.status = 'Converted')::numeric / COUNT(*) * 100), 2
  ) as actual_conversion_rate
FROM campaigns c
JOIN leads l ON c.id = l.campaign_id
WHERE l.buyer_segment IS NOT NULL
GROUP BY c.id, c.name, l.buyer_segment
ORDER BY c.id, avg_conversion_likelihood DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON high_value_leads TO authenticated;
GRANT SELECT ON buyer_segment_analytics TO authenticated;