import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Users, 
  Image, 
  FileText, 
  Download,
  TrendingUp,
  Edit,
  Plus,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { Campaign } from '../types';
import { generateCampaignPDF } from '../utils/pdfExport';

interface CampaignOverviewProps {
  campaign: Campaign;
  onNavigate: (step: string) => void;
  onBackToDashboard: () => void;
}

export function CampaignOverview({ campaign, onNavigate, onBackToDashboard }: CampaignOverviewProps) {
  const handleExportPDF = () => {
    generateCampaignPDF(campaign);
  };

  const statusCounts = campaign.leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conversionRate = campaign.leads.length > 0 
    ? ((statusCounts.Converted || 0) / campaign.leads.length * 100).toFixed(1) 
    : '0';

  const totalAssets = campaign.personas.reduce((sum, persona) => sum + persona.assets.length, 0);
  const totalCopy = campaign.personas.reduce((sum, persona) => sum + persona.ad_copy.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                <p className="text-gray-600">Campaign Overview & Management</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0 w-full sm:w-auto">
                <button
                  onClick={onBackToDashboard}
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
                <button
                  onClick={() => onNavigate('insights')}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  ML Insights
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Campaign Plan
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Objective</h3>
              </div>
              <p className="text-gray-600">{campaign.objective}</p>
              <p className="text-sm text-gray-500 mt-2">Project: {campaign.project}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Budget</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">RM {campaign.budget.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Total allocated</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Timeline</h3>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(campaign.start_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-900">
                to {new Date(campaign.end_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">Campaign period</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Performance</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
              <p className="text-sm text-gray-500 mt-2">Conversion rate</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{campaign.personas.length}</div>
                <div className="text-sm text-gray-600">Personas</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalAssets}</div>
                <div className="text-sm text-gray-600">Assets</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalCopy}</div>
                <div className="text-sm text-gray-600">Ad Copies</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{campaign.leads.length}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{statusCounts.Converted || 0}</div>
                <div className="text-sm text-gray-600">Converted</div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Personas
                </h2>
                <button
                  onClick={() => onNavigate('personas')}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {campaign.personas.map((persona) => (
                  <div key={persona.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>{persona.assets.length} assets</span>
                      <span>{persona.ad_copy.length} copies</span>
                    </div>
                  </div>
                ))}
                
                {campaign.personas.length < 3 && (
                  <button
                    onClick={() => onNavigate('personas')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 mx-auto mb-2" />
                    Add Persona
                  </button>
                )}
              </div>
            </div>

            {/* Assets & Copy */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-teal-600" />
                  Creative Assets
                </h2>
                <button
                  onClick={() => onNavigate('assets')}
                  className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Assets</span>
                  <span className="font-semibold text-gray-900">{totalAssets}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Ad Copies</span>
                  <span className="font-semibold text-gray-900">{totalCopy}</span>
                </div>
                <button
                  onClick={() => onNavigate('assets')}
                  className="w-full py-3 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
                >
                  Manage Assets & Copy
                </button>
              </div>
            </div>

            {/* Lead Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Lead Tracking
                </h2>
                <button
                  onClick={() => onNavigate('leads')}
                  className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Leads</span>
                  <span className="font-semibold text-gray-900">{campaign.leads.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Converted</span>
                  <span className="font-semibold text-green-600">{statusCounts.Converted || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-gray-700">Hot Leads</span>
                  <span className="font-semibold text-orange-600">{statusCounts.Hot || 0}</span>
                </div>
                <button
                  onClick={() => onNavigate('leads')}
                  className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  Manage Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}