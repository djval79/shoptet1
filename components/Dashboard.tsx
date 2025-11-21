
import React from 'react';
import { BusinessProfile, SalesDataPoint, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Icons } from '../constants';

interface DashboardProps {
  businesses: BusinessProfile[];
  activeBusinessId: string;
  salesData: SalesDataPoint[];
}

const Dashboard: React.FC<DashboardProps> = ({ businesses, activeBusinessId, salesData }) => {
  const currentBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0];
  const currency = currentBusiness.currencySymbol || '$';
  const isTwilioConnected = !!currentBusiness.twilioAccountSid && !!currentBusiness.twilioAuthToken;

  // Setup Progress Logic
  const setupSteps = [
      { label: 'Connect Twilio', done: isTwilioConnected },
      { label: 'Add Products', done: currentBusiness.products.length > 0 },
      { label: 'Configure AI', done: !!currentBusiness.policies },
      { label: 'Test Simulator', done: currentBusiness.activeChats > 0 }
  ];
  const progress = Math.round((setupSteps.filter(s => s.done).length / setupSteps.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome / Progress Banner */}
      {progress < 100 && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome, {currentBusiness.name}!</h2>
                  <p className="text-slate-400 mb-4">Complete your setup to start selling on WhatsApp.</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
                      </div>
                      <span className="text-white font-bold text-sm">{progress}% Ready</span>
                  </div>

                  <div className="flex gap-4">
                      {setupSteps.map((step, i) => (
                          <div key={i} className={`flex items-center text-xs ${step.done ? 'text-green-400' : 'text-slate-500'}`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${step.done ? 'bg-green-500/20 border border-green-500' : 'border border-slate-600'}`}>
                                  {step.done && '✓'}
                              </span>
                              {step.label}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10">
                  <Icons.TargetCrosshair /> 
              </div>
          </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mt-2">{currency}{currentBusiness.revenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Icons.TrendingUp />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Conversations</p>
              <h3 className="text-3xl font-bold text-white mt-2">{currentBusiness.activeChats}</h3>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Icons.MessageSquare />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-400">
            <span>Avg response time: 1.2s</span>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Sales Agent Strategy</p>
              <h3 className="text-xl font-bold text-white mt-2 capitalize">{currentBusiness.salesStrategy}</h3>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Icons.Users />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-400">
            <span>AI Model: Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-center flex-col transition-all group">
              <div className="bg-blue-600 text-white p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Icons.Plus /></div>
              <span className="text-slate-300 font-medium text-sm">New Order</span>
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-center flex-col transition-all group">
              <div className="bg-purple-600 text-white p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Icons.MegaphoneSolid /></div>
              <span className="text-slate-300 font-medium text-sm">Send Broadcast</span>
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-center flex-col transition-all group">
              <div className="bg-green-600 text-white p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Icons.User /></div>
              <span className="text-slate-300 font-medium text-sm">Add Contact</span>
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center justify-center flex-col transition-all group">
              <div className="bg-yellow-600 text-white p-3 rounded-full mb-2 group-hover:scale-110 transition-transform"><Icons.LifeBuoy /></div>
              <span className="text-slate-300 font-medium text-sm">Support Ticket</span>
          </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `${currency}${val}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#4ade80' }}
                    formatter={(value) => [`${currency}${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Conversation Volume</h3>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
