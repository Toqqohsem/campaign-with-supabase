import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Persona } from '../types';

interface PersonaCreatorProps {
  personas: Persona[];
  onUpdatePersonas: (personas: Persona[]) => void;
  onNext: () => void;
}

export function PersonaCreator({ personas, onUpdatePersonas, onNext }: PersonaCreatorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    motivations: '',
    painPoints: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openModal = (persona?: Persona) => {
    if (persona) {
      setEditingPersona(persona);
      setFormData({
        name: persona.name,
        motivations: persona.motivations,
        painPoints: persona.pain_points
      });
    } else {
      setEditingPersona(null);
      setFormData({
        name: '',
        motivations: '',
        painPoints: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPersona(null);
    setFormData({ name: '', motivations: '', painPoints: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Persona name is required';
    }
    if (!formData.motivations.trim()) {
      newErrors.motivations = 'Key motivations are required';
    }
    if (!formData.painPoints.trim()) {
      newErrors.painPoints = 'Pain points are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingPersona) {
      const updatedPersonas = personas.map(persona =>
        persona.id === editingPersona.id
          ? { ...persona, ...formData }
          : persona
      );
      onUpdatePersonas(updatedPersonas);
    } else {
      const newPersona: Persona = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        motivations: formData.motivations.trim(),
        pain_points: formData.painPoints.trim(),
        assets: [],
        ad_copy: []
      };
      onUpdatePersonas([...personas, newPersona]);
    }
    closeModal();
  };

  const handleDelete = (personaId: string) => {
    if (window.confirm('Are you sure you want to delete this persona?')) {
      onUpdatePersonas(personas.filter(persona => persona.id !== personaId));
    }
  };

  const canAddMore = personas.length < 3;
  const canProceed = personas.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Define Your Target Personas</h1>
            <p className="text-gray-600">Create 2-3 detailed personas to guide your campaign strategy</p>
          </div>

          {/* Status Banner */}
          <div className={`mb-8 p-4 rounded-lg border ${
            canProceed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              {canProceed ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              )}
              <div>
                <p className={`font-semibold ${canProceed ? 'text-green-800' : 'text-yellow-800'}`}>
                  {canProceed ? 'Ready to proceed!' : 'Minimum 2 personas required'}
                </p>
                <p className={`text-sm ${canProceed ? 'text-green-700' : 'text-yellow-700'}`}>
                  You have {personas.length} of 2-3 personas defined
                </p>
              </div>
            </div>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {personas.map((persona) => (
              <div key={persona.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{persona.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(persona)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Key Motivations</h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {persona.motivations}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Pain Points</h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {persona.pain_points}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{persona.assets.length} assets</span>
                    <span>{persona.ad_copy.length} ad copies</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Persona Card */}
            {canAddMore && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                <button
                  onClick={() => openModal()}
                  className="w-full h-full p-6 flex flex-col items-center justify-center text-gray-500 hover:text-purple-600 transition-colors min-h-[280px]"
                >
                  <Plus className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Add New Persona</h3>
                  <p className="text-sm text-center">
                    Create a detailed persona to target your campaign messaging
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Asset Organization
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPersona ? 'Edit Persona' : 'Create New Persona'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Persona Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., The Ampang Upgraders"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Key Motivations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Motivations *
                </label>
                <textarea
                  value={formData.motivations}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivations: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                    errors.motivations ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="• Looking for more space for growing family
• Want to upgrade to premium location
• Seeking better investment opportunities
• ..."
                />
                {errors.motivations && <p className="text-red-500 text-sm mt-1">{errors.motivations}</p>}
                <p className="text-gray-500 text-sm mt-1">Use bullet points to list key motivations</p>
              </div>

              {/* Pain Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Points *
                </label>
                <textarea
                  value={formData.painPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                    errors.painPoints ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="• Current home too small for family needs
• Worried about property appreciation
• Difficulty finding quality properties
• ..."
                />
                {errors.painPoints && <p className="text-red-500 text-sm mt-1">{errors.painPoints}</p>}
                <p className="text-gray-500 text-sm mt-1">Use bullet points to list pain points</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingPersona ? 'Update Persona' : 'Create Persona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}