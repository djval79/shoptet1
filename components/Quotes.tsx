
import React, { useState } from 'react';
import { BusinessProfile, Quote, InvoiceItem, Customer } from '../types';
import { Icons } from '../constants';
import { extractQuoteDetails } from '../services/geminiService';

interface QuotesProps {
  business: BusinessProfile;
  customers: Customer[];
}

// Mock Data
const MOCK_QUOTES: Quote[] = [
    {
        id: 'qt_1',
        number: 'QT-001',
        customerId: 'cust_1',
        customerName: 'Alice Walker',
        issueDate: Date.now() - 86400000 * 2,
        expiryDate: Date.now() + 86400000 * 5,
        items: [{ id: '1', description: 'Premium Consulting Package', quantity: 1, unitPrice: 500 }],
        subtotal: 500,
        total: 500,
        status: 'sent',
        notes: 'Valid for 7 days.'
    }
];

const Quotes: React.FC<QuotesProps> = ({ business, customers }) => {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const currency = business.currencySymbol || '$';

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`QT-00${quotes.length + 1}`);
  const [items, setItems] = useState<InvoiceItem[]>([{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState('');
  const [aiInput, setAiInput] = useState('');

  // Stats
  const pipelineValue = quotes.filter(q => q.status === 'sent' || q.status === 'draft').reduce((acc, q) => acc + q.total, 0);
  const acceptedValue = quotes.filter(q => q.status === 'accepted' || q.status === 'converted').reduce((acc, q) => acc + q.total, 0);

  const handleAddItem = () => {
      setItems([...items, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
  };

  const handleAiExtract = async () => {
      if (!aiInput) return;
      setIsGenerating(true);
      try {
          const result = await extractQuoteDetails(aiInput);
          const newItems = result.items.map((item: any, i: number) => ({
              id: `item_ai_${Date.now()}_${i}`,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice
          }));
          setItems(newItems);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const calculateTotal = () => {
      return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreate = () => {
      if (!selectedCustomerId) return;
      const customer = customers.find(c => c.id === selectedCustomerId);
      const total = calculateTotal();

      const newQuote: Quote = {
          id: `qt_${Date.now()}`,
          number: quoteNumber,
          customerId: selectedCustomerId,
          customerName: customer?.name || 'Unknown',
          issueDate: Date.now(),
          expiryDate: Date.now() + 86400000 * 7,
          items,
          subtotal: total,
          total,
          status: 'draft',
          notes
      };

      setQuotes([newQuote, ...quotes]);
      setIsCreating(false);
      resetForm();
  };

  const resetForm = () => {
      setItems([{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }]);
      setNotes('');
      setSelectedCustomerId('');
      setAiInput('');
      setQuoteNumber(`QT-00${quotes.length + 2}`);
  };

  const updateStatus = (id: string, status: Quote['status']) => {
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const sendToWhatsApp = (quote: Quote) => {
      updateStatus(quote.id, 'sent');
      alert(`Quote ${quote.number} sent to ${quote.customerName} via WhatsApp!`);
  };

  const convertToInvoice = (quote: Quote) => {
      updateStatus(quote.id, 'converted');
      alert(`Quote converted to Invoice! (See Invoices module)`);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'draft': return 'bg-slate-700 text-slate-300';
          case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
          case 'converted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quotes & Estimates</h2>
          <p className="text-slate-400">Create proposals and close deals faster.</p>
        </div>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> New Quote
            </button>
        )}
      </div>

      {isCreating ? (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 overflow-y-auto custom-scrollbar shadow-2xl">
               <div className="flex justify-between items-start mb-8">
                   <h3 className="text-xl font-bold text-white">Create Estimate</h3>
                   <div className="flex space-x-3">
                       <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancel</button>
                       <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Save Quote</button>
                   </div>
               </div>

               {/* AI Input */}
               <div className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl mb-8">
                   <label className="block text-purple-300 text-xs font-bold uppercase mb-2 flex items-center">
                       <Icons.Wand /> <span className="ml-2">AI Magic Fill</span>
                   </label>
                   <div className="flex gap-2">
                       <input 
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            placeholder="Paste chat notes e.g. 'Client wants 5 laptops and 2 monitors'"
                            className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-purple-500"
                            onKeyDown={e => e.key === 'Enter' && handleAiExtract()}
                       />
                       <button 
                            onClick={handleAiExtract}
                            disabled={isGenerating || !aiInput}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold text-xs disabled:opacity-50"
                       >
                           {isGenerating ? 'Parsing...' : 'Extract Items'}
                       </button>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-8 mb-8">
                   <div>
                       <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Customer</label>
                       <select 
                            value={selectedCustomerId}
                            onChange={e => setSelectedCustomerId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                       >
                           <option value="">Select Customer...</option>
                           {customers.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                           ))}
                       </select>
                   </div>
                   <div>
                       <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Quote Number</label>
                       <input 
                            value={quoteNumber}
                            onChange={e => setQuoteNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                       />
                   </div>
               </div>

               <div className="mb-8">
                   <table className="w-full text-left mb-4">
                       <thead className="text-slate-400 text-xs uppercase border-b border-slate-700">
                           <tr>
                               <th className="pb-2 w-[50%]">Description</th>
                               <th className="pb-2 w-[15%]">Qty</th>
                               <th className="pb-2 w-[20%]">Price</th>
                               <th className="pb-2 w-[10%] text-right">Total</th>
                               <th className="pb-2 w-[5%]"></th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-700">
                           {items.map((item, index) => (
                               <tr key={item.id}>
                                   <td className="py-3">
                                       <input 
                                            value={item.description}
                                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full bg-transparent text-white outline-none placeholder-slate-600"
                                            placeholder="Item Name"
                                       />
                                   </td>
                                   <td className="py-3">
                                       <input 
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                            className="w-full bg-transparent text-white outline-none"
                                       />
                                   </td>
                                   <td className="py-3">
                                       <input 
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                            className="w-full bg-transparent text-white outline-none"
                                            placeholder="0.00"
                                       />
                                   </td>
                                   <td className="py-3 text-right text-slate-300 font-mono">
                                       {currency}{(item.quantity * item.unitPrice).toFixed(2)}
                                   </td>
                                   <td className="py-3 text-right">
                                       <button onClick={() => handleRemoveItem(index)} className="text-slate-600 hover:text-red-500">✕</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                   <button onClick={handleAddItem} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center">
                       <Icons.Plus /> <span className="ml-1">Add Item</span>
                   </button>
               </div>

               <div className="flex justify-end">
                   <div className="w-64 border-t border-slate-700 pt-4 flex justify-between items-center">
                       <span className="text-white font-bold text-lg">Total Estimate</span>
                       <span className="text-white font-bold text-xl font-mono">{currency}{calculateTotal().toFixed(2)}</span>
                   </div>
               </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              {/* Stats */}
              <div className="grid grid-cols-3 border-b border-slate-700 bg-slate-900/50 divide-x divide-slate-700">
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Open Pipeline</span>
                      <span className="text-2xl font-bold text-blue-400 block mt-1">{currency}{pipelineValue.toLocaleString()}</span>
                  </div>
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Won / Accepted</span>
                      <span className="text-2xl font-bold text-green-400 block mt-1">{currency}{acceptedValue.toLocaleString()}</span>
                  </div>
                  <div className="p-4 text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Conversion Rate</span>
                      <span className="text-2xl font-bold text-white block mt-1">
                          {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'converted').length / quotes.length) * 100) : 0}%
                      </span>
                  </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                          <tr>
                              <th className="p-4">Quote #</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Date</th>
                              <th className="p-4 text-right">Total</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {quotes.map(q => (
                              <tr key={q.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-mono text-slate-300">{q.number}</td>
                                  <td className="p-4 font-medium text-white">{q.customerName}</td>
                                  <td className="p-4 text-slate-400 text-xs">{new Date(q.issueDate).toLocaleDateString()}</td>
                                  <td className="p-4 text-right font-bold text-white font-mono">{currency}{q.total.toLocaleString()}</td>
                                  <td className="p-4 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${getStatusColor(q.status)}`}>
                                          {q.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                          {q.status === 'draft' && (
                                              <button 
                                                onClick={() => sendToWhatsApp(q)}
                                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                                              >
                                                  Send
                                              </button>
                                          )}
                                          {(q.status === 'sent' || q.status === 'accepted') && (
                                              <button 
                                                onClick={() => convertToInvoice(q)}
                                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded"
                                              >
                                                  Convert
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {quotes.length === 0 && (
                      <div className="text-center py-12 text-slate-500">No quotes found.</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Quotes;
