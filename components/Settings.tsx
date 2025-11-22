
import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Icons } from '../constants';

interface SettingsProps {
    business: BusinessProfile;
    onUpdate: (updated: BusinessProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ business, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'ai_brain' | 'integrations' | 'payments' | 'backup'>('general');
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
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto">
                        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>General</button>
                        <button onClick={() => setActiveTab('ai_brain')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'ai_brain' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>AI Brain</button>
                        <button onClick={() => setActiveTab('integrations')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Integrations</button>
                        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'payments' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>Payments</button>
                        <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'backup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Data</button>
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
                                        <option value="Shona">Shona</option>
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
                                <label className="block text-slate-400 text-sm mb-2">Gemini API Key (BYOK)</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={formData.aiConfig?.apiKey || ''}
                                        onChange={e => handleAiConfigChange('apiKey', e.target.value)}
                                        placeholder="AIza..."
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono"
                                    />
                                    <div className="absolute right-3 top-3 text-xs text-slate-500">
                                        {formData.aiConfig?.apiKey ? 'Custom Key Active' : 'Using System Default'}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Leave empty to use our shared system key. Provide your own key for higher limits.
                                </p>
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
                    <div className="space-y-6">
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

                        {/* Facebook Ads Integration */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                <span className="ml-2">Facebook Ads</span>
                            </h3>

                            {!formData.facebookAdConfig?.connected ? (
                                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold mb-2">Connect Your Facebook Ad Account</h4>
                                            <p className="text-sm text-slate-400 mb-4">
                                                Publish Click-to-WhatsApp ads directly from Chat2Close to your Facebook/Instagram account.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const loginUrl = `/api/auth/facebook/login?businessId=${business.id}`;
                                                    const popup = window.open(loginUrl, 'facebook-auth', 'width=600,height=700');

                                                    // Listen for OAuth callback
                                                    window.addEventListener('message', (event) => {
                                                        if (event.data.type === 'FACEBOOK_AUTH_SUCCESS') {
                                                            const { accessToken, tokenExpiry, adAccounts } = event.data.data;

                                                            // Update business profile with Facebook config
                                                            const updatedBusiness = {
                                                                ...formData,
                                                                facebookAdConfig: {
                                                                    connected: true,
                                                                    accessToken,
                                                                    tokenExpiry,
                                                                    adAccountId: adAccounts[0]?.id,
                                                                    adAccountName: adAccounts[0]?.name,
                                                                }
                                                            };

                                                            setFormData(updatedBusiness);
                                                            onUpdate(updatedBusiness);
                                                            popup?.close();
                                                        }
                                                    });
                                                }}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                Connect Facebook
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-green-400 text-xl">✓</span>
                                                <h4 className="text-white font-bold">Connected</h4>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-1">
                                                <strong>Ad Account:</strong> {formData.facebookAdConfig.adAccountName || formData.facebookAdConfig.adAccountId}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Token expires: {new Date(formData.facebookAdConfig.tokenExpiry || 0).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to disconnect Facebook Ads?')) {
                                                    const updatedBusiness = {
                                                        ...formData,
                                                        facebookAdConfig: { connected: false }
                                                    };
                                                    setFormData(updatedBusiness);
                                                    onUpdate(updatedBusiness);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        {/* Info Banner */}
                        <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💳</span>
                                <div>
                                    <h4 className="text-white font-bold mb-1">African Payment Gateways</h4>
                                    <p className="text-sm text-slate-300">
                                        Configure payment gateways for your Nigerian and Zimbabwean customers. Enable the gateways you want to use and add your API credentials.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Paystack - Nigeria */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🇳🇬</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Paystack</h3>
                                        <p className="text-xs text-slate-400">Nigeria's #1 payment gateway • Cards, Bank Transfer, USSD</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentGateways?.paystack?.enabled || false}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            paymentGateways: {
                                                ...prev.paymentGateways,
                                                paystack: {
                                                    ...prev.paymentGateways?.paystack,
                                                    enabled: e.target.checked,
                                                    publicKey: prev.paymentGateways?.paystack?.publicKey || '',
                                                    secretKey: prev.paymentGateways?.paystack?.secretKey || '',
                                                }
                                            }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {formData.paymentGateways?.paystack?.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Public Key</label>
                                        <input
                                            type="text"
                                            value={formData.paymentGateways?.paystack?.publicKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    paystack: { ...prev.paymentGateways?.paystack!, publicKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="pk_test_..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Secret Key</label>
                                        <input
                                            type="password"
                                            value={formData.paymentGateways?.paystack?.secretKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    paystack: { ...prev.paymentGateways?.paystack!, secretKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="sk_test_..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            Get your API keys from <a href="https://dashboard.paystack.com/#/settings/developers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Paystack Dashboard</a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Flutterwave - Pan-African */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🌍</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Flutterwave</h3>
                                        <p className="text-xs text-slate-400">Pan-African • 150+ currencies • International payments</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentGateways?.flutterwave?.enabled || false}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            paymentGateways: {
                                                ...prev.paymentGateways,
                                                flutterwave: {
                                                    ...prev.paymentGateways?.flutterwave,
                                                    enabled: e.target.checked,
                                                    publicKey: prev.paymentGateways?.flutterwave?.publicKey || '',
                                                    secretKey: prev.paymentGateways?.flutterwave?.secretKey || '',
                                                }
                                            }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {formData.paymentGateways?.flutterwave?.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Public Key</label>
                                        <input
                                            type="text"
                                            value={formData.paymentGateways?.flutterwave?.publicKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    flutterwave: { ...prev.paymentGateways?.flutterwave!, publicKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="FLWPUBK_TEST-..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-orange-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Secret Key</label>
                                        <input
                                            type="password"
                                            value={formData.paymentGateways?.flutterwave?.secretKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    flutterwave: { ...prev.paymentGateways?.flutterwave!, secretKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="FLWSECK_TEST-..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-orange-500 font-mono"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            Get your API keys from <a href="https://dashboard.flutterwave.com/settings/apis" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Flutterwave Dashboard</a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Paynow - Zimbabwe */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">🇿🇼</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Paynow</h3>
                                        <p className="text-xs text-slate-400">Zimbabwe's leading gateway • EcoCash, Visa, Mastercard</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentGateways?.paynow?.enabled || false}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            paymentGateways: {
                                                ...prev.paymentGateways,
                                                paynow: {
                                                    ...prev.paymentGateways?.paynow,
                                                    enabled: e.target.checked,
                                                    integrationId: prev.paymentGateways?.paynow?.integrationId || '',
                                                    integrationKey: prev.paymentGateways?.paynow?.integrationKey || '',
                                                }
                                            }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {formData.paymentGateways?.paynow?.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Integration ID</label>
                                        <input
                                            type="text"
                                            value={formData.paymentGateways?.paynow?.integrationId || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    paynow: { ...prev.paymentGateways?.paynow!, integrationId: e.target.value }
                                                }
                                            }))}
                                            placeholder="12345"
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-green-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Integration Key</label>
                                        <input
                                            type="password"
                                            value={formData.paymentGateways?.paynow?.integrationKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    paynow: { ...prev.paymentGateways?.paynow!, integrationKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-green-500 font-mono"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            Get your credentials from <a href="https://www.paynow.co.zw/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Paynow Merchant Portal</a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EcoCash - Zimbabwe */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📱</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">EcoCash</h3>
                                        <p className="text-xs text-slate-400">Zimbabwe's #1 mobile money • 70%+ market share</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.paymentGateways?.ecocash?.enabled || false}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            paymentGateways: {
                                                ...prev.paymentGateways,
                                                ecocash: {
                                                    ...prev.paymentGateways?.ecocash,
                                                    enabled: e.target.checked,
                                                    merchantCode: prev.paymentGateways?.ecocash?.merchantCode || '',
                                                    merchantKey: prev.paymentGateways?.ecocash?.merchantKey || '',
                                                }
                                            }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {formData.paymentGateways?.ecocash?.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Merchant Code</label>
                                        <input
                                            type="text"
                                            value={formData.paymentGateways?.ecocash?.merchantCode || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    ecocash: { ...prev.paymentGateways?.ecocash!, merchantCode: e.target.value }
                                                }
                                            }))}
                                            placeholder="MERCHANT123"
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-red-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Merchant Key</label>
                                        <input
                                            type="password"
                                            value={formData.paymentGateways?.ecocash?.merchantKey || ''}
                                            onChange={e => setFormData(prev => ({
                                                ...prev,
                                                paymentGateways: {
                                                    ...prev.paymentGateways,
                                                    ecocash: { ...prev.paymentGateways?.ecocash!, merchantKey: e.target.value }
                                                }
                                            }))}
                                            placeholder="xxxxxxxxxxxxxxxx"
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-red-500 font-mono"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-slate-500">
                                            Apply for merchant account at <a href="https://www.ecocash.co.zw/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">EcoCash Business</a>
                                        </p>
                                    </div>
                                </div>
                            )}
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
        </div >
    );
};

export default Settings;
