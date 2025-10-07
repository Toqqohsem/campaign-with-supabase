import React, { useState } from 'react';
import { Upload, Users, TrendingUp, X, Download, RefreshCw, Edit, User, Home, Activity } from 'lucide-react';
import { Lead, Persona } from '../types';

interface LeadTaggerProps {
  leads: Lead[];
  personas: Persona[];
  onUpdateLeads: (leads: Lead[]) => void;
  onTriggerPrediction?: (leadId: string) => Promise<void>;
  onNext: () => void;
}

const statusOptions: Lead['status'][] = ['New', 'Contacted', 'Site Visit', 'Hot', 'Converted', 'Rejected'];
const rejectionReasons: NonNullable<Lead['rejectionReason']>[] = ['Price', 'Location', 'Layout', 'Not Responsive'];

export function LeadTagger({ leads, personas, onUpdateLeads, onTriggerPrediction, onNext }: LeadTaggerProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Helper function to find column index by matching common variations
    const findColumnIndex = (headers: string[], patterns: string[]): number => {
      return headers.findIndex(header => {
        const normalizedHeader = header.toLowerCase().trim();
        return patterns.some(pattern => normalizedHeader.includes(pattern));
      });
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV file must contain at least a header row and one data row');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Define patterns for each field type
      const namePatterns = ['name', 'full name', 'fullname', 'customer name', 'client name', 'lead name'];
      const emailPatterns = ['email', 'e-mail', 'email address', 'contact email', 'mail'];
      const phonePatterns = ['phone', 'telephone', 'mobile', 'contact', 'contact number', 'phone number', 'tel', 'cell'];
      
      const nameIndex = findColumnIndex(headers, namePatterns);
      const emailIndex = findColumnIndex(headers, emailPatterns);
      const phoneIndex = findColumnIndex(headers, phonePatterns);
      
      // Validate that we found at least the name column
      if (nameIndex === -1) {
        alert('Could not find a name column. Please ensure your CSV has a column with "name" in the header.');
        return;
      }

      const newLeads: Lead[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, '')); // Remove quotes
        return {
          id: `lead-${Date.now()}-${index}`,
          name: (nameIndex !== -1 ? values[nameIndex] : '') || `Lead ${index + 1}`,
          email: (emailIndex !== -1 ? values[emailIndex] : '') || '',
          phone: (phoneIndex !== -1 ? values[phoneIndex] : '') || '',
          status: 'New',
        };
      }).filter(lead => lead.name.trim() !== ''); // Filter out empty rows

      onUpdateLeads([...leads, ...newLeads]);
      setShowUploadModal(false);
      
      // Show success message with details
      const successMessage = `Successfully imported ${newLeads.length} leads.\n` +
        `Found columns: ${nameIndex !== -1 ? '✓ Name' : '✗ Name'}, ` +
        `${emailIndex !== -1 ? '✓ Email' : '✗ Email'}, ` +
        `${phoneIndex !== -1 ? '✓ Phone' : '✗ Phone'}`;
      alert(successMessage);
    };
    reader.readAsText(file);
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, ...updates } : lead
    );
    onUpdateLeads(updatedLeads);
  };

  const removeLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to remove this lead?')) {
      onUpdateLeads(leads.filter(lead => lead.id !== leadId));
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      'New': 'bg-gray-100 text-gray-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'Site Visit': 'bg-yellow-100 text-yellow-800',
      'Hot': 'bg-orange-100 text-orange-800',
      'Converted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const statusCounts = statusOptions.reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const conversionRate = leads.length > 0 ? ((statusCounts.Converted || 0) / leads.length * 100).toFixed(1) : '0';

  const openLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setShowLeadModal(true);
  };

  const closeLeadModal = () => {
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const updateLeadDetails = (updates: Partial<Lead>) => {
    if (!editingLead) return;
    
    const updatedLeads = leads.map(lead =>
      lead.id === editingLead.id ? { ...lead, ...updates } : lead
    );
    onUpdateLeads(updatedLeads);
    setEditingLead({ ...editingLead, ...updates });
    
    // Trigger ML prediction if demographic or preference data changed
    if (onTriggerPrediction && (updates.demographics || updates.property_preferences || updates.interaction_history)) {
      onTriggerPrediction(editingLead.id).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
            <p className="text-gray-600">Track and tag leads to measure campaign effectiveness</p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-emerald-600">{leads.length}</div>
              <div className="text-gray-600 text-sm">Total Leads</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-green-600">{statusCounts.Converted || 0}</div>
              <div className="text-gray-600 text-sm">Converted</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.Hot || 0}</div>
              <div className="text-gray-600 text-sm">Hot Leads</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.Contacted || 0}</div>
              <div className="text-gray-600 text-sm">Contacted</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-red-600">{statusCounts.Rejected || 0}</div>
              <div className="text-gray-600 text-sm">Rejected</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-teal-600">{conversionRate}%</div>
              <div className="text-gray-600 text-sm">Conversion</div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg min-w-fit"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Leads (CSV)
            </button>
            <div className="flex items-center space-x-4 min-w-fit">
              <div className="flex items-center text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm hidden sm:inline">Campaign Performance Tracking</span>
                <span className="text-sm sm:hidden">Performance</span>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lead</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyer Segment</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Conversion Score</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Persona</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rejection Reason</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">ID: {lead.id.slice(-8)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{lead.email}</div>
                            <div className="text-gray-500">{lead.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLead(lead.id, { 
                              status: e.target.value as Lead['status'],
                              rejection_reason: e.target.value !== 'Rejected' ? undefined : lead.rejection_reason
                            })}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-emerald-500 ${getStatusColor(lead.status)}`}
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {lead.buyer_segment ? (
                              <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                                {lead.buyer_segment}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Not classified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {lead.predicted_conversion_likelihood ? (
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${lead.predicted_conversion_likelihood * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">
                                  {(lead.predicted_conversion_likelihood * 100).toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Not scored</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={lead.assigned_persona || ''}
                            onChange={(e) => updateLead(lead.id, { assigned_persona: e.target.value || undefined })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select persona...</option>
                            {personas.map(persona => (
                              <option key={persona.id} value={persona.name}>{persona.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {lead.status === 'Rejected' ? (
                            <select
                              value={lead.rejection_reason || ''}
                              onChange={(e) => updateLead(lead.id, { rejection_reason: e.target.value as Lead['rejectionReason'] })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select reason...</option>
                              {rejectionReasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openLeadModal(lead)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit lead details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {onTriggerPrediction && (
                              <button
                                onClick={() => onTriggerPrediction(lead.id)}
                                className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                                title="Trigger ML prediction"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeLead(lead.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove lead"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads uploaded yet</h3>
                <p className="text-gray-600 mb-6">Upload a CSV file with your campaign leads to start tracking</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Upload Leads
                </button>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              Complete Campaign Setup
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upload Leads CSV</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-3">
                  Upload a CSV file with lead information. The system will automatically detect columns for Name, Email, and Phone.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <strong>Example format:</strong><br />
                  Name,Email,Phone<br />
                  John Doe, john@example.com, +60123456789<br />
                  Jane Smith, jane@example.com, +60198765432<br /><br />
                  <strong>Supported column names:</strong><br />
                  • Name: "Name", "Full Name", "Customer Name", "Lead Name"<br />
                  • Email: "Email", "Email Address", "Contact Email", "Mail"<br />
                  • Phone: "Phone", "Mobile", "Contact Number", "Telephone"
                </div>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload CSV file</p>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lead Details - {editingLead.name}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Demographics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Demographics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                      <select
                        value={editingLead.demographics?.age_range || ''}
                        onChange={(e) => updateLeadDetails({
                          demographics: { ...editingLead.demographics, age_range: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select age range</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-45">36-45</option>
                        <option value="46-55">46-55</option>
                        <option value="56-65">56-65</option>
                        <option value="65+">65+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Income Bracket</label>
                      <select
                        value={editingLead.demographics?.income_bracket || ''}
                        onChange={(e) => updateLeadDetails({
                          demographics: { ...editingLead.demographics, income_bracket: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select income bracket</option>
                        <option value="Below RM 5,000">Below RM 5,000</option>
                        <option value="RM 5,000 - RM 10,000">RM 5,000 - RM 10,000</option>
                        <option value="RM 10,000 - RM 20,000">RM 10,000 - RM 20,000</option>
                        <option value="RM 20,000 - RM 50,000">RM 20,000 - RM 50,000</option>
                        <option value="Above RM 50,000">Above RM 50,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editingLead.demographics?.family_size || ''}
                        onChange={(e) => updateLeadDetails({
                          demographics: { ...editingLead.demographics, family_size: parseInt(e.target.value) || undefined }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Number of family members"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Segment</label>
                      <select
                        value={editingLead.buyer_segment || ''}
                        onChange={(e) => updateLeadDetails({ buyer_segment: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                      >
                        <option value="">Select segment</option>
                        <option value="First-time Buyer">First-time Buyer</option>
                        <option value="Upgrader">Upgrader</option>
                        <option value="Investor">Investor</option>
                        <option value="Downsizer">Downsizer</option>
                        <option value="Luxury Buyer">Luxury Buyer</option>
                        <option value="Budget Conscious">Budget Conscious</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Property Preferences */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-green-600" />
                    Property Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editingLead.property_preferences?.bedrooms || ''}
                          onChange={(e) => updateLeadDetails({
                            property_preferences: { ...editingLead.property_preferences, bedrooms: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editingLead.property_preferences?.bathrooms || ''}
                          onChange={(e) => updateLeadDetails({
                            property_preferences: { ...editingLead.property_preferences, bathrooms: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Area</label>
                      <input
                        type="text"
                        value={editingLead.property_preferences?.location_area || ''}
                        onChange={(e) => updateLeadDetails({
                          property_preferences: { ...editingLead.property_preferences, location_area: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="e.g., Mont Kiara, KLCC"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (RM)</label>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={editingLead.property_preferences?.budget_min || ''}
                          onChange={(e) => updateLeadDetails({
                            property_preferences: { ...editingLead.property_preferences, budget_min: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (RM)</label>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={editingLead.property_preferences?.budget_max || ''}
                          onChange={(e) => updateLeadDetails({
                            property_preferences: { ...editingLead.property_preferences, budget_max: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Score</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={editingLead.predicted_conversion_likelihood || 0}
                          onChange={(e) => updateLeadDetails({
                            predicted_conversion_likelihood: parseFloat(e.target.value)
                          })}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">
                          {((editingLead.predicted_conversion_likelihood || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                {/* Interaction History */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-600" />
                    Recent Interactions
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editingLead.interaction_history && editingLead.interaction_history.length > 0 ? (
                      editingLead.interaction_history.map((interaction, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{interaction.type}</span>
                              {interaction.details && (
                                <p className="text-xs text-gray-600 mt-1">{interaction.details}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(interaction.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No interactions recorded</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newInteraction = {
                        type: 'Manual Entry',
                        timestamp: new Date().toISOString(),
                        details: 'Added via lead management',
                        channel: 'Manual'
                      };
                      updateLeadDetails({
                        interaction_history: [...(editingLead.interaction_history || []), newInteraction]
                      });
                    }}
                    className="w-full mt-3 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                  >
                    Add Interaction
                  </button>
                </div>
              </div>
            </div>
                </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeLeadModal}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}