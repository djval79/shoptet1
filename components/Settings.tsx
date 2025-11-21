
import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Icons } from '../constants';

interface SettingsProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ business, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai_brain' | 'integrations' | 'backup'>('general');
  const [formData, setFormData] = useState({ ...business });
  const [isSaved, setIsSaved] = useState(false);
  const [newIceBreaker, setNewIceBreaker] = useState('');

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };
  
  const handleAiConfigChange = (field: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          aiConfig: {
              ...prev.aiConfig,
              [field]: value
          } as any
      }));
  };

  const handleHoursChange = (field: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          businessHours: {
              ...prev.businessHours,
              [field]: value
          } as any
      }));
  };
  
  const toggleClosedDay = (dayIndex: number) => {
      const current = formData.businessHours?.closedDays || [];
      if (current.includes(dayIndex)) {
          handleHoursChange('closedDays', current.filter(d => d !== dayIndex));
      } else {
          handleHoursChange('closedDays', [...current, dayIndex]);
      }
  };

  const handleVoiceChange = (field: 'rate' | 'pitch' | 'gender', value: any) => {
      setFormData(prev => ({
          ...prev,
          voiceSettings: {
              ...prev.voiceSettings,
              [field]: value
          } as any
      }));
  };

  const addIceBreaker = () => {
      if (!newIceBreaker || (formData.iceBreakers || []).length >= 4) return;
      const updated = [...(formData.iceBreakers || []), newIceBreaker];
      setFormData(prev => ({ ...prev, iceBreakers: updated }));
      setNewIceBreaker('');
  };

  const removeIceBreaker = (index: number) => {
      const updated = (formData.iceBreakers || []).filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, iceBreakers: updated }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const exportData = () => {
      const dataStr = JSON.stringify(business, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `business_profile_${business.id}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const imported = JSON.parse(event.target?.result as string);
              if (imported.id && imported.name) {
                  onUpdate(imported);
                  setFormData(imported);
                  alert('Data restored successfully!');
              } else {
                  alert('Invalid file format.');
              }
          } catch (err) {
              alert('Error parsing JSON file.');
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
            <h2 className="text-2xl font-bold text-white">Settings & Configuration</h2>
            <p className="text-slate-400">Manage your store identity, AI policies, and integrations.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>General</button>
                 <button onClick={() => setActiveTab('ai_brain')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ai_brain' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>AI Brain</button>
                 <button onClick={() => setActiveTab('integrations')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Integrations</button>
                 <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'backup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Data</button>
            </div>
            <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center transition-all"
            >
                {isSaved ? (
                    <>
                        <span className="mr-2 text-xl">✓</span> Saved
                    </>
                ) : (
                    'Save Changes'
                )}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'general' && (
             <div className="space-y-8">
                {/* Section 1: General */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Icons.Store /> <span className="ml-2">General Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Business Name</label>
                            <input 
                                value={formData.name} 
                                onChange={e => handleChange('name', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Industry</label>
                            <input 
                                value={formData.industry} 
                                onChange={e => handleChange('industry', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-400 text-sm mb-2">Description</label>
                            <textarea 
                                value={formData.description} 
                                onChange={e => handleChange('description', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                rows={2}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-400 text-sm mb-2">Welcome Message</label>
                            <textarea 
                                value={formData.welcomeMessage} 
                                onChange={e => handleChange('welcomeMessage', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                rows={2}
                            />
                        </div>
                    </div>
                    
                    {/* Ice Breakers */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <label className="block text-slate-400 text-sm mb-3">Ice Breakers (Conversation Starters)</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                value={newIceBreaker}
                                onChange={e => setNewIceBreaker(e.target.value)}
                                placeholder="e.g. What are your opening hours?"
                                className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                onKeyDown={e => e.key === 'Enter' && addIceBreaker()}
                            />
                            <button 
                                onClick={addIceBreaker}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded"
                                disabled={(formData.iceBreakers || []).length >= 4}
                            >
                                <Icons.Plus />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(formData.iceBreakers || []).map((ib, i) => (
                                <div key={i} className="bg-slate-900 border border-slate-600 px-3 py-1.5 rounded-full flex items-center text-xs text-slate-300">
                                    <span>{ib}</span>
                                    <button onClick={() => removeIceBreaker(i)} className="ml-2 text-slate-500 hover:text-red-400">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section: Operating Hours & Delivery */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Icons.Clock /> <span className="ml-2">Operating Hours & Delivery</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-slate-400 text-sm">Enable Business Hours</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.businessHours?.enabled || false} 
                                        onChange={e => handleHoursChange('enabled', e.target.checked)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            
                            <div className={`space-y-4 ${!formData.businessHours?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Opens At</label>
                                        <input 
                                            type="time" 
                                            value={formData.businessHours?.opensAt || '09:00'}
                                            onChange={e => handleHoursChange('opensAt', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Closes At</label>
                                        <input 
                                            type="time" 
                                            value={formData.businessHours?.closesAt || '17:00'}
                                            onChange={e => handleHoursChange('closesAt', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs text-slate-500 mb-2">Closed Days</label>
                                    <div className="flex gap-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => toggleClosedDay(i)}
                                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${formData.businessHours?.closedDays?.includes(i) ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 'bg-green-900/30 text-green-400 border border-green-500/30'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-l border-slate-700 pl-8">
                            <label className="block text-slate-400 text-sm mb-4">Delivery Radius (km)</label>
                            <div className="flex items-center space-x-4">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="50" 
                                    value={formData.deliveryRadius || 0}
                                    onChange={e => handleChange('deliveryRadius', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-white font-mono w-12 text-right">{formData.deliveryRadius}km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Localization */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <span className="mr-2 text-lg">🌍</span> Localization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">AI Agent Language</label>
                            <select 
                                value={formData.language || 'English'} 
                                onChange={e => handleChange('language', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Currency Symbol</label>
                            <select 
                                value={formData.currencySymbol || '$'} 
                                onChange={e => handleChange('currencySymbol', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="$">$ (USD)</option>
                                <option value="€">€ (EUR)</option>
                                <option value="£">£ (GBP)</option>
                                <option value="R$">R$ (BRL)</option>
                            </select>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'ai_brain' && (
            <div className="space-y-8">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Icons.Users /> <span className="ml-2">AI Model Configuration</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Model</label>
                            <select 
                                value={formData.aiConfig?.model || 'gemini-2.5-flash'} 
                                onChange={e => handleAiConfigChange('model', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest & Cheapest)</option>
                                <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Best Reasoning)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Creativity (Temperature)</label>
                            <div className="flex items-center space-x-4">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1"
                                    value={formData.aiConfig?.temperature || 0.7}
                                    onChange={e => handleAiConfigChange('temperature', parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <span className="text-white font-mono w-12 text-right">{formData.aiConfig?.temperature}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">0.0 = Deterministic, 1.0 = Creative.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-slate-400 text-sm mb-2 flex justify-between">
                            <span>System Prompt (Advanced)</span>
                            <span className="text-xs text-blue-400">Supports {'{{business_name}}'}, {'{{industry}}'}, {'{{policies}}'}</span>
                        </label>
                        <div className="bg-slate-900 rounded-lg border border-slate-600 p-0 overflow-hidden font-mono text-sm">
                            <textarea 
                                value={formData.aiConfig?.customPrompt || ''} 
                                onChange={e => handleAiConfigChange('customPrompt', e.target.value)}
                                className="w-full bg-transparent text-green-400 p-4 outline-none min-h-[300px]"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            This is the raw instruction set sent to the AI. Be careful editing this.
                        </p>
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                        <h4 className="text-white font-bold mb-4 text-sm">Knowledge & Policies</h4>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">
                                    Store Policies & Rules <span className="text-red-400">*</span>
                                </label>
                                <textarea 
                                    value={formData.policies || ''} 
                                    onChange={e => handleChange('policies', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
                                    rows={4}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">
                                    Knowledge Base (Context)
                                </label>
                                <textarea 
                                    value={formData.knowledgeBase || ''} 
                                    onChange={e => handleChange('knowledgeBase', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono text-xs"
                                    rows={6}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Voice Settings */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Icons.Phone /> <span className="ml-2">Voice Personality (TTS)</span>
                    </h3>
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <label className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Speaking Rate</span>
                                <span>{formData.voiceSettings?.rate || 1.0}x</span>
                            </label>
                            <input 
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={formData.voiceSettings?.rate || 1.0}
                                onChange={e => handleVoiceChange('rate', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Pitch</span>
                                <span>{formData.voiceSettings?.pitch || 1.0}</span>
                            </label>
                            <input 
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={formData.voiceSettings?.pitch || 1.0}
                                onChange={e => handleVoiceChange('pitch', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'integrations' && (
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Icons.Settings /> <span className="ml-2">Twilio API Credentials</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Account SID</label>
                        <input 
                            type="text"
                            value={formData.twilioAccountSid || ''} 
                            onChange={e => handleChange('twilioAccountSid', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Auth Token</label>
                        <input 
                            type="password"
                            value={formData.twilioAuthToken || ''} 
                            onChange={e => handleChange('twilioAuthToken', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-slate-400 text-sm mb-2">Messaging Service SID</label>
                        <input 
                            type="text"
                            value={formData.twilioMessagingServiceSid || ''} 
                            onChange={e => handleChange('twilioMessagingServiceSid', e.target.value)}
                            placeholder="MG..."
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional: Used for pooling multiple senders.</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'backup' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Icons.HardDrive /> <span className="ml-2">Data & Backup</span>
                </h3>
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">Export Configuration</h4>
                        <p className="text-xs text-slate-400 mt-1">Download a JSON snapshot of your business profile, products, and settings.</p>
                    </div>
                    <button onClick={exportData} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm flex items-center">
                        <Icons.Download /> <span className="ml-2">Export JSON</span>
                    </button>
                </div>
                <div className="border-t border-slate-700 my-4 pt-4 flex items-center justify-between space-x-4">
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">Restore / Import</h4>
                        <p className="text-xs text-slate-400 mt-1">Overwrite current settings with a backup file.</p>
                    </div>
                    <label className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm flex items-center cursor-pointer">
                        <input type="file" accept=".json" className="hidden" onChange={importData} />
                        <span className="mr-2">📂</span> Restore from File
                    </label>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
