
import React, { useState } from 'react';
import { BusinessProfile, Subscription, Product, Customer } from '../types';
import { Icons } from '../constants';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';

interface SubscriptionsProps {
  business: BusinessProfile;
  customers: Customer[];
  onUpdateBusiness: (updated: BusinessProfile) => void;
}

// Mock Subscriptions
const MOCK_SUBS: Subscription[] = [
    { id: 'sub_1', customerId: 'c1', customerName: 'Alice Walker', planName: 'Coffee Club (Gold)', price: 49, interval: 'month', status: 'active', startDate: Date.now() - 86400000 * 60, nextBillingDate: Date.now() + 86400000 * 5 },
    { id: 'sub_2', customerId: 'c2', customerName: 'Bob Builder', planName: 'Weekly Beans', price: 15, interval: 'week', status: 'active', startDate: Date.now() - 86400000 * 20, nextBillingDate: Date.now() + 86400000 * 2 },
    { id: 'sub_3', customerId: 'c3', customerName: 'Charlie Day', planName: 'Coffee Club (Gold)', price: 49, interval: 'month', status: 'cancelled', startDate: Date.now() - 86400000 * 120, nextBillingDate: Date.now() - 86400000 * 10 }
];

const Subscriptions: React.FC<SubscriptionsProps> = ({ business, customers, onUpdateBusiness }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'subscribers'>('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBS);
  
  const currency = business.currencySymbol || '$';

  // Plan Builder State
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planInterval, setPlanInterval] = useState<'week' | 'month' | 'year'>('month');
  const [planDesc, setPlanDesc] = useState('');

  // Filter Products that are subscriptions
  const subscriptionProducts = business.products.filter(p => p.billingInterval);

  // Stats
  const mrr = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => {
      if (s.interval === 'month') return acc + s.price;
      if (s.interval === 'week') return acc + (s.price * 4);
      if (s.interval === 'year') return acc + (s.price / 12);
      return acc;
  }, 0);
  
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const churnRate = (subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length * 100).toFixed(1);

  // Mock Chart Data
  const revenueData = [
      { name: 'Jan', mrr: mrr * 0.8 },
      { name: 'Feb', mrr: mrr * 0.85 },
      { name: 'Mar', mrr: mrr * 0.9 },
      { name: 'Apr', mrr: mrr * 0.95 },
      { name: 'May', mrr: mrr }
  ];

  const handleCreatePlan = () => {
      if (!planName || !planPrice) return;
      
      const newProduct: Product = {
          id: `prod_sub_${Date.now()}`,
          name: planName,
          price: parseFloat(planPrice),
          description: planDesc,
          category: 'Subscriptions',
          inStock: true,
          billingInterval: planInterval,
          image: `https://ui-avatars.com/api/?name=${planName}&background=random&size=200`
      };
      
      onUpdateBusiness({ ...business, products: [...business.products, newProduct] });
      setIsCreatingPlan(false);
      setPlanName('');
      setPlanPrice('');
      setPlanDesc('');
  };

  const toggleStatus = (id: string) => {
      setSubscriptions(prev => prev.map(s => {
          if (s.id === id) {
              const newStatus = s.status === 'active' ? 'paused' : 'active';
              return { ...s, status: newStatus };
          }
          return s;
      }));
  };

  const cancelSubscription = (id: string) => {
      if (confirm("Cancel this subscription? The customer will not be billed again.")) {
          setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'active': return 'bg-green-500/20 text-green-400';
          case 'paused': return 'bg-yellow-500/20 text-yellow-400';
          case 'cancelled': return 'bg-red-500/20 text-red-400';
          case 'past_due': return 'bg-orange-500/20 text-orange-400';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscriptions & Recurring</h2>
          <p className="text-slate-400">Manage recurring revenue and membership plans.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'plans' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Plans
            </button>
            <button 
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'subscribers' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Subscribers
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'dashboard' && (
              <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Monthly Recurring Revenue (MRR)</p>
                          <h3 className="text-3xl font-bold text-white">{currency}{mrr.toLocaleString()}</h3>
                          <p className="text-xs text-green-400 mt-1">+5% this month</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Active Subscribers</p>
                          <h3 className="text-3xl font-bold text-blue-400">{activeCount}</h3>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Churn Rate</p>
                          <h3 className="text-3xl font-bold text-red-400">{churnRate}%</h3>
                      </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-8">
                      <h4 className="text-white font-bold mb-6">Revenue Growth</h4>
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revenueData}>
                                  <defs>
                                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                  <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMrr)" strokeWidth={3} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'plans' && (
              <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-white text-lg">Subscription Products</h3>
                      <button onClick={() => setIsCreatingPlan(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center">
                          <Icons.Plus /> <span className="ml-2">Create Plan</span>
                      </button>
                  </div>

                  {isCreatingPlan && (
                      <div className="bg-slate-900 p-6 rounded-lg border border-slate-600 mb-6 animate-in slide-in-from-top-2">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Plan Name</label>
                                  <input 
                                      value={planName}
                                      onChange={e => setPlanName(e.target.value)}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                      placeholder="e.g. Gold Membership"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Price</label>
                                  <input 
                                      type="number"
                                      value={planPrice}
                                      onChange={e => setPlanPrice(e.target.value)}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                      placeholder="29.99"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs mb-1">Billing Interval</label>
                                  <select 
                                      value={planInterval}
                                      onChange={e => setPlanInterval(e.target.value as any)}
                                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                  >
                                      <option value="week">Weekly</option>
                                      <option value="month">Monthly</option>
                                      <option value="year">Yearly</option>
                                  </select>
                              </div>
                          </div>
                          <div className="mb-4">
                              <label className="block text-slate-400 text-xs mb-1">Description</label>
                              <input 
                                  value={planDesc}
                                  onChange={e => setPlanDesc(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                  placeholder="Benefits included..."
                              />
                          </div>
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setIsCreatingPlan(false)} className="text-slate-400 hover:text-white text-sm px-3">Cancel</button>
                              <button onClick={handleCreatePlan} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold">Save Plan</button>
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
                      {subscriptionProducts.map(p => (
                          <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative group hover:border-purple-500 transition-colors">
                              <div className="absolute top-4 right-4">
                                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-600 uppercase">{p.billingInterval}ly</span>
                              </div>
                              <h4 className="text-white font-bold text-lg mb-1">{p.name}</h4>
                              <p className="text-2xl font-mono text-purple-400 mb-4">{currency}{p.price}<span className="text-sm text-slate-500">/{p.billingInterval?.charAt(0)}</span></p>
                              <p className="text-sm text-slate-400 mb-6 h-10 line-clamp-2">{p.description}</p>
                              <button className="w-full py-2 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-bold transition-colors">
                                  Edit Details
                              </button>
                          </div>
                      ))}
                      {subscriptionProducts.length === 0 && !isCreatingPlan && (
                          <div className="col-span-3 text-center py-12 text-slate-500">
                              No subscription plans created yet.
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'subscribers' && (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                          <tr>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Plan</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Next Billing</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {subscriptions.map(sub => (
                              <tr key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-medium text-white">{sub.customerName}</td>
                                  <td className="p-4">
                                      <div className="text-white text-xs font-bold">{sub.planName}</div>
                                      <div className="text-slate-500 text-[10px]">{currency}{sub.price}/{sub.interval}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${getStatusColor(sub.status)}`}>
                                          {sub.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-300 font-mono text-xs">
                                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-right">
                                      {sub.status !== 'cancelled' && (
                                          <div className="flex justify-end gap-2">
                                              <button 
                                                onClick={() => toggleStatus(sub.id)}
                                                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded"
                                              >
                                                  {sub.status === 'active' ? 'Pause' : 'Resume'}
                                              </button>
                                              <button 
                                                onClick={() => cancelSubscription(sub.id)}
                                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                                              >
                                                  Cancel
                                              </button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default Subscriptions;
