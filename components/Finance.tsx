
import React, { useState } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { Icons } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinanceProps {
  business: BusinessProfile;
  transactions: Transaction[];
  onUpdateTransactions: (transactions: Transaction[]) => void;
}

const Finance: React.FC<FinanceProps> = ({ business, transactions, onUpdateTransactions }) => {
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const currency = business.currencySymbol || '$';

  // Calculated Balances
  const availableBalance = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingBalance = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Chart Data
  const data = [
      { name: 'Day 1', income: 400 },
      { name: 'Day 2', income: 300 },
      { name: 'Day 3', income: 550 },
      { name: 'Day 4', income: 450 },
      { name: 'Day 5', income: 700 },
      { name: 'Day 6', income: 600 },
      { name: 'Today', income: availableBalance > 0 ? availableBalance : 200 }
  ];

  const handlePayout = () => {
      if (availableBalance <= 0) return;
      setIsPayoutLoading(true);
      setTimeout(() => {
          const payout: Transaction = {
              id: `txn_po_${Date.now()}`,
              type: 'payout',
              amount: -availableBalance,
              status: 'completed',
              date: Date.now(),
              description: `Payout to Bank ****${Math.floor(Math.random() * 9000) + 1000}`
          };
          onUpdateTransactions([payout, ...transactions]);
          setIsPayoutLoading(false);
          alert(`Successfully transferred ${currency}${availableBalance.toFixed(2)} to your bank account.`);
      }, 2000);
  };

  const handleDownloadInvoice = (id: string) => {
      alert(`Downloading invoice for transaction ${id}... (Simulated)`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Finance & Payouts</h2>
          <p className="text-slate-400">Manage your revenue, request payouts, and view transaction history.</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-2 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Stripe Connected</span>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Available Balance</p>
              <div className="flex justify-between items-end">
                  <h3 className="text-4xl font-bold text-white">{currency}{availableBalance.toFixed(2)}</h3>
                  <div className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">+12%</div>
              </div>
              <div className="mt-6">
                  <button 
                    onClick={handlePayout}
                    disabled={isPayoutLoading || availableBalance <= 0}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-lg font-bold transition-all shadow-lg flex justify-center items-center"
                  >
                      {isPayoutLoading ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                             Processing...
                          </>
                      ) : 'Withdraw Funds'}
                  </button>
              </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <p className="text-slate-400 text-xs uppercase font-bold mb-2">Pending Clearing</p>
              <h3 className="text-3xl font-bold text-slate-300 mb-1">{currency}{pendingBalance.toFixed(2)}</h3>
              <p className="text-xs text-slate-500 mb-6">Estimated available in 2 days</p>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-1/3"></div>
              </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Icons.TrendingUp />
              </div>
              <p className="text-slate-400 text-xs uppercase font-bold mb-4">7-Day Revenue</p>
              <div className="h-32 -mx-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={data}>
                           <defs>
                               <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                           <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white">Recent Transactions</h3>
              <div className="flex space-x-2">
                   <select className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 outline-none">
                       <option>All Types</option>
                       <option>Payments</option>
                       <option>Payouts</option>
                       <option>Refunds</option>
                   </select>
                   <button className="text-xs bg-slate-800 border border-slate-600 text-white px-3 py-1 rounded hover:bg-slate-700 transition-colors">
                       Export CSV
                   </button>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                      <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Receipt</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {transactions.map(txn => (
                          <tr key={txn.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="p-4 text-slate-400 text-xs font-mono">
                                  {new Date(txn.date).toLocaleDateString()} <span className="opacity-50">{new Date(txn.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                              </td>
                              <td className="p-4">
                                  <div className="flex items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs ${
                                          txn.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                                          txn.type === 'payout' ? 'bg-blue-500/20 text-blue-400' :
                                          txn.type === 'refund' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                          {txn.type === 'payment' && '↓'}
                                          {txn.type === 'payout' && '↑'}
                                          {txn.type === 'refund' && 'R'}
                                          {txn.type === 'fee' && '%'}
                                      </div>
                                      <div>
                                          <div className="text-white font-medium">{txn.description}</div>
                                          {txn.reference && <div className="text-xs text-slate-500 font-mono">Ref: {txn.reference}</div>}
                                      </div>
                                  </div>
                              </td>
                              <td className={`p-4 font-mono font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                                  {txn.amount > 0 ? '+' : ''}{currency}{Math.abs(txn.amount).toFixed(2)}
                              </td>
                              <td className="p-4">
                                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${
                                      txn.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                      txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                      'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
                                      {txn.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                    onClick={() => handleDownloadInvoice(txn.id)}
                                    className="text-slate-500 hover:text-blue-400 transition-colors p-1" title="Download Invoice"
                                  >
                                      <Icons.Download />
                                  </button>
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

export default Finance;
