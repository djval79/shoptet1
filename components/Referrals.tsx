
import React, { useState } from 'react';
import { BusinessProfile, ReferralProgram, Referral } from '../types';
import { MOCK_REFERRALS, Icons } from '../constants';

interface ReferralsProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Referrals: React.FC<ReferralsProps> = ({ business, onUpdate }) => {
  const [program, setProgram] = useState<ReferralProgram>(
    business.referralProgram || { 
        enabled: false, 
        type: 'fixed', 
        referrerReward: 10, 
        refereeReward: 10, 
        minSpend: 20 
    }
  );
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  
  const currency = business.currencySymbol || '$';

  const handleSave = () => {
      onUpdate({ ...business, referralProgram: program });
      alert("Referral program updated!");
  };

  // Stats
  const totalRevenue = referrals.reduce((acc, r) => acc + r.amount, 0);
  const totalPayouts = referrals.filter(r => r.status === 'paid').reduce((acc, r) => acc + program.referrerReward, 0);
  const viralCoefficient = (referrals.length / 50).toFixed(2); // Mock calculation: Referrals / Total Customers

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Referrals & Loyalty</h2>
          <p className="text-slate-400">Turn your customers into your best sales agents.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
             <span className="text-sm font-medium text-white px-2">Program Status</span>
             <button 
                onClick={() => setProgram({ ...program, enabled: !program.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${program.enabled ? 'bg-green-500' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${program.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 p-4 rounded-xl">
              <p className="text-green-300 text-xs font-bold uppercase mb-1">Referral Revenue</p>
              <h3 className="text-2xl font-bold text-white">{currency}{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Referrals</p>
              <h3 className="text-2xl font-bold text-white">{referrals.length}</h3>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Viral Coefficient (K)</p>
              <h3 className="text-2xl font-bold text-white">{viralCoefficient}</h3>
              <p className="text-[10px] text-slate-500">Target > 1.0 for viral growth</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Pending Payouts</p>
              <h3 className="text-2xl font-bold text-yellow-400">{currency}{referrals.filter(r => r.status === 'completed').length * program.referrerReward}</h3>
          </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: Configuration */}
          <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <Icons.Settings /> <span className="ml-2">Configuration</span>
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Reward Type</label>
                      <div className="flex bg-slate-900 rounded p-1">
                          <button 
                            onClick={() => setProgram({...program, type: 'fixed'})}
                            className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${program.type === 'fixed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                              Fixed Amount
                          </button>
                          <button 
                            onClick={() => setProgram({...program, type: 'percentage'})}
                            className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${program.type === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                              Percentage
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-slate-400 text-xs mb-1">Referrer Gets</label>
                          <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-500 text-sm">{program.type === 'fixed' ? currency : '%'}</span>
                              <input 
                                type="number"
                                value={program.referrerReward}
                                onChange={e => setProgram({...program, referrerReward: Number(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-8 text-white outline-none focus:border-green-500"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-slate-400 text-xs mb-1">Friend Gets</label>
                           <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-500 text-sm">{program.type === 'fixed' ? currency : '%'}</span>
                              <input 
                                type="number"
                                value={program.refereeReward}
                                onChange={e => setProgram({...program, refereeReward: Number(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-8 text-white outline-none focus:border-green-500"
                              />
                          </div>
                      </div>
                  </div>

                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Minimum Spend to Qualify</label>
                      <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-500 text-sm">{currency}</span>
                              <input 
                                type="number"
                                value={program.minSpend}
                                onChange={e => setProgram({...program, minSpend: Number(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-8 text-white outline-none focus:border-blue-500"
                              />
                      </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                      <h4 className="text-blue-300 text-xs font-bold mb-2">AI Integration</h4>
                      <p className="text-blue-200/70 text-xs leading-relaxed">
                          When enabled, the AI agent will automatically pitch this offer after a successful order completion.
                      </p>
                      <div className="mt-3 bg-black/30 p-2 rounded text-xs text-slate-400 italic border-l-2 border-slate-600">
                          "Thanks for your order! Share this link to give friends {program.type === 'fixed' ? currency : ''}{program.refereeReward}{program.type === 'percentage' ? '%' : ''} off and get {program.type === 'fixed' ? currency : ''}{program.referrerReward}{program.type === 'percentage' ? '%' : ''} for yourself!"
                      </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold shadow-lg transition-colors"
                  >
                      Save Changes
                  </button>
              </div>
          </div>

          {/* Right: Leaderboard & List */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
               <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-bold text-white">Referral History</h3>
                  <button className="text-xs bg-slate-800 border border-slate-600 text-white px-3 py-1 rounded hover:bg-slate-700">
                      Export CSV
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                           <tr>
                               <th className="p-4">Referrer</th>
                               <th className="p-4">Referred Friend</th>
                               <th className="p-4">Date</th>
                               <th className="p-4">Status</th>
                               <th className="p-4 text-right">Reward</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-700 text-sm">
                           {referrals.map(ref => (
                               <tr key={ref.id} className="hover:bg-slate-700/30 transition-colors">
                                   <td className="p-4">
                                       <div className="font-medium text-white">{ref.referrerName}</div>
                                   </td>
                                   <td className="p-4 text-slate-300">
                                       {ref.refereeName}
                                   </td>
                                   <td className="p-4 text-slate-500 text-xs">
                                       {new Date(ref.date).toLocaleDateString()}
                                   </td>
                                   <td className="p-4">
                                       <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${
                                           ref.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                           ref.status === 'completed' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                           'bg-slate-600/20 text-slate-400 border-slate-600/30'
                                       }`}>
                                           {ref.status}
                                       </span>
                                   </td>
                                   <td className="p-4 text-right font-mono text-green-400 font-bold">
                                       {ref.amount > 0 ? `+${currency}${program.referrerReward}` : '--'}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
          </div>
      </div>
    </div>
  );
};

export default Referrals;
