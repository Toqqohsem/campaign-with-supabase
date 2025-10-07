import React from 'react';
import { TrendingUp, Users, Target, Brain, BarChart3, PieChart } from 'lucide-react';
import { Campaign, Lead, BuyerSegment } from '../types';

interface PredictiveInsightsProps {
  campaign: Campaign;
  buyerSegmentAnalytics?: any[];
}

export default function PredictiveInsights({ campaign, buyerSegmentAnalytics = [] }: PredictiveInsightsProps) {
  const leads = campaign.leads;
  
  // Calculate buyer segment distribution
  const segmentDistribution = leads.reduce((acc, lead) => {
    if (lead.buyer_segment) {
      acc[lead.buyer_segment] = (acc[lead.buyer_segment] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate average conversion likelihood
  const leadsWithScores = leads.filter(lead => lead.predicted_conversion_likelihood !== undefined);
  const avgConversionLikelihood = leadsWithScores.length > 0
    ? leadsWithScores.reduce((sum, lead) => sum + (lead.predicted_conversion_likelihood || 0), 0) / leadsWithScores.length
    : 0;

  // High-value leads (conversion likelihood > 0.7)
  const highValueLeads = leads.filter(lead => (lead.predicted_conversion_likelihood || 0) > 0.7);
  
  // Most common property preferences
  const propertyPreferences = leads
    .filter(lead => lead.property_preferences)
    .map(lead => lead.property_preferences!);
  
  const avgBedrooms = propertyPreferences.length > 0
    ? propertyPreferences.reduce((sum, pref) => sum + (pref.bedrooms || 0), 0) / propertyPreferences.length
    : 0;

  const commonAreas = propertyPreferences
    .map(pref => pref.location_area)
    .filter(Boolean)
    .reduce((acc, area) => {
      if (area) acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topArea = Object.entries(commonAreas).sort(([,a], [,b]) => b - a)[0];

  // Age demographics
  const ageDistribution = leads
    .filter(lead => lead.demographics?.age_range)
    .reduce((acc, lead) => {
      const ageRange = lead.demographics!.age_range!;
      acc[ageRange] = (acc[ageRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'First-time Buyer': 'bg-blue-100 text-blue-800',
      'Upgrader': 'bg-green-100 text-green-800',
      'Investor': 'bg-teal-100 text-teal-800',
      'Downsizer': 'bg-orange-100 text-orange-800',
      'Luxury Buyer': 'bg-yellow-100 text-yellow-800',
      'Budget Conscious': 'bg-red-100 text-red-800',
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <Brain className="w-8 h-8 mr-3 text-blue-600" />
              Predictive Buyer Insights
            </h1>
            <p className="text-gray-600">AI-powered analysis of your campaign's buyer patterns and conversion potential</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{(avgConversionLikelihood * 100).toFixed(1)}%</div>
              <div className="text-gray-600">Avg Conversion Score</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{highValueLeads.length}</div>
              <div className="text-gray-600">High-Value Leads</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Object.keys(segmentDistribution).length}</div>
              <div className="text-gray-600">Buyer Segments</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{leadsWithScores.length}</div>
              <div className="text-gray-600">Scored Leads</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buyer Segments */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-teal-600" />
                Buyer Segment Distribution
              </h2>
              
              <div className="space-y-4">
                {Object.entries(segmentDistribution).map(([segment, count]) => {
                  const percentage = ((count / leads.length) * 100).toFixed(1);
                  return (
                    <div key={segment} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(segment)}`}>
                          {segment}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(segmentDistribution).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No buyer segments classified yet</p>
                    <p className="text-sm">Add buyer segment data to leads to see insights</p>
                  </div>
                )}
              </div>
            </div>

            {/* High-Value Leads */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                High-Value Leads (70%+ Score)
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(highValueLeads.length > 0 ? highValueLeads : leads.filter(lead => (lead.predicted_conversion_likelihood || 0) > 0.7)).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                      {lead.buyer_segment && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getSegmentColor(lead.buyer_segment)}`}>
                          {lead.buyer_segment}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {((lead.predicted_conversion_likelihood || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">conversion score</div>
                    </div>
                  </div>
                ))}
                
                {(highValueLeads.length > 0 ? highValueLeads : leads.filter(lead => (lead.predicted_conversion_likelihood || 0) > 0.7)).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No high-value leads identified</p>
                    <p className="text-sm">Add conversion scores to leads to identify high-value prospects</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Preferences Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Property Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Average Bedrooms Wanted</span>
                  <span className="font-semibold text-gray-900">{avgBedrooms.toFixed(1)}</span>
                </div>
                
                {topArea && (
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Most Popular Area</span>
                    <span className="font-semibold text-gray-900">{topArea[0]} ({topArea[1]} leads)</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Leads with Preferences</span>
                  <span className="font-semibold text-gray-900">{propertyPreferences.length} / {leads.length}</span>
                </div>
              </div>
            </div>

            {/* Age Demographics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-600" />
                Age Demographics
              </h2>
              
              <div className="space-y-3">
                {Object.entries(ageDistribution).map(([ageRange, count]) => {
                  const percentage = ((count / leads.length) * 100).toFixed(1);
                  return (
                    <div key={ageRange} className="flex items-center justify-between">
                      <span className="text-gray-700">{ageRange}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(ageDistribution).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No age demographics available</p>
                    <p className="text-sm">Add demographic data to leads to see age distribution</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              ML-Powered Recommendations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Focus Areas</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {(highValueLeads.length > 0 ? highValueLeads : leads.filter(lead => (lead.predicted_conversion_likelihood || 0) > 0.7)).length > 0 && (
                    <li>• Prioritize follow-up with {(highValueLeads.length > 0 ? highValueLeads : leads.filter(lead => (lead.predicted_conversion_likelihood || 0) > 0.7)).length} high-value leads</li>
                  )}
                  {Object.keys(segmentDistribution).length > 0 && (
                    <li>• Tailor messaging for {Object.keys(segmentDistribution)[0]} segment (largest group)</li>
                  )}
                  {topArea && (
                    <li>• Consider targeted campaigns for {topArea[0]} area</li>
                  )}
                  <li>• ML model automatically updates predictions as lead data changes</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Optimization Tips</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Collect more demographic data to improve predictions</li>
                  <li>• Track interaction history for better lead scoring</li>
                  <li>• ML predictions update automatically when lead data changes</li>
                  <li>• Monitor actual vs predicted conversion rates for model accuracy</li>
                </ul>
              </div>
            </div>
            
            {buyerSegmentAnalytics.length > 0 && (
              <div className="mt-6 bg-teal-50 rounded-lg p-4 border border-teal-200">
                <h3 className="font-semibold text-teal-900 mb-2">Model Performance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {buyerSegmentAnalytics.slice(0, 3).map((segment, index) => (
                    <div key={index} className="text-sm text-teal-800">
                      <div className="font-medium">{segment.buyer_segment}</div>
                      <div>Predicted: {(segment.avg_conversion_likelihood * 100).toFixed(1)}%</div>
                      <div>Actual: {segment.actual_conversion_rate}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}