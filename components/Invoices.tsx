
import React, { useState } from 'react';
import { BusinessProfile, Invoice, InvoiceItem, Customer } from '../types';
import { Icons } from '../constants';

interface InvoicesProps {
  business: BusinessProfile;
  customers: Customer[];
  onUpdateInvoices?: (invoices: Invoice[]) => void; // Mocking parent update
}

// Mock Data
const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv_1',
        number: 'INV-001',
        customerId: 'cust_1',
        customerName: 'Alice Walker',
        issueDate: Date.now() - 86400000 * 5,
        dueDate: Date.now() + 86400000 * 2,
        items: [{ id: '1', description: 'Consulting Service', quantity: 2, unitPrice: 150 }],
        subtotal: 300,
        tax: 30,
        total: 330,
        status: 'sent',
        notes: 'Thank you for your business.'
    },
    {
        id: 'inv_2',
        number: 'INV-002',
        customerId: 'cust_2',
        customerName: 'Bob Builder',
        issueDate: Date.now() - 86400000 * 10,
        dueDate: Date.now() - 86400000,
        items: [{ id: '1', description: 'Bulk Coffee Order', quantity: 5, unitPrice: 20 }],
        subtotal: 100,
        tax: 10,
        total: 110,
        status: 'overdue'
    }
];

const Invoices: React.FC<InvoicesProps> = ({ business, customers }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isCreating, setIsCreating] = useState(false);
  const currency = business.currencySymbol || '$';

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-00${invoices.length + 1}`);
  const [items, setItems] = useState<InvoiceItem[]>([{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated Stats
  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

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

  const calculateTotals = () => {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = subtotal * 0.1; // 10% Tax Mock
      return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreate = () => {
      if (!selectedCustomerId || items.some(i => !i.description)) return;
      
      const customer = customers.find(c => c.id === selectedCustomerId);
      const { subtotal, tax, total } = calculateTotals();
      
      const newInvoice: Invoice = {
          id: `inv_${Date.now()}`,
          number: invoiceNumber,
          customerId: selectedCustomerId,
          customerName: customer?.name || 'Unknown',
          issueDate: Date.now(),
          dueDate: dueDate ? new Date(dueDate).getTime() : Date.now() + 86400000 * 7, // Default 7 days
          items: items,
          subtotal,
          tax,
          total,
          status: 'draft',
          notes
      };
      
      setInvoices([newInvoice, ...invoices]);
      setIsCreating(false);
      
      // Reset
      setItems([{ id: 'item_1', description: '', quantity: 1, unitPrice: 0 }]);
      setNotes('');
      setDueDate('');
      setSelectedCustomerId('');
      setInvoiceNumber(`INV-00${invoices.length + 2}`);
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
      if (confirm(`Send invoice ${invoice.number} to ${invoice.customerName} via WhatsApp?`)) {
          setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: 'sent' } : i));
          alert(`Invoice sent successfully! (Simulated)`);
      }
  };

  const handleMarkPaid = (invoice: Invoice) => {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: 'paid' } : i));
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'draft': return 'bg-slate-600 text-slate-300 border-slate-500';
          case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
          case 'cancelled': return 'bg-slate-700 text-slate-500 border-slate-600';
          default: return 'bg-slate-700 text-slate-300';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices & Quotes</h2>
          <p className="text-slate-400">Create and send professional invoices via WhatsApp.</p>
        </div>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> New Invoice
            </button>
        )}
      </div>

      {isCreating ? (
          <div className="flex flex-1 gap-8 overflow-hidden">
              {/* Editor */}
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 overflow-y-auto custom-scrollbar shadow-2xl">
                   <div className="flex justify-between items-start mb-8">
                       <div>
                           <h3 className="text-xl font-bold text-white">New Invoice</h3>
                           <p className="text-slate-400 text-sm">INV-{invoices.length + 1}</p>
                       </div>
                       <div className="flex space-x-3">
                           <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancel</button>
                           <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">Save Draft</button>
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                           <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Bill To</label>
                           <select 
                                value={selectedCustomerId}
                                onChange={e => setSelectedCustomerId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                           >
                               <option value="">Select Customer...</option>
                               {customers.map(c => (
                                   <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                               ))}
                           </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Date Issued</label>
                               <input type="date" disabled value={new Date().toISOString().split('T')[0]} className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-slate-500" />
                           </div>
                           <div>
                               <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Due Date</label>
                               <input 
                                    type="date" 
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500" 
                               />
                           </div>
                       </div>
                   </div>

                   <div className="mb-8">
                       <table className="w-full text-left mb-4">
                           <thead className="text-slate-400 text-xs uppercase border-b border-slate-700">
                               <tr>
                                   <th className="pb-2 w-[50%]">Item Description</th>
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
                                                placeholder="Service or Product Name"
                                                className="w-full bg-transparent text-white outline-none placeholder-slate-600"
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

                   <div className="flex justify-end mb-8">
                       <div className="w-64 space-y-3">
                           <div className="flex justify-between text-slate-400 text-sm">
                               <span>Subtotal</span>
                               <span>{currency}{calculateTotals().subtotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-slate-400 text-sm">
                               <span>Tax (10%)</span>
                               <span>{currency}{calculateTotals().tax.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-slate-700">
                               <span>Total Due</span>
                               <span>{currency}{calculateTotals().total.toFixed(2)}</span>
                           </div>
                       </div>
                   </div>

                   <div>
                       <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Notes / Terms</label>
                       <textarea 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-24"
                            placeholder="e.g. Payment due within 7 days."
                       />
                   </div>
              </div>

              {/* Preview */}
              <div className="w-[380px] bg-white rounded-lg shadow-2xl p-8 text-slate-800 flex flex-col overflow-y-auto hidden lg:flex">
                   <div className="mb-8">
                       <h1 className="text-3xl font-bold text-slate-900 mb-1">INVOICE</h1>
                       <p className="text-slate-500 text-sm font-mono">{invoiceNumber}</p>
                   </div>
                   
                   <div className="mb-8 text-sm">
                       <p className="font-bold text-slate-900">{business.name}</p>
                       <p className="text-slate-500">123 Business Rd.</p>
                   </div>

                   <div className="mb-8 text-sm">
                       <p className="text-slate-400 text-xs uppercase font-bold mb-1">Bill To</p>
                       <p className="font-bold text-slate-900">{customers.find(c => c.id === selectedCustomerId)?.name || 'Client Name'}</p>
                       <p className="text-slate-500">{customers.find(c => c.id === selectedCustomerId)?.phone || 'Phone Number'}</p>
                   </div>

                   <table className="w-full text-left text-sm mb-6">
                       <thead className="border-b border-slate-200">
                           <tr>
                               <th className="pb-2 font-bold text-slate-600">Item</th>
                               <th className="pb-2 text-right font-bold text-slate-600">Amt</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {items.map((item, i) => (
                               <tr key={i}>
                                   <td className="py-2">
                                       <div className="font-medium">{item.description || 'Item'}</div>
                                       <div className="text-xs text-slate-400">{item.quantity} x {currency}{item.unitPrice}</div>
                                   </td>
                                   <td className="py-2 text-right font-mono">
                                       {currency}{(item.quantity * item.unitPrice).toFixed(2)}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>

                   <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                       <span className="font-bold text-lg">Total</span>
                       <span className="font-bold text-xl font-mono">{currency}{calculateTotals().total.toFixed(2)}</span>
                   </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 border-b border-slate-700 bg-slate-900/50 divide-x divide-slate-700">
                  <div className="p-4 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Total Outstanding</span>
                      <span className="text-2xl font-bold text-white">{currency}{totalOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Overdue</span>
                      <span className="text-2xl font-bold text-red-400">{currency}{totalOverdue.toLocaleString()}</span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold">Paid (This Month)</span>
                      <span className="text-2xl font-bold text-green-400">{currency}{invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
                  </div>
              </div>

              {/* Invoice List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                          <tr>
                              <th className="p-4">Invoice #</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Issued</th>
                              <th className="p-4">Due</th>
                              <th className="p-4 text-right">Amount</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {invoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-mono text-slate-300">{inv.number}</td>
                                  <td className="p-4">
                                      <div className="font-medium text-white">{inv.customerName}</div>
                                  </td>
                                  <td className="p-4 text-slate-400 text-xs">
                                      {new Date(inv.issueDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-slate-400 text-xs">
                                      {new Date(inv.dueDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-right font-bold text-white font-mono">
                                      {currency}{inv.total.toLocaleString()}
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${getStatusColor(inv.status)}`}>
                                          {inv.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                                              <button 
                                                onClick={() => handleMarkPaid(inv)}
                                                className="p-1.5 text-slate-400 hover:text-green-400 rounded hover:bg-slate-700 transition-colors"
                                                title="Mark as Paid"
                                              >
                                                  <Icons.CreditCard />
                                              </button>
                                          )}
                                          <button 
                                            onClick={() => handleSendWhatsApp(inv)}
                                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-700 transition-colors"
                                            title="Send to WhatsApp"
                                          >
                                              <Icons.Send />
                                          </button>
                                          <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors">
                                              <Icons.Download />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {invoices.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                          No invoices found.
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Invoices;
