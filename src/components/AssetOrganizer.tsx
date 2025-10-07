import React, { useState } from 'react';
import { Upload, Image, Video, FileText, Plus, X, Check, Edit } from 'lucide-react';
import { Persona, CreativeAsset, AdCopy } from '../types';

interface AssetOrganizerProps {
  personas: Persona[];
  onUpdatePersonas: (personas: Persona[]) => void;
  onNext: () => void;
}

export function AssetOrganizer({ personas, onUpdatePersonas, onNext }: AssetOrganizerProps) {
  const [activePersona, setActivePersona] = useState(personas[0]?.id || '');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyForm, setCopyForm] = useState({ headline: '', description: '' });
  const [editingCopy, setEditingCopy] = useState<AdCopy | null>(null);

  const currentPersona = personas.find(p => p.id === activePersona);

  const handleFileUpload = (files: FileList | null, personaId: string) => {
    if (!files) return;

    const newAssets: CreativeAsset[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newAssets.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          file
        });
      }
    }

    const updatedPersonas = personas.map(persona =>
      persona.id === personaId
        ? { ...persona, assets: [...persona.assets, ...newAssets] }
        : persona
    );
    
    onUpdatePersonas(updatedPersonas);
    setShowAssetModal(false);
  };

  const removeAsset = (personaId: string, assetId: string) => {
    const updatedPersonas = personas.map(persona =>
      persona.id === personaId
        ? { ...persona, assets: persona.assets.filter(asset => asset.id !== assetId) }
        : persona
    );
    onUpdatePersonas(updatedPersonas);
  };

  const openCopyModal = (copy?: AdCopy) => {
    if (copy) {
      setEditingCopy(copy);
      setCopyForm({ headline: copy.headline, description: copy.description });
    } else {
      setEditingCopy(null);
      setCopyForm({ headline: '', description: '' });
    }
    setShowCopyModal(true);
  };

  const saveCopy = () => {
    if (!copyForm.headline.trim() || !copyForm.description.trim()) return;

    const updatedPersonas = personas.map(persona => {
      if (persona.id === activePersona) {
        if (editingCopy) {
          return {
            ...persona,
            ad_copy: persona.ad_copy.map(copy =>
              copy.id === editingCopy.id ? { ...copy, ...copyForm } : copy
            )
          };
        } else {
          return {
            ...persona,
            ad_copy: [...persona.ad_copy, {
              id: Date.now().toString(),
              headline: copyForm.headline.trim(),
              description: copyForm.description.trim()
            }]
          };
        }
      }
      return persona;
    });

    onUpdatePersonas(updatedPersonas);
    setShowCopyModal(false);
    setCopyForm({ headline: '', description: '' });
    setEditingCopy(null);
  };

  const removeCopy = (personaId: string, copyId: string) => {
    const updatedPersonas = personas.map(persona =>
      persona.id === personaId
        ? { ...persona, ad_copy: persona.ad_copy.filter(copy => copy.id !== copyId) }
        : persona
    );
    onUpdatePersonas(updatedPersonas);
  };

  const totalAssets = personas.reduce((sum, persona) => sum + persona.assets.length, 0);
  const totalCopy = personas.reduce((sum, persona) => sum + persona.ad_copy.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organize Campaign Assets</h1>
            <p className="text-gray-600">Upload creative assets and write ad copy for each persona</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-teal-600">{personas.length}</div>
              <div className="text-gray-600">Personas</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-blue-600">{totalAssets}</div>
              <div className="text-gray-600">Assets</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-md">
              <div className="text-2xl font-bold text-purple-600">{totalCopy}</div>
              <div className="text-gray-600">Ad Copies</div>
            </div>
          </div>

          {/* Persona Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setActivePersona(persona.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activePersona === persona.id
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  {persona.name}
                  <span className="ml-2 text-xs opacity-75">
                    {persona.assets.length + persona.ad_copy.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {currentPersona && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creative Assets */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Image className="w-5 h-5 mr-2 text-teal-600" />
                    Creative Assets
                  </h2>
                  <button
                    onClick={() => setShowAssetModal(true)}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentPersona.assets.map(asset => (
                    <div key={asset.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {asset.type.startsWith('image/') ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeAsset(currentPersona.id, asset.id)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="mt-2 text-sm text-gray-600 truncate">{asset.name}</p>
                    </div>
                  ))}
                  
                  {currentPersona.assets.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No assets uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ad Copy */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Ad Copy
                  </h2>
                  <button
                    onClick={() => openCopyModal()}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Copy
                  </button>
                </div>

                <div className="space-y-4">
                  {currentPersona.ad_copy.map(copy => (
                    <div key={copy.id} className="border border-gray-200 rounded-lg p-4 group relative">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openCopyModal(copy)}
                          className="p-1 text-gray-400 hover:text-blue-600 mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeCopy(currentPersona.id, copy.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 pr-16">{copy.headline}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{copy.description}</p>
                    </div>
                  ))}
                  
                  {currentPersona.ad_copy.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No ad copy created yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              Continue to Lead Management
            </button>
          </div>
        </div>
      </div>

      {/* Asset Upload Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upload Creative Assets</h2>
            </div>
            <div className="p-6">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files, activePersona)}
                className="hidden"
                id="asset-upload"
              />
              <label
                htmlFor="asset-upload"
                className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-teal-400 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Click to upload images or videos</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, MP4 supported</p>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAssetModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCopy ? 'Edit Ad Copy' : 'Create Ad Copy'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline *</label>
                <input
                  type="text"
                  value={copyForm.headline}
                  onChange={(e) => setCopyForm(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter compelling headline..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={copyForm.description}
                  onChange={(e) => setCopyForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Write your ad copy description..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCopy}
                disabled={!copyForm.headline.trim() || !copyForm.description.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2 inline" />
                {editingCopy ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}