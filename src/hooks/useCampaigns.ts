import { useState, useEffect } from 'react';
import { Campaign, Lead, Persona } from '../types';
import { supabase } from '../utils/supabaseClient';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Load personas, assets, ad copy, and leads for each campaign
      const campaignsWithDetails = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          // Load personas
          const { data: personasData, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .eq('campaign_id', campaign.id);

          if (personasError) throw personasError;

          // Load personas with their assets and ad copy
          const personasWithDetails = await Promise.all(
            (personasData || []).map(async (persona) => {
              // Load assets
              const { data: assetsData, error: assetsError } = await supabase
                .from('creative_assets')
                .select('*')
                .eq('persona_id', persona.id);

              if (assetsError) throw assetsError;

              // Load ad copy
              const { data: adCopyData, error: adCopyError } = await supabase
                .from('ad_copy')
                .select('*')
                .eq('persona_id', persona.id);

              if (adCopyError) throw adCopyError;

              return {
                ...persona,
                pain_points: persona.pain_points,
                assets: assetsData || [],
                ad_copy: adCopyData || [],
              };
            })
          );

          // Load leads
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select(`
              *,
              demographics,
              property_preferences,
              interaction_history,
              predicted_conversion_likelihood,
              buyer_segment
            `)
            .eq('campaign_id', campaign.id);

          if (leadsError) throw leadsError;

          return {
            ...campaign,
            personas: personasWithDetails,
            leads: leadsData || [],
          };
        })
      );

      setCampaigns(campaignsWithDetails);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'personas' | 'leads' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaignData.name,
          project: campaignData.project,
          objective: campaignData.objective,
          budget: campaignData.budget,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newCampaign: Campaign = {
        ...data,
        personas: [],
        leads: [],
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      setCurrentCampaign(newCampaign);
      return newCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      setLoading(true);
      setError(null);

      // Handle personas update separately
      if (updates.personas) {
        await updatePersonas(campaignId, updates.personas);
        delete updates.personas;
      }

      // Handle leads update separately
      if (updates.leads) {
        await updateLeads(campaignId, updates.leads);
        delete updates.leads;
      }

      // Update campaign basic info if there are other updates
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('campaigns')
          .update(updates)
          .eq('id', campaignId);

        if (error) throw error;
      }

      // Reload campaigns to get fresh data
      await loadCampaigns();

      // Update current campaign if it's the one being updated
      if (currentCampaign?.id === campaignId) {
        const updatedCampaign = campaigns.find(c => c.id === campaignId);
        if (updatedCampaign) {
          setCurrentCampaign(updatedCampaign);
        }
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonas = async (campaignId: string, personas: Persona[]) => {
    try {
      // Delete existing personas and their related data
      const { error: deleteError } = await supabase
        .from('personas')
        .delete()
        .eq('campaign_id', campaignId);

      if (deleteError) throw deleteError;

      // Insert new personas
      for (const persona of personas) {
        const { data: personaData, error: personaError } = await supabase
          .from('personas')
          .insert([{
            campaign_id: campaignId,
            name: persona.name,
            motivations: persona.motivations,
            pain_points: persona.pain_points,
          }])
          .select()
          .single();

        if (personaError) throw personaError;

        // Insert assets
        if (persona.assets && persona.assets.length > 0) {
          const assetsToInsert = persona.assets.map(asset => ({
            persona_id: personaData.id,
            name: asset.name,
            type: asset.type,
            url: asset.url,
          }));

          const { error: assetsError } = await supabase
            .from('creative_assets')
            .insert(assetsToInsert);

          if (assetsError) throw assetsError;
        }

        // Insert ad copy
        if (persona.ad_copy && persona.ad_copy.length > 0) {
          const adCopyToInsert = persona.ad_copy.map(copy => ({
            persona_id: personaData.id,
            headline: copy.headline,
            description: copy.description,
          }));

          const { error: adCopyError } = await supabase
            .from('ad_copy')
            .insert(adCopyToInsert);

          if (adCopyError) throw adCopyError;
        }
      }
    } catch (err) {
      console.error('Error updating personas:', err);
      throw err;
    }
  };

  const updateLeads = async (campaignId: string, leads: Lead[]) => {
    try {
      // Delete existing leads
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('campaign_id', campaignId);

      if (deleteError) throw deleteError;

      // Insert new leads
      if (leads.length > 0) {
        const leadsToInsert = leads.map(lead => ({
          campaign_id: campaignId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          assigned_persona: lead.assigned_persona,
          rejection_reason: lead.rejection_reason,
          demographics: lead.demographics || {},
          property_preferences: lead.property_preferences || {},
          interaction_history: lead.interaction_history || [],
          predicted_conversion_likelihood: lead.predicted_conversion_likelihood,
          buyer_segment: lead.buyer_segment,
        }));

        const { error: insertError } = await supabase
          .from('leads')
          .insert(leadsToInsert);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error updating leads:', err);
      throw err;
    }
  };

  const triggerLeadPrediction = async (leadId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('predict-lead-conversion', {
        body: { leadId }
      });

      if (error) {
        console.error('Error triggering prediction:', error);
        throw error;
      }

      console.log('Prediction triggered successfully:', data);
      return data;
    } catch (err) {
      console.error('Error in triggerLeadPrediction:', err);
      throw err;
    }
  };

  const getHighValueLeads = async (campaignId?: string) => {
    try {
      let query = supabase.from('high_value_leads').select('*');
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching high-value leads:', err);
      throw err;
    }
  };

  const getBuyerSegmentAnalytics = async (campaignId?: string) => {
    try {
      let query = supabase.from('buyer_segment_analytics').select('*');
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching buyer segment analytics:', err);
      throw err;
    }
  };

  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    setCurrentCampaign,
    createCampaign,
    updateCampaign,
    updateLeads,
    triggerLeadPrediction,
    getHighValueLeads,
    getBuyerSegmentAnalytics,
    loadCampaigns,
  };
}