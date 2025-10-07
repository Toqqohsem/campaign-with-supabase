import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCampaigns } from './hooks/useCampaigns';
import { CampaignStep } from './types';
import { Dashboard } from './components/Dashboard';
import { CampaignWizard } from './components/CampaignWizard';
import { PersonaCreator } from './components/PersonaCreator';
import { AssetOrganizer } from './components/AssetOrganizer';
import { LeadTagger } from './components/LeadTagger';
import { CampaignOverview } from './components/CampaignOverview';
import PredictiveInsights from './components/PredictiveInsights';

export default function App() {
  const { 
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
    getBuyerSegmentAnalytics
  } = useCampaigns();
  const [currentStep, setCurrentStep] = useState<CampaignStep>('overview');

  const handleCreateCampaign = () => {
    setCurrentStep('wizard');
  };

  const handleWizardComplete = (data: any) => {
    const campaign = createCampaign(data);
    setCurrentStep('personas');
  };

  const handleSelectCampaign = (campaign: any) => {
    setCurrentCampaign(campaign);
    setCurrentStep('overview');
  };

  const handleNavigate = (step: CampaignStep) => {
    setCurrentStep(step);
  };

  const handleBackToDashboard = () => {
    setCurrentCampaign(null);
    setCurrentStep('overview');
  };

  const handleUpdatePersonas = (personas: any[]) => {
    if (currentCampaign) {
      updateCampaign(currentCampaign.id, { personas });
    }
  };

  const handleUpdateLeads = (leads: any[]) => {
    if (currentCampaign) {
      updateLeads(currentCampaign.id, leads);
    }
  };

  const handleTriggerPrediction = async (leadId: string) => {
    try {
      await triggerLeadPrediction(leadId);
      // Reload campaigns to get updated predictions
      // Note: In a real app, you might want to use real-time subscriptions
      setTimeout(() => {
        window.location.reload(); // Simple refresh for demo
      }, 2000);
    } catch (error) {
      console.error('Failed to trigger prediction:', error);
      alert('Failed to trigger ML prediction. Please try again.');
    }
  };
  const handleComplete = () => {
    setCurrentStep('overview');
  };

  // Dashboard view
  if (currentStep === 'overview' && !currentCampaign) {
    return (
      <Dashboard
        campaigns={campaigns}
        loading={loading}
        error={error}
        onCreateCampaign={handleCreateCampaign}
        onSelectCampaign={handleSelectCampaign}
      />
    );
  }

  // Campaign Wizard
  if (currentStep === 'wizard') {
    return (
      <CampaignWizard
        onComplete={handleWizardComplete}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Campaign views
  if (!currentCampaign) {
    return <div>Loading...</div>;
  }

  const showBackButton = currentStep !== 'overview';

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      {showBackButton && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => currentStep === 'personas' ? handleBackToDashboard() : setCurrentStep('overview')}
            className="flex items-center px-4 py-2 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 'personas' ? 'Back to Dashboard' : 'Back to Overview'}
          </button>
        </div>
      )}

      {/* Campaign Overview */}
      {currentStep === 'overview' && (
        <CampaignOverview
          campaign={currentCampaign}
          onNavigate={handleNavigate}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {/* Persona Creator */}
      {currentStep === 'personas' && (
        <PersonaCreator
          personas={currentCampaign.personas}
          onUpdatePersonas={handleUpdatePersonas}
          onNext={() => setCurrentStep('assets')}
        />
      )}

      {/* Asset Organizer */}
      {currentStep === 'assets' && (
        <AssetOrganizer
          personas={currentCampaign.personas}
          onUpdatePersonas={handleUpdatePersonas}
          onNext={() => setCurrentStep('leads')}
        />
      )}

      {/* Lead Tagger */}
      {currentStep === 'leads' && (
        <LeadTagger
          leads={currentCampaign.leads}
          personas={currentCampaign.personas}
          onUpdateLeads={handleUpdateLeads}
          onTriggerPrediction={handleTriggerPrediction}
          onNext={handleComplete}
        />
      )}

      {/* Predictive Insights */}
      {currentStep === 'insights' && (
        <PredictiveInsights
          campaign={currentCampaign}
        />
      )}
    </div>
  );
}