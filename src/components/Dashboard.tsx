import React from 'react';
import { Plus, Calendar, Target, TrendingUp, Users } from 'lucide-react';
import { Campaign } from '../types';

interface DashboardProps {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  onCreateCampaign: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export function Dashboard({ campaigns, loading, error, onCreateCampaign, onSelectCampaign }: DashboardProps) {
  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    
    if (now < startDate) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Loading campaigns...</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Campaign Scaffolding Tool</h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, manage, and optimize your marketing campaigns with precision
            </p>
            <button
              onClick={onCreateCampaign}
              className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Campaign
            </button>
          </div>

          {/* Stats Overview */}
          {campaigns.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
                <div className="text-gray-600">Active Campaigns</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, campaign) => sum + campaign.personas.length, 0)}
                </div>
                <div className="text-gray-600">Total Personas</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, campaign) => sum + campaign.leads.length, 0)}
                </div>
                <div className="text-gray-600">Total Leads</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, campaign) => 
                    sum + campaign.leads.filter(lead => lead.status === 'Converted').length, 0
                  )}
                </div>
                <div className="text-gray-600">Conversions</div>
              </div>
            </div>
          )}

          {/* Campaigns Grid */}
          {campaigns.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Campaigns</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  const conversionRate = campaign.leads.length > 0 
                    ? ((campaign.leads.filter(lead => lead.status === 'Converted').length / campaign.leads.length) * 100).toFixed(1)
                    : '0';
                  
                  const { status, color } = getCampaignStatus(campaign);
                  
                  return (
                    <div
                      key={campaign.id}
                      onClick={() => onSelectCampaign(campaign)}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {campaign.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>
                              {status}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {campaign.objective}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Project:</span>
                          <span className="text-gray-900">{campaign.project}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budget:</span>
                          <span className="text-gray-900">RM {campaign.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Period:</span>
                          <span className="text-gray-900">
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex space-x-4">
                            <span className="text-gray-600">{campaign.personas.length} personas</span>
                            <span className="text-gray-600">{campaign.leads.length} leads</span>
                          </div>
                          <span className="font-semibold text-green-600">{conversionRate}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (campaign.personas.length / 3) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Campaign setup progress</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No campaigns yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first campaign. Define personas, organize assets, and track leads all in one place.
              </p>
              <button
                onClick={onCreateCampaign}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}