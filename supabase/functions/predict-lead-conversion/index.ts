import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LeadData {
  id: string
  demographics?: {
    age_range?: string
    income_bracket?: string
    family_size?: number
    occupation?: string
    education_level?: string
  }
  property_preferences?: {
    bedrooms?: number
    bathrooms?: number
    location_area?: string
    budget_min?: number
    budget_max?: number
    property_type?: string
    must_have_features?: string[]
  }
  interaction_history?: Array<{
    type: string
    timestamp: string
    details?: string
    channel?: string
  }>
}

interface PredictionResult {
  predicted_conversion_likelihood: number
  buyer_segment: string
  confidence_score: number
}

function predictLeadConversion(leadData: LeadData): PredictionResult {
  let conversionScore = 0.5
  let buyerSegment = 'Unknown'

  if (leadData.demographics) {
    const { age_range, income_bracket, family_size } = leadData.demographics

    if (age_range === '26-35' || age_range === '36-45') {
      conversionScore += 0.15
    } else if (age_range === '46-55') {
      conversionScore += 0.1
    }

    if (income_bracket === 'RM 20,000 - RM 50,000' || income_bracket === 'Above RM 50,000') {
      conversionScore += 0.2
    } else if (income_bracket === 'RM 10,000 - RM 20,000') {
      conversionScore += 0.1
    }

    if (family_size && family_size >= 3) {
      conversionScore += 0.1
    }
  }

  if (leadData.property_preferences) {
    const { bedrooms, budget_min, budget_max, location_area } = leadData.property_preferences

    if (bedrooms && budget_min && budget_max) {
      conversionScore += 0.15
    }

    if (location_area && ['KLCC', 'Mont Kiara', 'Bangsar'].includes(location_area)) {
      conversionScore += 0.1
    }

    if (budget_min && budget_max) {
      const budgetRange = budget_max - budget_min
      if (budgetRange < 200000) {
        conversionScore += 0.05
      }
    }
  }

  if (leadData.interaction_history && leadData.interaction_history.length > 0) {
    const interactions = leadData.interaction_history
    conversionScore += Math.min(interactions.length * 0.05, 0.2)

    const highValueInteractions = interactions.filter(i =>
      ['Property Viewing', 'Brochure Download', 'Phone Call'].includes(i.type)
    )
    conversionScore += highValueInteractions.length * 0.1
  }

  if (leadData.demographics?.age_range === '18-25' || leadData.demographics?.age_range === '26-35') {
    if (leadData.property_preferences?.budget_max && leadData.property_preferences.budget_max < 500000) {
      buyerSegment = 'First-time Buyer'
    }
  }

  if (leadData.demographics?.income_bracket === 'Above RM 50,000') {
    if (leadData.property_preferences?.budget_max && leadData.property_preferences.budget_max > 1000000) {
      buyerSegment = 'Luxury Buyer'
    } else {
      buyerSegment = 'Upgrader'
    }
  }

  if (leadData.demographics?.family_size && leadData.demographics.family_size >= 4) {
    buyerSegment = 'Upgrader'
  }

  if (leadData.demographics?.age_range === '56-65' || leadData.demographics?.age_range === '65+') {
    buyerSegment = 'Downsizer'
  }

  if (leadData.interaction_history && leadData.interaction_history.length > 10) {
    buyerSegment = 'Investor'
  }

  if (leadData.demographics?.income_bracket === 'Below RM 5,000' ||
      leadData.demographics?.income_bracket === 'RM 5,000 - RM 10,000') {
    buyerSegment = 'Budget Conscious'
  }

  conversionScore = Math.max(0, Math.min(1, conversionScore))

  return {
    predicted_conversion_likelihood: Math.round(conversionScore * 100) / 100,
    buyer_segment: buyerSegment !== 'Unknown' ? buyerSegment : 'First-time Buyer',
    confidence_score: 0.85
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { leadData } = await req.json();

    if (!leadData || !leadData.id) {
      throw new Error('Lead data with ID is required');
    }

    console.log('Processing lead prediction for:', leadData.id);

    const predictions = predictLeadConversion(leadData);

    console.log('Generated predictions:', predictions);

    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        predicted_conversion_likelihood: predictions.predicted_conversion_likelihood,
        buyer_segment: predictions.buyer_segment,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadData.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Successfully updated lead with predictions');

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        message: 'Lead predictions updated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in predict-lead-conversion:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
