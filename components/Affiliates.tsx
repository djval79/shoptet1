
import React, { useState } from 'react';
import { BusinessProfile, Affiliate } from '../types';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AffiliatesProps {
  business: BusinessProfile;
}

const MOCK_AFFILIATES: Affiliate[] = [
    { id: 'aff_1', name: 'Sarah Style', email: 'sarah@influencer.com', code: 'SARAH10', commissionRate: 10, earnings: 450, status: 'active', clicks: 1240, conversions: 85, joinedAt: Date.now() - 86400000 * 30 },
    { id: 'aff_2', name: 'Tech Trends', email: 'partners@techtrends.io', code: 'TECH20', commissionRate: 15, earnings: 1200, status: 'active', clicks: 3500, conversions: 210, joinedAt: Date.now() - 86400000 * 60 },
    { id: 'aff_3', name: 'Mike Vlogs', email: 'mike@vlogs.com', code: 'MIKEV', commissionRate: 10, earnings: 50, status: 'pending', clicks: 120, conversions: 5, joinedAt: Date.now() - 86400000 * 2 }
];

const Affiliates: React.FC<AffiliatesProps> = ({ business }) => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(MOCK_AFFILIATES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'partners' | 'payouts'>('dashboard');
  const [isCreating, setIsCreating] = useState(false);

  // Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newRate, setNewRate] = useState(10);

  const currency = business.currencySymbol || '$';

  // Stats
  const totalRevenue = affiliates.reduce((acc, a) => acc + (a.earnings / (a.commissionRate / 100)), 0);
  const totalCommission = affiliates.reduce((acc, a) => acc + a.earnings, 0);
  const totalConversions = affiliates.reduce((acc, a) => acc + a.conversions, 0);

  // Chart Data
  const chartData = affiliates.map(a => ({
      name: a.name,
      revenue: a.earnings / (a.commissionRate / 100),
      commission: a.earnings
  })).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

  const handleAddAffiliate = () => {
      if (!newName || !newEmail || !newCode) return;
      
      const newAffiliate: Affiliate = {
          id: `aff_${Date.now()}`,
          name: newName,
          email: newEmail,
          code: newCode.toUpperCase(),
          commissionRate: newRate,
          earnings: 0,
          status: 'active',
          clicks: 0,
          conversions: 0,
          joinedAt: Date.now()
      };
      
      setAffiliates([...affiliates, newAffiliate]);
      setIsCreating(false);
      setNewName('');
      setNewEmail('');
      setNewCode('');
      setNewRate(10);
  };

  const toggleStatus = (id: string) => {
      setAffiliates(prev => prev.map(a => {
          if (a.id === id) {
              return { ...a, status: a.status === 'active' ? 'suspended' : 'active' };
          }
          return a;
      }));
  };

  const markPaid = (id: string) => {
      if(confirm("Mark all earnings as paid? This will reset pending balance.")) {
          setAffiliates(prev => prev.map(a => {
              if (a.id === id) {
                  return { ...a, earnings: 0 }; // Simulating reset
              }
              return a;
          }));
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Affiliates & Partners</h2>
          <p className="text-slate-400">Manage influencers and track partner revenue.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('partners')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'partners' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Partners
            </button>
            <button 
                onClick={() => setActiveTab('payouts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payouts' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Payouts
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'dashboard' && (
              <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Partner Revenue</p>
                          <h3 className="text-3xl font-bold text-white">{currency}{totalRevenue.toLocaleString()}</h3>
                          <p className="text-xs text-green-400 mt-1">Generated by partners</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Commissions Due</p>
                          <h3 className="text-3xl font-bold text-yellow-400">{currency}{totalCommission.toLocaleString()}</h3>
                          <p className="text-xs text-slate-500 mt-1">Pending payout</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Conversions</p>
                          <h3 className="text-3xl font-bold text-blue-400">{totalConversions}</h3>
                          <p className="text-xs text-slate-500 mt-1">Sales via links</p>
                      </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-8">
                      <h4 className="text-white font-bold mb-6">Top Performing Partners</h4>
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                                  <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    cursor={{fill: '#334155', opacity: 0.4}}
                                  />
                                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="commission" name="Commission" fill="#facc15" radius={[4, 4, 0, 0]} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'partners' && (
              <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-white text-lg">Partner Directory</h3>
                      <button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center">
                          <Icons.Plus /> <span className="ml-2">Add Partner</span>
                      </button>
                  </div>

                  {isCreating && (
                      <div className="bg-slate-900 p-6 rounded-lg border border-slate-600 mb-6 animate-in slide-in-from-top-2">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Name</label>
                                  <input 
                                      value={newName}
                                      onChange={e => setNewName(e.target.value)}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                      placeholder="Partner Name"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Email</label>
                                  <input 
                                      value={newEmail}
                                      onChange={e => setNewEmail(e.target.value)}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                      placeholder="partner@email.com"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Tracking Code</label>
                                  <input 
                                      value={newCode}
                                      onChange={e => setNewCode(e.target.value.toUpperCase())}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm font-mono uppercase"
                                      placeholder="CODE20"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Commission (%)</label>
                                  <input 
                                      type="number"
                                      value={newRate}
                                      onChange={e => setNewRate(parseInt(e.target.value))}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                  />
                              </div>
                          </div>
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white text-sm px-3">Cancel</button>
                              <button onClick={handleAddAffiliate} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold">Save Partner</button>
                          </div>
                      </div>
                  )}

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                              <tr>
                                  <th className="p-4">Partner</th>
                                  <th className="p-4">Code</th>
                                  <th className="p-4">Rate</th>
                                  <th className="p-4">Traffic</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {affiliates.map(aff => (
                                  <tr key={aff.id} className="hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4">
                                          <div className="font-medium text-white">{aff.name}</div>
                                          <div className="text-xs text-slate-500">{aff.email}</div>
                                      </td>
                                      <td className="p-4 font-mono text-blue-400">{aff.code}</td>
                                      <td className="p-4 text-slate-300">{aff.commissionRate}%</td>
                                      <td className="p-4">
                                          <div className="text-xs text-slate-400">
                                              <span className="text-white font-bold">{aff.clicks}</span> clicks
                                          </div>
                                          <div className="text-xs text-slate-400">
                                              <span className="text-green-400 font-bold">{aff.conversions}</span> sales
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${
                                              aff.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                              aff.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                              'bg-red-500/20 text-red-400 border-red-500/30'
                                          }`}>
                                              {aff.status}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                          <button 
                                            onClick={() => toggleStatus(aff.id)}
                                            className="text-slate-400 hover:text-white text-xs"
                                          >
                                              {aff.status === 'active' ? 'Suspend' : 'Activate'}
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'payouts' && (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-white text-lg">Payouts</h3>
                      <button className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded">Export CSV</button>
                  </div>
                  
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                          <tr>
                              <th className="p-4">Partner</th>
                              <th className="p-4 text-right">Unpaid Earnings</th>
                              <th className="p-4 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {affiliates.filter(a => a.earnings > 0).map(aff => (
                              <tr key={aff.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-medium text-white">{aff.name}</td>
                                  <td className="p-4 text-right font-mono text-yellow-400 font-bold">{currency}{aff.earnings.toFixed(2)}</td>
                                  <td className="p-4 text-right">
                                      <button 
                                        onClick={() => markPaid(aff.id)}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold"
                                      >
                                          Mark Paid
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {affiliates.filter(a => a.earnings > 0).length === 0 && (
                              <tr>
                                  <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                                      No pending payouts.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default Affiliates;
