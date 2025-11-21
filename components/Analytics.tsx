
import React from 'react';
import { BusinessProfile, Order, Customer, MessageLog } from '../types';
import { Icons } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsProps {
  business: BusinessProfile;
  orders?: Order[];
  customers?: Customer[];
  logs?: MessageLog[];
}

const Analytics: React.FC<AnalyticsProps> = ({ business, orders = [], customers = [], logs = [] }) => {
  // Dynamic KPI Calculations
  const totalCustomers = customers.length || 1;
  const payingCustomers = customers.filter(c => c.totalSpend > 0).length;
  const conversionRate = ((payingCustomers / totalCustomers) * 100).toFixed(1);
  
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0;
  
  const upsellOrders = orders.filter(o => o.items.length > 1).length;
  const upsellRate = orders.length > 0 ? ((upsellOrders / orders.length) * 100).toFixed(1) : 0;

  // Dynamic Funnel Data
  const funnelData = [
      { stage: 'Leads', value: totalCustomers, fill: '#94a3b8' },
      { stage: 'Chat', value: customers.filter(c => c.history.length > 0).length, fill: '#60a5fa' },
      { stage: 'Cart', value: Math.floor(customers.length * 0.6), fill: '#818cf8' }, // Simulated Cart metric
      { stage: 'Checkout', value: payingCustomers, fill: '#34d399' },
  ];

  // Dynamic Sentiment Data (Simulated trends based on time of day)
  const sentimentData = [
      { time: '09:00', positive: 65, negative: 10 },
      { time: '12:00', positive: 78, negative: 15 },
      { time: '15:00', positive: 82, negative: 8 },
      { time: '18:00', positive: 70, negative: 25 },
  ];

  // Top Products Calculation
  const productSales: Record<string, {name: string, qty: number, rev: number}> = {};
  orders.forEach(o => {
      o.items.forEach(i => {
          if (!productSales[i.id]) productSales[i.id] = { name: i.name, qty: 0, rev: 0 };
          productSales[i.id].qty += i.quantity;
          productSales[i.id].rev += i.quantity * i.price;
      });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.rev - a.rev).slice(0, 5);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
        <p className="text-slate-400">Deep dive into sales funnel efficiency and agent performance.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs font-medium uppercase">Conversion Rate</p>
          <h4 className="text-2xl font-bold text-white mt-1">{conversionRate}%</h4>
          <span className="text-xs text-green-400">Based on {totalCustomers} leads</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs font-medium uppercase">Avg Order Value</p>
          <h4 className="text-2xl font-bold text-white mt-1">${avgOrderValue}</h4>
          <span className="text-xs text-slate-500">{orders.length} orders total</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs font-medium uppercase">Upsell Rate</p>
          <h4 className="text-2xl font-bold text-white mt-1">{upsellRate}%</h4>
          <span className="text-xs text-green-400">{upsellOrders} multi-item orders</span>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs font-medium uppercase">Total Messages</p>
          <h4 className="text-2xl font-bold text-white mt-1">{logs.length}</h4>
          <span className="text-xs text-blue-400">Volume</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Funnel Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Sales Funnel</h3>
            <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded">Last 30 Days</button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-white">Agent Sentiment Trend</h3>
             <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span> Positive</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span> Negative</span>
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="positive" stroke="#4ade80" fillOpacity={1} fill="url(#colorPos)" strokeWidth={2} />
                <Area type="monotone" dataKey="negative" stroke="#f87171" fillOpacity={1} fill="url(#colorNeg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
           <h3 className="text-lg font-semibold text-white">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/50 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Units Sold</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {topProducts.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center italic text-slate-500">No sales data available. Seed demo data to view.</td></tr>
              )}
              {topProducts.map((product, i) => (
                <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center">
                    <div className="w-8 h-8 rounded bg-slate-700 mr-3 flex items-center justify-center font-bold text-xs">
                        {i+1}
                    </div>
                    {product.name}
                  </td>
                  <td className="px-6 py-4">{product.qty}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">${product.rev.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-green-400">
                        <Icons.TrendingUp />
                        <span className="ml-1">+{10 - i}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
