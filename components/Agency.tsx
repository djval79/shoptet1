
import React, { useState } from 'react';
import { BusinessProfile, AgencySettings, SubscriptionPlan } from '../types';
import { DEFAULT_AGENCY_SETTINGS, Icons } from '../constants';

interface AgencyProps {
    businesses: BusinessProfile[];
    settings: AgencySettings;
    onUpdateSettings: (settings: AgencySettings) => void;
}

const Agency: React.FC<AgencyProps> = ({ businesses, settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'plans'>('overview');
    const [formData, setFormData] = useState<AgencySettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    const calculateAgencyRevenue = () => {
        return businesses.reduce((total, biz) => {
            // Mock logic: Agency gets 20% of the plan price + flat $10
            const planPrice = formData.plans[biz.subscriptionPlan || 'starter']?.price || 49;
            return total + planPrice;
        }, 0);
    };

    const handleSave = () => {
        onUpdateSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handlePlanUpdate = (key: 'starter' | 'growth' | 'enterprise', field: keyof SubscriptionPlan, value: any) => {
        setFormData({
            ...formData,
            plans: {
                ...formData.plans,
                [key]: {
                    ...formData.plans[key],
                    [field]: value
                }
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Agency Command Center</h2>
                    <p className="text-slate-400">Manage your SaaS platform, white-label settings, and client revenue.</p>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {['overview', 'branding', 'plans'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">

                {activeTab === 'overview' && (
                    <div className="p-6 flex flex-col h-full">
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-blue-500/30 p-6 rounded-xl">
                                <p className="text-blue-300 text-xs font-bold uppercase mb-1">Total MRR</p>
                                <h3 className="text-3xl font-bold text-white">${calculateAgencyRevenue().toLocaleString()}</h3>
                                <span className="text-xs text-slate-400">Monthly Recurring Revenue</span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-600 p-6 rounded-xl">
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Clients</p>
                                <h3 className="text-3xl font-bold text-white">{businesses.length}</h3>
                                <span className="text-xs text-green-400">+2 this week</span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-600 p-6 rounded-xl">
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg. Revenue Per User</p>
                                <h3 className="text-3xl font-bold text-white">${(calculateAgencyRevenue() / (businesses.length || 1)).toFixed(0)}</h3>
                            </div>
                        </div>

                        <h3 className="text-white font-bold mb-4">Client Roster</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="p-4">Business Name</th>
                                        <th className="p-4">Industry</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Usage (AI)</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {businesses.map(biz => (
                                        <tr key={biz.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-white">{biz.name}</td>
                                            <td className="p-4 text-slate-400">{biz.industry}</td>
                                            <td className="p-4">
                                                <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${biz.subscriptionPlan === 'enterprise' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                        biz.subscriptionPlan === 'growth' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                            'bg-slate-600/20 text-slate-400 border-slate-600/30'
                                                    }`}>
                                                    {biz.subscriptionPlan || 'starter'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between">
                                                        <span>{Math.floor(Math.random() * 80)}%</span>
                                                        <span className="text-slate-500">of limit</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${Math.floor(Math.random() * 80)}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center text-xs ${biz.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${biz.revenue >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                    {biz.revenue >= 0 ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-xs bg-red-900/30 text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-900/50 transition-colors">
                                                    Suspend
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div className="p-8 max-w-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">White Label Settings</h3>
                                <p className="text-slate-400 text-sm">Customize how the platform looks to your clients.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center transition-all"
                            >
                                {isSaved ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-600">
                                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Identity</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold mb-2">Platform Name</label>
                                        <input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1">Appears in the sidebar header and browser tab.</p>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold mb-2">Accent Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                value={formData.primaryColor}
                                                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                                            />
                                            <span className="text-white font-mono text-sm">{formData.primaryColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-600">
                                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Live Preview</h4>
                                <div className="flex h-32 rounded-lg overflow-hidden border border-slate-700">
                                    <div className="w-48 bg-slate-900 border-r border-slate-800 p-4 flex flex-col">
                                        <h1 className="font-bold text-lg" style={{ color: formData.primaryColor }}>{formData.name}</h1>
                                        <div className="mt-4 space-y-2">
                                            <div className="h-2 w-20 bg-slate-700 rounded"></div>
                                            <div className="h-2 w-24 bg-slate-700 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-[#0f172a] p-4">
                                        <div className="bg-slate-800 h-full w-full rounded border border-slate-700"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Subscription Plan Editor</h3>
                                <p className="text-slate-400 text-sm">Define what you charge your customers.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
                            >
                                {isSaved ? 'Saved!' : 'Update Pricing'}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {(Object.entries(formData.plans) as [string, SubscriptionPlan][]).map(([key, plan]) => (
                                <div key={key} className="bg-slate-900 border border-slate-600 rounded-xl p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white font-bold capitalize">{plan.name}</h4>
                                        {key === 'growth' && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded">Popular</span>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-slate-400 text-xs mb-1">Monthly Price</label>
                                        <div className="flex items-center">
                                            <span className="text-slate-500 mr-2">$</span>
                                            <input
                                                type="number"
                                                value={plan.price}
                                                onChange={e => handlePlanUpdate(key as any, 'price', parseInt(e.target.value))}
                                                className="w-24 bg-slate-800 border border-slate-600 rounded p-1 text-white font-bold text-lg outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-slate-400 text-xs mb-2">Features List</label>
                                        <textarea
                                            value={plan.features.join('\n')}
                                            onChange={e => handlePlanUpdate(key as any, 'features', e.target.value.split('\n'))}
                                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-300 text-xs h-32 outline-none focus:border-blue-500"
                                            placeholder="One feature per line"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Agency;
