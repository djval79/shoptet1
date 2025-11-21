
import React, { useState, useRef } from 'react';
import { BusinessProfile, Expense } from '../types';
import { Icons } from '../constants';
import { analyzeReceipt } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpensesProps {
  business: BusinessProfile;
}

const MOCK_EXPENSES: Expense[] = [
    { id: 'exp_1', merchant: 'Uber', amount: 24.50, currency: '$', date: Date.now() - 86400000 * 2, category: 'Travel', status: 'approved', submittedBy: 'John Wick', receiptUrl: 'https://ui-avatars.com/api/?name=Receipt&background=random' },
    { id: 'exp_2', merchant: 'Adobe Creative Cloud', amount: 54.99, currency: '$', date: Date.now() - 86400000 * 15, category: 'Software', status: 'paid', submittedBy: 'Sarah Connor', receiptUrl: 'https://ui-avatars.com/api/?name=Adobe&background=ff0000&color=fff' },
    { id: 'exp_3', merchant: 'Staples', amount: 120.00, currency: '$', date: Date.now() - 86400000 * 5, category: 'Office Supplies', status: 'pending', submittedBy: 'Alice Walker' }
];

const Expenses: React.FC<ExpensesProps> = ({ business }) => {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currency = business.currencySymbol || '$';

  // Form State
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Stats
  const totalSpend = expenses.reduce((acc, e) => acc + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  
  // Chart Data
  const categoryData = Object.entries(expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
              const base64 = event.target?.result as string;
              setReceiptImage(base64);
              await processReceipt(base64);
          };
          reader.readAsDataURL(file);
      }
  };

  const processReceipt = async (base64: string) => {
      setIsProcessing(true);
      try {
          const result = await analyzeReceipt(base64);
          setMerchant(result.merchant || '');
          setAmount(result.amount?.toString() || '');
          setCategory(result.category || 'General');
          setDate(result.date || new Date().toISOString().split('T')[0]);
      } catch (e) {
          console.error("Receipt Scan Failed", e);
          alert("Could not scan receipt automatically. Please enter details manually.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSubmit = () => {
      if (!merchant || !amount) return;
      
      const newExpense: Expense = {
          id: `exp_${Date.now()}`,
          merchant,
          amount: parseFloat(amount),
          currency: currency,
          date: date ? new Date(date).getTime() : Date.now(),
          category,
          status: 'pending',
          submittedBy: 'You', // Mock current user
          receiptUrl: receiptImage || undefined
      };
      
      setExpenses([newExpense, ...expenses]);
      resetForm();
  };

  const resetForm = () => {
      setIsScanning(false);
      setMerchant('');
      setAmount('');
      setCategory('General');
      setDate('');
      setReceiptImage(null);
  };

  const handleApprove = (id: string) => {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
  };

  const handleReject = (id: string) => {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'paid': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
          default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses & Receipts</h2>
          <p className="text-slate-400">Track company spend and approve reimbursements.</p>
        </div>
        {!isScanning && (
            <button 
                onClick={() => setIsScanning(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> Scan Receipt
            </button>
        )}
      </div>

      {isScanning ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl animate-in slide-in-from-top-4 flex gap-8">
              {/* Left: Image Preview / Upload */}
              <div className="w-1/3 flex flex-col">
                  <div 
                    className="flex-1 bg-slate-900 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] cursor-pointer hover:border-blue-500 transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                      {receiptImage ? (
                          <img src={receiptImage} alt="Receipt" className="w-full h-full object-contain" />
                      ) : (
                          <div className="text-center p-6">
                              <div className="text-4xl mb-4 opacity-50 group-hover:scale-110 transition-transform">📸</div>
                              <p className="text-slate-400 text-sm font-bold">Click to Upload Receipt</p>
                              <p className="text-slate-500 text-xs mt-2">JPG, PNG supported</p>
                          </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/*"
                      />
                      {isProcessing && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <p className="text-blue-400 text-xs font-bold animate-pulse">AI Analyzing...</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Right: Form */}
              <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold text-white">Expense Details</h3>
                      <button onClick={resetForm} className="text-slate-400 hover:text-white">Cancel</button>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Merchant</label>
                          <input 
                            value={merchant}
                            onChange={e => setMerchant(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="e.g. Starbucks"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Amount</label>
                          <input 
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="0.00"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Date</label>
                          <input 
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Category</label>
                          <select 
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          >
                              <option>General</option>
                              <option>Travel</option>
                              <option>Meals</option>
                              <option>Office Supplies</option>
                              <option>Software</option>
                              <option>Marketing</option>
                          </select>
                      </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                      <button 
                        onClick={handleSubmit}
                        disabled={!merchant || !amount}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                      >
                          Submit Expense
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="flex flex-1 gap-6 overflow-hidden">
              {/* Stats & Chart */}
              <div className="w-80 flex flex-col gap-6">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Spend (YTD)</p>
                      <h3 className="text-3xl font-bold text-white">{currency}{totalSpend.toFixed(2)}</h3>
                  </div>
                  
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex-1 flex flex-col">
                      <h4 className="text-white font-bold text-sm mb-4">Spend by Category</h4>
                      <div className="flex-1 min-h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                      {categoryData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 mt-4">
                          {categoryData.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                      <span className="text-slate-300">{entry.name}</span>
                                  </div>
                                  <span className="text-white font-bold">{currency}{entry.value.toFixed(2)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Expense List */}
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                      <h3 className="font-bold text-white">Recent Expenses</h3>
                      {pendingCount > 0 && (
                          <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                              {pendingCount} Pending Approval
                          </span>
                      )}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0">
                              <tr>
                                  <th className="p-4">Merchant</th>
                                  <th className="p-4">Category</th>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">User</th>
                                  <th className="p-4 text-right">Amount</th>
                                  <th className="p-4 text-center">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                              {expenses.map(exp => (
                                  <tr key={exp.id} className="hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4 font-medium text-white">
                                          {exp.merchant}
                                          {exp.receiptUrl && <span className="ml-2 text-[10px] text-blue-400">📎</span>}
                                      </td>
                                      <td className="p-4 text-slate-300">{exp.category}</td>
                                      <td className="p-4 text-slate-500 text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                                      <td className="p-4 text-slate-300">{exp.submittedBy}</td>
                                      <td className="p-4 text-right font-mono text-white font-bold">{currency}{exp.amount.toFixed(2)}</td>
                                      <td className="p-4 text-center">
                                          <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${getStatusColor(exp.status)}`}>
                                              {exp.status}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                          {exp.status === 'pending' && (
                                              <div className="flex justify-end gap-2">
                                                  <button onClick={() => handleApprove(exp.id)} className="text-green-400 hover:text-green-300 text-xs font-bold">Approve</button>
                                                  <button onClick={() => handleReject(exp.id)} className="text-red-400 hover:text-red-300 text-xs">Reject</button>
                                              </div>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Expenses;
