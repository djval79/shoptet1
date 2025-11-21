
import React, { useState } from 'react';
import { BusinessProfile, Contract, Customer } from '../types';
import { Icons } from '../constants';
import { generateLegalClauses } from '../services/geminiService';

interface ContractsProps {
  business: BusinessProfile;
  customers: Customer[];
}

// Mock Data
const MOCK_CONTRACTS: Contract[] = [
    {
        id: 'ctr_1',
        title: 'Service Level Agreement',
        customerId: 'cust_1',
        customerName: 'Alice Walker',
        status: 'sent',
        value: 12000,
        content: 'This agreement is between...',
        createdAt: Date.now() - 86400000 * 3
    },
    {
        id: 'ctr_2',
        title: 'NDA - Project X',
        customerId: 'cust_2',
        customerName: 'Bob Builder',
        status: 'signed',
        value: 0,
        content: 'Confidentiality agreement...',
        createdAt: Date.now() - 86400000 * 10,
        signedAt: Date.now() - 86400000 * 9,
        signatureUrl: 'https://ui-avatars.com/api/?name=Bob+Builder&length=1'
    }
];

const Contracts: React.FC<ContractsProps> = ({ business, customers }) => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const currency = business.currencySymbol || '$';

  // Form State
  const [title, setTitle] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [value, setValue] = useState('');
  const [content, setContent] = useState('');
  const [aiTopic, setAiTopic] = useState('');

  const handleGenerateClause = async () => {
      if (!aiTopic) return;
      setIsGenerating(true);
      try {
          const clause = await generateLegalClauses(aiTopic, business);
          setContent(prev => prev + (prev ? '\n\n' : '') + clause);
          setAiTopic('');
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSave = () => {
      if (!title || !selectedCustomer) return;
      
      const customer = customers.find(c => c.id === selectedCustomer);
      
      const newContract: Contract = {
          id: `ctr_${Date.now()}`,
          title,
          customerId: selectedCustomer,
          customerName: customer?.name || 'Unknown',
          status: 'draft',
          value: Number(value),
          content,
          createdAt: Date.now()
      };
      
      setContracts([newContract, ...contracts]);
      setIsCreating(false);
      
      // Reset
      setTitle('');
      setSelectedCustomer('');
      setValue('');
      setContent('');
      setAiTopic('');
  };

  const handleSend = (id: string) => {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'sent' } : c));
      alert("Contract link sent via WhatsApp!");
  };

  const handleMarkSigned = (id: string) => {
      setContracts(prev => prev.map(c => c.id === id ? { 
          ...c, 
          status: 'signed', 
          signedAt: Date.now(),
          signatureUrl: `https://ui-avatars.com/api/?name=Signed`
      } : c));
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'draft': return 'bg-slate-700 text-slate-300';
          case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'signed': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Contracts & E-Signatures</h2>
          <p className="text-slate-400">Draft, send, and track legal agreements.</p>
        </div>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> New Contract
            </button>
        )}
      </div>

      {isCreating ? (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Draft Agreement</h3>
                  <div className="flex space-x-3">
                      <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                      <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Save Draft</button>
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="col-span-2">
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Contract Title</label>
                      <input 
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          placeholder="e.g. Service Agreement 2025"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Value ({currency})</label>
                      <input 
                          type="number"
                          value={value}
                          onChange={e => setValue(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          placeholder="0.00"
                      />
                  </div>
              </div>

              <div className="mb-6">
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Customer</label>
                  <select 
                       value={selectedCustomer}
                       onChange={e => setSelectedCustomer(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                  >
                      <option value="">Select Customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>

              <div className="flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-slate-400 text-xs font-bold uppercase">Contract Terms</label>
                       <div className="flex items-center space-x-2">
                           <input 
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                placeholder="e.g. Non-Compete Clause"
                                className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white text-xs outline-none w-48"
                                onKeyDown={e => e.key === 'Enter' && handleGenerateClause()}
                           />
                           <button 
                                onClick={handleGenerateClause}
                                disabled={isGenerating || !aiTopic}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center disabled:opacity-50"
                           >
                               {isGenerating ? 'Writing...' : '✨ AI Draft Clause'}
                           </button>
                       </div>
                   </div>
                   <textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded p-4 text-slate-300 font-mono text-sm outline-none focus:border-blue-500 resize-none leading-relaxed"
                        placeholder="Enter contract terms here..."
                   />
              </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              {/* Stats */}
              <div className="grid grid-cols-3 border-b border-slate-700 bg-slate-900/50 divide-x divide-slate-700">
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Pending Signature</span>
                      <span className="text-2xl font-bold text-yellow-400 block mt-1">{contracts.filter(c => c.status === 'sent').length}</span>
                  </div>
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Signed (This Month)</span>
                      <span className="text-2xl font-bold text-green-400 block mt-1">{contracts.filter(c => c.status === 'signed').length}</span>
                  </div>
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Total Value</span>
                      <span className="text-2xl font-bold text-white block mt-1">{currency}{contracts.reduce((acc, c) => acc + (c.value || 0), 0).toLocaleString()}</span>
                  </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                          <tr>
                              <th className="p-4">Contract Title</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Date Created</th>
                              <th className="p-4 text-right">Value</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {contracts.map(c => (
                              <tr key={c.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-medium text-white">{c.title}</td>
                                  <td className="p-4 text-slate-300">{c.customerName}</td>
                                  <td className="p-4 text-slate-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                  <td className="p-4 text-right font-mono text-white font-bold">{currency}{c.value.toLocaleString()}</td>
                                  <td className="p-4 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${getStatusColor(c.status)}`}>
                                          {c.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                          {c.status === 'draft' && (
                                              <button 
                                                onClick={() => handleSend(c.id)}
                                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                                              >
                                                  Send
                                              </button>
                                          )}
                                          {c.status === 'sent' && (
                                              <button 
                                                onClick={() => handleMarkSigned(c.id)}
                                                className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
                                              >
                                                  Mark Signed
                                              </button>
                                          )}
                                          {c.status === 'signed' && (
                                              <button className="text-slate-400 hover:text-white p-1">
                                                  <Icons.Download />
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {contracts.length === 0 && (
                      <div className="text-center py-12 text-slate-500">No contracts found.</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Contracts;
