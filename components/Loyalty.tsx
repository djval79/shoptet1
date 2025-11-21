
import React, { useState } from 'react';
import { BusinessProfile, LoyaltyProgram, LoyaltyTier } from '../types';
import { Icons } from '../constants';

interface LoyaltyProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Loyalty: React.FC<LoyaltyProps> = ({ business, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tiers' | 'config'>('dashboard');
  
  // Initial State
  const defaultProgram: LoyaltyProgram = {
      enabled: false,
      name: `${business.name} Rewards`,
      earningRate: 10, // 10 points per $1
      redemptionRate: 100, // 100 points = $1
      tiers: [
          { id: 't1', name: 'Bronze', minSpend: 0, color: '#cd7f32', benefits: ['Earn Points'] },
          { id: 't2', name: 'Silver', minSpend: 500, color: '#c0c0c0', benefits: ['1.2x Points', 'Free Shipping'] },
          { id: 't3', name: 'Gold', minSpend: 2000, color: '#ffd700', benefits: ['2x Points', 'Priority Support', 'Exclusive Deals'] }
      ]
  };

  const [program, setProgram] = useState<LoyaltyProgram>(business.loyaltyProgram || defaultProgram);
  
  const currency = business.currencySymbol || '$';

  // Tier Editor State
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [newBenefit, setNewBenefit] = useState('');

  const handleSave = () => {
      onUpdate({ ...business, loyaltyProgram: program });
  };

  const handleTierUpdate = (tier: LoyaltyTier) => {
      const updatedTiers = program.tiers.map(t => t.id === tier.id ? tier : t);
      setProgram({ ...program, tiers: updatedTiers });
      setEditingTier(null);
  };

  const addBenefit = () => {
      if (!editingTier || !newBenefit) return;
      setEditingTier({
          ...editingTier,
          benefits: [...editingTier.benefits, newBenefit]
      });
      setNewBenefit('');
  };

  const removeBenefit = (index: number) => {
      if (!editingTier) return;
      setEditingTier({
          ...editingTier,
          benefits: editingTier.benefits.filter((_, i) => i !== index)
      });
  };

  // Calculations for Simulator
  const [simSpend, setSimSpend] = useState(100);
  const earnedPoints = simSpend * program.earningRate;
  const redemptionValue = (earnedPoints / program.redemptionRate).toFixed(2);
  
  // Mock Member Data
  const members = [
      { name: 'Alice Walker', spend: 2500, points: 4500, tier: 'Gold' },
      { name: 'Bob Builder', spend: 800, points: 1200, tier: 'Silver' },
      { name: 'Charlie Day', spend: 120, points: 400, tier: 'Bronze' },
      { name: 'Diana Prince', spend: 3200, points: 8000, tier: 'Gold' },
      { name: 'Evan Stone', spend: 0, points: 0, tier: 'Bronze' }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Loyalty & Rewards</h2>
          <p className="text-slate-400">Automate customer retention with points and tiers.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
             <span className="text-sm font-medium text-white px-2">Program Status</span>
             <button 
                onClick={() => { setProgram({ ...program, enabled: !program.enabled }); handleSave(); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${program.enabled ? 'bg-purple-600' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${program.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      <div className="flex justify-start mb-6 bg-slate-800 rounded-lg p-1 w-fit border border-slate-700">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('tiers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tiers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Tier Config
            </button>
            <button 
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Points Rules
            </button>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'dashboard' && (
              <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-6 rounded-xl">
                          <p className="text-purple-300 text-xs font-bold uppercase mb-1">Points Liability</p>
                          <h3 className="text-3xl font-bold text-white">{(members.reduce((acc, m) => acc + m.points, 0)).toLocaleString()} pts</h3>
                          <span className="text-xs text-slate-400">Value: {currency}{(members.reduce((acc, m) => acc + m.points, 0) / program.redemptionRate).toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-600 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Active Members</p>
                          <h3 className="text-3xl font-bold text-white">{members.length}</h3>
                          <span className="text-xs text-green-400">100% Participation</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-600 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg. Points Balance</p>
                          <h3 className="text-3xl font-bold text-white">{(members.reduce((acc, m) => acc + m.points, 0) / members.length).toFixed(0)}</h3>
                      </div>
                  </div>

                  <h3 className="text-white font-bold mb-4">Top Loyal Customers</h3>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                              <tr>
                                  <th className="p-4">Member</th>
                                  <th className="p-4">Tier</th>
                                  <th className="p-4">Lifetime Spend</th>
                                  <th className="p-4 text-right">Points Balance</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {members.sort((a,b) => b.spend - a.spend).map((m, i) => (
                                  <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                      <td className="p-4 font-medium text-white">{m.name}</td>
                                      <td className="p-4">
                                          <span className="px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-900" style={{
                                              backgroundColor: program.tiers.find(t => t.name === m.tier)?.color || '#fff'
                                          }}>
                                              {m.tier}
                                          </span>
                                      </td>
                                      <td className="p-4 text-slate-400">{currency}{m.spend.toLocaleString()}</td>
                                      <td className="p-4 text-right font-mono text-purple-400 font-bold">{m.points.toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'tiers' && (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                   {editingTier ? (
                       <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 animate-in slide-in-from-right-4">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="text-xl font-bold text-white">Edit {editingTier.name} Tier</h3>
                               <button onClick={() => setEditingTier(null)} className="text-slate-400 hover:text-white">Cancel</button>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6 mb-6">
                               <div>
                                   <label className="block text-slate-400 text-xs font-bold mb-2">Tier Name</label>
                                   <input 
                                        value={editingTier.name}
                                        onChange={e => setEditingTier({...editingTier, name: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                   />
                               </div>
                               <div>
                                   <label className="block text-slate-400 text-xs font-bold mb-2">Color Hex</label>
                                   <div className="flex gap-2">
                                       <input 
                                            type="color"
                                            value={editingTier.color}
                                            onChange={e => setEditingTier({...editingTier, color: e.target.value})}
                                            className="h-10 w-12 bg-transparent border-none cursor-pointer"
                                       />
                                       <input 
                                            value={editingTier.color}
                                            onChange={e => setEditingTier({...editingTier, color: e.target.value})}
                                            className="flex-1 bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                       />
                                   </div>
                               </div>
                           </div>
                           
                           <div className="mb-6">
                               <label className="block text-slate-400 text-xs font-bold mb-2">Minimum Lifetime Spend ({currency})</label>
                               <input 
                                    type="number"
                                    value={editingTier.minSpend}
                                    onChange={e => setEditingTier({...editingTier, minSpend: Number(e.target.value)})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                               />
                           </div>

                           <div className="mb-6">
                               <label className="block text-slate-400 text-xs font-bold mb-2">Benefits</label>
                               <div className="flex gap-2 mb-2">
                                   <input 
                                        value={newBenefit}
                                        onChange={e => setNewBenefit(e.target.value)}
                                        placeholder="e.g. Free Shipping"
                                        className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
                                        onKeyDown={e => e.key === 'Enter' && addBenefit()}
                                   />
                                   <button onClick={addBenefit} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded">Add</button>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                   {editingTier.benefits.map((b, i) => (
                                       <div key={i} className="bg-slate-800 px-3 py-1 rounded-full border border-slate-600 text-xs text-white flex items-center">
                                           {b}
                                           <button onClick={() => removeBenefit(i)} className="ml-2 text-slate-500 hover:text-red-400">✕</button>
                                       </div>
                                   ))}
                               </div>
                           </div>

                           <button 
                                onClick={() => handleTierUpdate(editingTier)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold"
                           >
                               Save Tier
                           </button>
                       </div>
                   ) : (
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {program.tiers.sort((a,b) => a.minSpend - b.minSpend).map(tier => (
                               <div key={tier.id} className="bg-slate-900 border border-slate-600 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500 transition-colors">
                                   <div className="absolute top-0 left-0 w-full h-1" style={{backgroundColor: tier.color}}></div>
                                   <div className="flex justify-between items-start mb-4">
                                       <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                                       <button onClick={() => setEditingTier(tier)} className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Icons.Edit />
                                       </button>
                                   </div>
                                   <p className="text-slate-400 text-xs uppercase font-bold mb-4">Spend &gt; {currency}{tier.minSpend}</p>
                                   <ul className="space-y-2">
                                       {tier.benefits.map((b, i) => (
                                           <li key={i} className="text-sm text-slate-300 flex items-center">
                                               <span className="text-green-400 mr-2">✓</span> {b}
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           ))}
                       </div>
                   )}
              </div>
          )}

          {activeTab === 'config' && (
              <div className="p-8 flex gap-12 h-full">
                  {/* Inputs */}
                  <div className="w-1/3 space-y-8">
                       <div>
                           <label className="block text-slate-400 text-sm font-bold mb-2">Program Name</label>
                           <input 
                                value={program.name}
                                onChange={e => setProgram({...program, name: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                           />
                       </div>

                       <div>
                           <label className="block text-slate-400 text-sm font-bold mb-4">Earning Rate</label>
                           <div className="flex items-center justify-between mb-2">
                               <span className="text-white text-sm">1 {business.currencySymbol || '$'} spent =</span>
                               <span className="text-purple-400 font-bold text-xl">{program.earningRate} Points</span>
                           </div>
                           <input 
                                type="range" min="1" max="100" 
                                value={program.earningRate}
                                onChange={e => setProgram({...program, earningRate: Number(e.target.value)})}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                           />
                       </div>

                       <div>
                           <label className="block text-slate-400 text-sm font-bold mb-4">Redemption Value</label>
                           <div className="flex items-center justify-between mb-2">
                               <span className="text-white text-sm">100 Points =</span>
                               <span className="text-green-400 font-bold text-xl">{currency}{(100 / program.redemptionRate).toFixed(2)}</span>
                           </div>
                           <input 
                                type="range" min="10" max="1000" step="10"
                                value={program.redemptionRate}
                                onChange={e => setProgram({...program, redemptionRate: Number(e.target.value)})}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                           />
                           <p className="text-xs text-slate-500 mt-2">Currently: {program.redemptionRate} points needed for {currency}1 off.</p>
                       </div>

                       <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg">
                           Save Rules
                       </button>
                  </div>

                  {/* Simulator */}
                  <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                       <div className="absolute top-4 right-4 text-xs text-slate-500 font-bold uppercase">Customer Simulator</div>
                       
                       <div className="bg-[#0b1120] p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
                           <h4 className="text-slate-400 text-sm uppercase font-bold mb-6">If a customer spends...</h4>
                           
                           <div className="flex items-center justify-center mb-8">
                               <span className="text-4xl font-bold text-white mr-4">{currency}</span>
                               <input 
                                    type="number" 
                                    value={simSpend}
                                    onChange={e => setSimSpend(Number(e.target.value))}
                                    className="w-32 bg-slate-800 border-b-2 border-slate-600 text-4xl font-bold text-white text-center outline-none focus:border-blue-500 py-2"
                               />
                           </div>

                           <div className="h-px bg-slate-800 w-full mb-8 relative">
                               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0b1120] px-4 text-slate-500 text-xs">THEY GET</div>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                               <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                                   <p className="text-purple-400 text-xs font-bold uppercase mb-1">Points Earned</p>
                                   <p className="text-3xl font-bold text-white">+{earnedPoints}</p>
                               </div>
                               <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                                   <p className="text-green-400 text-xs font-bold uppercase mb-1">Credit Value</p>
                                   <p className="text-3xl font-bold text-white">{currency}{redemptionValue}</p>
                               </div>
                           </div>
                           
                           <div className="mt-6 text-xs text-slate-500">
                               Effectively a <strong>{((parseFloat(redemptionValue) / simSpend) * 100).toFixed(1)}%</strong> cashback reward.
                           </div>
                       </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default Loyalty;
