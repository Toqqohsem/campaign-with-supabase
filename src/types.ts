export interface Campaign {
  id: string;
  name: string;
  project: string;
  objective: string;
  budget: number;
  start_date: string;
  end_date: string;
  personas: Persona[];
  leads: Lead[];
  created_at: string;
  updated_at?: string;
}

export interface Persona {
  id: string;
  campaign_id?: string;
  name: string;
  motivations: string;
  pain_points: string;
  assets: CreativeAsset[];
  ad_copy: AdCopy[];
  created_at?: string;
}

export interface CreativeAsset {
  id: string;
  persona_id?: string;
  name: string;
  type: string;
  url: string;
  file?: File;
  created_at?: string;
}

export interface AdCopy {
  id: string;
  persona_id?: string;
  headline: string;
  description: string;
  created_at?: string;
}

export interface Lead {
  id: string;
  campaign_id?: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Site Visit' | 'Hot' | 'Converted' | 'Rejected';
  assigned_persona?: string;
  rejection_reason?: 'Price' | 'Location' | 'Layout' | 'Not Responsive';
  created_at?: string;
  updated_at?: string;
  // New fields for predictive buyer patterns
  demographics?: {
    age_range?: string;
    income_bracket?: string;
    family_size?: number;
    occupation?: string;
    education_level?: string;
  };
  property_preferences?: {
    bedrooms?: number;
    bathrooms?: number;
    location_area?: string;
    budget_min?: number;
    budget_max?: number;
    property_type?: string;
    must_have_features?: string[];
  };
  interaction_history?: Array<{
    type: string;
    timestamp: string;
    details?: string;
    channel?: string;
  }>;
  predicted_conversion_likelihood?: number; // 0.0 to 1.0
  buyer_segment?: string; // e.g., 'First-time Buyer', 'Investor', 'Upgrader'
}

export type ObjectiveType = 'Generate New Leads' | 'Drive Event Traffic' | 'Promote a Special Offer';
export type CampaignStep = 'overview' | 'wizard' | 'personas' | 'assets' | 'leads' | 'insights';

// Buyer segment types for predictive patterns
export type BuyerSegment = 
  | 'First-time Buyer'
  | 'Upgrader'
  | 'Investor'
  | 'Downsizer'
  | 'Luxury Buyer'
  | 'Budget Conscious';

// Interaction types for tracking lead engagement
export type InteractionType = 
  | 'Website Visit'
  | 'Email Open'
  | 'Email Click'
  | 'Phone Call'
  | 'Property Viewing'
  | 'Brochure Download'
  | 'Inquiry Form';