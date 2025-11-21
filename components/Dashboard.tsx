import React from 'react';
import { BusinessProfile } from '../types';
import { useData } from '../contexts/DataContext';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface DashboardProps {
  businesses: BusinessProfile[];
  activeBusinessId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ businesses, activeBusinessId }) => {
  const { orders, customers } = useData();
  const activeBusiness = businesses.find(b => b.id === activeBusinessId);

  if (!activeBusiness) return <div>Loading...</div>;

  // Calculate Metrics
  const totalRevenue = activeBusiness.revenue;
  const activeConversations = activeBusiness.activeChats;
  const progress = 75; // Mock progress for setup
  const recentOrders = orders.slice(0, 5);

  // Mock Data for Charts
  const metrics = {
    chartData: [
      { name: 'Mon', value: 4000 },
      { name: 'Tue', value: 3000 },
      { name: 'Wed', value: 2000 },
      { name: 'Thu', value: 2780 },
      { name: 'Fri', value: 1890 },
      { name: 'Sat', value: 2390 },
      { name: 'Sun', value: 3490 },
    ]
  };

  const revenueData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  const conversationData = [
    { name: 'Mon', value: 240 },
    { name: 'Tue', value: 139 },
    { name: 'Wed', value: 980 },
    { name: 'Thu', value: 390 },
    { name: 'Fri', value: 480 },
    { name: 'Sat', value: 380 },
    { name: 'Sun', value: 430 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome / Progress Banner */}
      {progress < 100 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {activeBusiness.name} 👋</h2>
              <p className="text-slate-400">Complete your setup to unlock full AI potential.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-400">{progress}%</span>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Setup Complete</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center border-t-blue-500">
                <Icons.Zap />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
              <Icons.DollarSign />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-400 flex items-center font-medium">
              <Icons.TrendingUp /> <span className="ml-1">+12.5%</span>
            </span>
            <span className="text-slate-500 ml-2">from last month</span>
          </div>
        </div>

        {/* Active Conversations Card */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Conversations</p>
              <h3 className="text-3xl font-bold text-white mt-1">{activeConversations}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
              <Icons.MessageSquare />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-400 flex items-center font-medium">
              <Icons.TrendingUp /> <span className="ml-1">+5.2%</span>
            </span>
            <span className="text-slate-500 ml-2">new leads today</span>
          </div>
        </div>

        {/* Sales Agent Strategy Card */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50 shadow-lg hover:border-green-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Sales Agent Strategy</p>
              <h3 className="text-xl font-bold text-white mt-1 capitalize">{activeBusiness.salesStrategy} AI</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
              <Icons.Target />
            </div>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">85% Goal Completion</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#3b82f6' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversation Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Conversation Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center justify-center group">
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <Icons.Plus />
          </div>
          <span className="text-sm font-medium text-slate-300">New Campaign</span>
        </button>
        <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center justify-center group">
          <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <Icons.Users />
          </div>
          <span className="text-sm font-medium text-slate-300">Add Contact</span>
        </button>
        <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center justify-center group">
          <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-3 group-hover:scale-110 transition-transform">
            <Icons.CreditCard />
          </div>
          <span className="text-sm font-medium text-slate-300">Create Invoice</span>
        </button>
        <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex flex-col items-center justify-center group">
          <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
            <Icons.Settings />
          </div>
          <span className="text-sm font-medium text-slate-300">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
