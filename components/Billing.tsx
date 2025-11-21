
import React from 'react';
import { Icons } from '../constants';
import { SubscriptionPlan, BusinessProfile } from '../types';

interface BillingProps {
  business?: BusinessProfile;
  onUpdateBusiness?: (updated: BusinessProfile) => void;
  plans?: {
      starter: SubscriptionPlan;
      growth: SubscriptionPlan;
      enterprise: SubscriptionPlan;
  }
}

const Billing: React.FC<BillingProps> = ({ plans, business, onUpdateBusiness }) => {
  // Default fallback if no custom plans provided
  const displayPlans = plans || {
      starter: { id: '1', name: 'Starter', price: 49, currency: '$', features: ['1 WhatsApp Number', '500 Conversations/mo', 'Basic AI Model'] },
      growth: { id: '2', name: 'Growth', price: 129, currency: '$', features: ['3 WhatsApp Numbers', 'Unlimited Conversations', 'Voice Call Support', 'Advanced Analytics'], isPopular: true },
      enterprise: { id: '3', name: 'Enterprise', price: 499, currency: '$', features: ['Unlimited Numbers', 'Dedicated Support', 'Custom AI Fine-tuning'] }
  };

  const currentPlanId = business?.subscriptionPlan || 'starter';

  const handleSelectPlan = (planName: string) => {
      if (onUpdateBusiness && business) {
          const normalizedName = planName.toLowerCase() as 'starter' | 'growth' | 'enterprise';
          onUpdateBusiness({ ...business, subscriptionPlan: normalizedName });
          alert(`Successfully switched to ${planName} plan.`);
      }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Subscription & Billing</h2>
        <p className="text-slate-400">Manage your SaaS plan and usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {(Object.values(displayPlans) as SubscriptionPlan[]).map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlanId;
            return (
                <div key={plan.id} className={`bg-slate-800 border rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all ${isCurrent ? 'border-green-500 ring-2 ring-green-500/20' : plan.isPopular ? 'border-blue-500 shadow-2xl shadow-blue-900/20 transform scale-105 z-10' : 'border-slate-700'}`}>
                {isCurrent && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">Current Plan</div>
                )}
                {!isCurrent && plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                )}
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-white mb-4">{plan.currency}{plan.price}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center text-sm text-slate-300"><span className="mr-2 text-green-400">✓</span> {feat}</li>
                    ))}
                </ul>
                <button 
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={isCurrent}
                    className={`w-full py-2 rounded-lg transition-colors font-bold ${
                        isCurrent 
                        ? 'bg-green-500/20 text-green-400 cursor-default' 
                        : plan.isPopular 
                            ? 'bg-blue-600 text-white hover:bg-blue-500' 
                            : 'border border-slate-600 text-white hover:bg-slate-700'
                    }`}
                >
                    {isCurrent ? 'Active' : 'Select Plan'}
                </button>
                </div>
            );
        })}
      </div>

      {/* Usage Stats */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="font-bold text-white mb-4">Current Usage</h3>
          <div className="space-y-4">
              <div>
                  <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Conversations (342/500)</span>
                      <span className="text-slate-400">68%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[68%]"></div>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">AI Tokens (1.2M/2M)</span>
                      <span className="text-slate-400">60%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[60%]"></div>
                  </div>
              </div>
          </div>
      </div>

      {/* Twilio Usage Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">Twilio WhatsApp Usage</h3>
              <span className="text-xs text-slate-500">Current Billing Period</span>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase">
                  <tr>
                      <th className="p-4">Category</th>
                      <th className="p-4">Conversations</th>
                      <th className="p-4">Rate (Est.)</th>
                      <th className="p-4 text-right">Cost</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                  <tr>
                      <td className="p-4 text-white font-medium">Marketing (Business-Initiated)</td>
                      <td className="p-4 text-slate-300">120</td>
                      <td className="p-4 text-slate-500">$0.0250</td>
                      <td className="p-4 text-right font-mono text-white">$3.00</td>
                  </tr>
                  <tr>
                      <td className="p-4 text-white font-medium">Utility (Business-Initiated)</td>
                      <td className="p-4 text-slate-300">85</td>
                      <td className="p-4 text-slate-500">$0.0150</td>
                      <td className="p-4 text-right font-mono text-white">$1.28</td>
                  </tr>
                  <tr>
                      <td className="p-4 text-white font-medium">Authentication (Business-Initiated)</td>
                      <td className="p-4 text-slate-300">40</td>
                      <td className="p-4 text-slate-500">$0.0130</td>
                      <td className="p-4 text-right font-mono text-white">$0.52</td>
                  </tr>
                   <tr>
                      <td className="p-4 text-white font-medium">Service (User-Initiated)</td>
                      <td className="p-4 text-slate-300">215</td>
                      <td className="p-4 text-slate-500">$0.0120</td>
                      <td className="p-4 text-right font-mono text-white">$2.58</td>
                  </tr>
                   <tr className="bg-slate-700/30 font-bold">
                      <td className="p-4 text-white" colSpan={3}>Total Estimated Cost</td>
                      <td className="p-4 text-right font-mono text-green-400">$7.38</td>
                  </tr>
              </tbody>
          </table>
          <div className="p-4 text-center bg-slate-900/30 text-[10px] text-slate-500">
              * Rates are estimates based on North America pricing. Actual Twilio invoice may vary.
          </div>
      </div>
      <div className="h-8"></div>
    </div>
  );
};

export default Billing;
