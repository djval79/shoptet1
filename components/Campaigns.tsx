
import React, { useState } from 'react';
import { BusinessProfile, Campaign, Customer } from '../types';
import { generateMarketingCopy } from '../services/geminiService';
import { Icons } from '../constants';

interface CampaignsProps {
  business: BusinessProfile;
  campaigns: Campaign[];
  customers: Customer[];
  onUpdateCampaigns: (campaigns: Campaign[]) => void;
  onLaunch?: (campaign: Campaign) => void;
}

const Campaigns: React.FC<CampaignsProps> = ({ business, campaigns, customers, onUpdateCampaigns, onLaunch }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [campName, setCampName] = useState('');
  const [audience, setAudience] = useState('All Customers');
  const [topic, setTopic] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currency = business.currencySymbol || '$';

  const getAudienceCount = () => {
      if (audience === 'All Customers') return customers.length;
      if (audience === 'VIP Segment') return customers.filter(c => c.tags?.includes('VIP')).length;
      if (audience === 'Cold Leads') return customers.filter(c => c.status === 'lead').length;
      return 0;
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const copy = await generateMarketingCopy(business, topic, audience);
      setMessageBody(copy);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campName,
      status: 'active', 
      audience: audience,
      message: messageBody,
      stats: { sent: getAudienceCount(), read: 0, replied: 0, converted: 0, revenue: 0 },
      createdAt: Date.now()
    };
    
    const updatedCampaigns = [newCampaign, ...campaigns];
    onUpdateCampaigns(updatedCampaigns);
    
    if (onLaunch) {
        onLaunch(newCampaign);
    }

    setIsCreating(false);
    
    // Reset form
    setCampName('');
    setTopic('');
    setMessageBody('');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaigns & Broadcasts</h2>
          <p className="text-slate-400">Engage your customers with AI-powered bulk messages.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-lg shadow-blue-900/20"
          >
            <span className="mr-2"><Icons.Plus /></span> New Campaign
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-white mb-6">Create New Broadcast</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Campaign Name</label>
                        <input 
                            value={campName} 
                            onChange={e => setCampName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="e.g. Winter Sale 2025"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Target Audience</label>
                        <select 
                            value={audience}
                            onChange={e => setAudience(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                        >
                            <option>All Customers</option>
                            <option>VIP Segment</option>
                            <option>Cold Leads</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Est. Audience Size: {getAudienceCount()} users</p>
                    </div>
                    <div>
                         <label className="block text-slate-400 text-sm mb-2">Topic / Goal</label>
                         <div className="flex space-x-2">
                            <input 
                                value={topic} 
                                onChange={e => setTopic(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                placeholder="e.g. 50% off all pizzas this Friday"
                            />
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-medium disabled:opacity-50 flex items-center"
                            >
                                {isGenerating ? '...' : '✨ Write for me'}
                            </button>
                         </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 flex flex-col">
                    <label className="block text-slate-400 text-sm mb-2">Message Preview</label>
                    <textarea 
                        value={messageBody}
                        onChange={e => setMessageBody(e.target.value)}
                        className="flex-1 w-full bg-[#efeae2] text-slate-900 p-4 rounded-lg resize-none outline-none border-2 border-transparent focus:border-blue-500 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"
                        placeholder="Your message will appear here..."
                    />
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{messageBody.length} chars</span>
                        <span>1 Credit</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t border-slate-700 pt-6">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button 
                    onClick={handleCreate}
                    disabled={!messageBody || !campName}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="mr-2"><Icons.Send /></span> Launch Campaign
                </button>
            </div>
        </div>
      ) : (
        <div className="grid gap-6">
            {campaigns.map(c => (
                <div key={c.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                                <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold ${
                                    c.status === 'completed' ? 'bg-slate-700 text-slate-400' : 
                                    c.status === 'active' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>{c.status}</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">To: {c.audience} • {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-green-400">{currency}{(c.stats.revenue || 0).toLocaleString()}</span>
                            <p className="text-xs text-slate-500">Attributed Rev</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 mb-6 text-sm text-slate-300 italic">
                        "{c.message}"
                    </div>

                    <div className="grid grid-cols-4 gap-4 border-t border-slate-700 pt-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Sent</span>
                                <span>{c.stats.sent}</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: '100%'}}></div>
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Read Rate</span>
                                <span>{c.stats.sent > 0 ? Math.round((c.stats.read / c.stats.sent) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{width: `${c.stats.sent > 0 ? (c.stats.read / c.stats.sent) * 100 : 0}%`}}></div>
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Reply Rate</span>
                                <span>{c.stats.sent > 0 ? Math.round((c.stats.replied / c.stats.sent) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{width: `${c.stats.sent > 0 ? (c.stats.replied / c.stats.sent) * 100 : 0}%`}}></div>
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span className="font-bold text-green-400">Converted</span>
                                <span className="font-bold text-white">{c.stats.converted}</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: `${c.stats.sent > 0 ? (c.stats.converted / c.stats.sent) * 100 : 0}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
