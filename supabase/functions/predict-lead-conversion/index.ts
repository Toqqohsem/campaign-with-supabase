import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

// Simple rule-based model for demonstration
// In production, this would be replaced with a trained ML model
function predictLeadConversion(leadData: LeadData): PredictionResult {
  let conversionScore = 0.5 // Base score
  let buyerSegment = 'Unknown'
  
  // Demographics scoring
  if (leadData.demographics) {
    const { age_range, income_bracket, family_size } = leadData.demographics
    
    // Age factor
    if (age_range === '26-35' || age_range === '36-45') {
      conversionScore += 0.15 // Prime buying age
    } else if (age_range === '46-55') {
      conversionScore += 0.1
    }
    
    // Income factor
    if (income_bracket === 'RM 20,000 - RM 50,000' || income_bracket === 'Above RM 50,000') {
      conversionScore += 0.2
    } else if (income_bracket === 'RM 10,000 - RM 20,000') {
      conversionScore += 0.1
    }
    
    // Family size factor
    if (family_size && family_size >= 3) {
      conversionScore += 0.1 // Families more likely to buy
    }
  }
  
  // Property preferences scoring
  if (leadData.property_preferences) {
    const { bedrooms, budget_min, budget_max, location_area } = leadData.property_preferences
    
    // Clear preferences indicate serious buyer
    if (bedrooms && budget_min && budget_max) {
      conversionScore += 0.15
    }
    
    // Premium locations
    if (location_area && ['KLCC', 'Mont Kiara', 'Bangsar'].includes(location_area)) {
      conversionScore += 0.1
    }
    
    // Budget range analysis
    if (budget_min && budget_max) {
      const budgetRange = budget_max - budget_min
      if (budgetRange < 200000) {
        conversionScore += 0.05 // Focused budget range
      }
    }
  }
  
  // Interaction history scoring
  if (leadData.interaction_history && leadData.interaction_history.length > 0) {
    const interactions = leadData.interaction_history
    conversionScore += Math.min(interactions.length * 0.05, 0.2) // Cap at 0.2
    
    // High-value interactions
    const highValueInteractions = interactions.filter(i => 
      ['Property Viewing', 'Brochure Download', 'Phone Call'].includes(i.type)
    )
    conversionScore += highValueInteractions.length * 0.1
  }
  
  // Determine buyer segment based on data patterns
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
  
  // Multiple property interest suggests investor
  if (leadData.interaction_history && leadData.interaction_history.length > 10) {
    buyerSegment = 'Investor'
  }
  
  if (leadData.demographics?.income_bracket === 'Below RM 5,000' || 
      leadData.demographics?.income_bracket === 'RM 5,000 - RM 10,000') {
    buyerSegment = 'Budget Conscious'
  }
  
  // Ensure score is within bounds
  conversionScore = Math.max(0, Math.min(1, conversionScore))
  
  return {
    predicted_conversion_likelihood: Math.round(conversionScore * 100) / 100,
    buyer_segment: buyerSegment !== 'Unknown' ? buyerSegment : 'First-time Buyer',
    confidence_score: 0.85 // Static for demo, would be dynamic in real ML model
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { leadData } = await req.json()
    
    if (!leadData || !leadData.id) {
      throw new Error('Lead data with ID is required')
    }

    console.log('Processing lead prediction for:', leadData.id)

    // Generate predictions using our model
    const predictions = predictLeadConversion(leadData)
    
    console.log('Generated predictions:', predictions)

    // Update the lead in the database
    const { error: updateError } = await supabaseClient
      .from('leads')
      .update({
        predicted_conversion_likelihood: predictions.predicted_conversion_likelihood,
        buyer_segment: predictions.buyer_segment,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadData.id)

    if (updateError) {
      throw updateError
    }

    console.log('Successfully updated lead with predictions')

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
    )

  } catch (error) {
    console.error('Error in predict-lead-conversion:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})