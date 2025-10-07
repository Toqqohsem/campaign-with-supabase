import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, DollarSign, Target, Briefcase } from 'lucide-react';
import { ObjectiveType } from '../types';

interface CampaignWizardProps {
  onComplete: (data: {
    name: string;
    project: string;
    objective: ObjectiveType;
    budget: number;
    startDate: string;
    endDate: string;
  }) => void;
  onBack: () => void;
}

const projects = [
  'Ampang Heights Residences',
  'KLCC Premium Suites',
  'Mont Kiara Gardens',
  'Petaling Jaya Executive',
  'Shah Alam Family Homes'
];

const objectives: ObjectiveType[] = [
  'Generate New Leads',
  'Drive Event Traffic',
  'Promote a Special Offer'
];

export function CampaignWizard({ onComplete, onBack }: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    objective: '' as ObjectiveType,
    budget: '',
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
      if (!formData.project) newErrors.project = 'Project selection is required';
      if (!formData.objective) newErrors.objective = 'Objective selection is required';
    }

    if (currentStep === 2) {
      if (!formData.budget || Number(formData.budget) <= 0) {
        newErrors.budget = 'Budget must be greater than 0';
      }
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 2) {
        onComplete({
          ...formData,
          objective: formData.objective as ObjectiveType,
          budget: Number(formData.budget),
          start_date: formData.startDate,
          end_date: formData.endDate
        });
      } else {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
            <p className="text-gray-600">Set up your campaign in just a few simple steps</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2 space-x-20">
              <span className={`text-sm ${step >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                Campaign Details
              </span>
              <span className={`text-sm ${step >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                Budget & Dates
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Details</h2>
                
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your campaign name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Select a Project *
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => updateField('project', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.project ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Choose a project...</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                  {errors.project && <p className="text-red-500 text-sm mt-1">{errors.project}</p>}
                </div>

                {/* Objective Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-1" />
                    Choose an Objective *
                  </label>
                  <select
                    value={formData.objective}
                    onChange={(e) => updateField('objective', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.objective ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your objective...</option>
                    {objectives.map(objective => (
                      <option key={objective} value={objective}>{objective}</option>
                    ))}
                  </select>
                  {errors.objective && <p className="text-red-500 text-sm mt-1">{errors.objective}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget & Timeline</h2>
                
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget (RM) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.budget}
                    onChange={(e) => updateField('budget', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="10000"
                  />
                  {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Back' : 'Previous'}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {step === 2 ? 'Create Campaign' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}