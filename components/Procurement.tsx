
import React, { useState } from 'react';
import { BusinessProfile, Supplier, PurchaseOrder, POItem, Product } from '../types';
import { Icons } from '../constants';

interface ProcurementProps {
  business: BusinessProfile;
  onUpdateBusiness: (updated: BusinessProfile) => void;
}

const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup_1', name: 'Global Coffee Imports', contactName: 'Juan Valdez', email: 'juan@globalcoffee.com', phone: '+1 555 0192', leadTime: 5, rating: 4.8 },
    { id: 'sup_2', name: 'TechWholesale Ltd', contactName: 'Sarah Connor', email: 'sarah@techwholesale.com', phone: '+1 555 2299', leadTime: 3, rating: 4.2 },
    { id: 'sup_3', name: 'Packaging Pros', contactName: 'Mike Box', email: 'mike@packaging.com', phone: '+1 555 3388', leadTime: 2, rating: 4.5 }
];

const MOCK_POS: PurchaseOrder[] = [
    { 
        id: 'po_101', 
        supplierId: 'sup_1', 
        supplierName: 'Global Coffee Imports', 
        status: 'received', 
        items: [{ productId: 'p1', productName: 'Neon Espresso', quantity: 500, unitCost: 2.5 }], 
        totalCost: 1250, 
        dateCreated: Date.now() - 86400000 * 10 
    }
];

const Procurement: React.FC<ProcurementProps> = ({ business, onUpdateBusiness }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'orders'>('dashboard');
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_POS);
  
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  
  const currency = business.currencySymbol || '$';

  // New Supplier Form
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ rating: 5, leadTime: 3 });
  
  // New PO Form
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [poNotes, setPoNotes] = useState('');

  // Analytics
  const pendingOrders = purchaseOrders.filter(p => p.status === 'ordered').length;
  const lowStockItems = business.products.filter(p => !p.isService && p.stockLevel !== undefined && p.stockLevel < 20);

  const handleAddSupplier = () => {
      if (!newSupplier.name || !newSupplier.email) return;
      const supplier: Supplier = {
          id: `sup_${Date.now()}`,
          name: newSupplier.name,
          contactName: newSupplier.contactName || '',
          email: newSupplier.email,
          phone: newSupplier.phone || '',
          leadTime: newSupplier.leadTime || 3,
          rating: newSupplier.rating || 5
      };
      setSuppliers([...suppliers, supplier]);
      setIsAddingSupplier(false);
      setNewSupplier({ rating: 5, leadTime: 3 });
  };

  const handleAddItemToPO = (productId: string) => {
      const product = business.products.find(p => p.id === productId);
      if (!product) return;
      
      // Check if already added
      if (poItems.find(i => i.productId === productId)) return;

      const item: POItem = {
          productId,
          productName: product.name,
          quantity: 50, // Default reorder qty
          unitCost: product.price * 0.6 // Assume 40% margin cost
      };
      setPoItems([...poItems, item]);
  };

  const updatePoItem = (index: number, field: keyof POItem, value: any) => {
      const updated = [...poItems];
      updated[index] = { ...updated[index], [field]: value };
      setPoItems(updated);
  };

  const removePoItem = (index: number) => {
      setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleCreatePO = () => {
      if (!poSupplierId || poItems.length === 0) return;
      const supplier = suppliers.find(s => s.id === poSupplierId);
      const totalCost = poItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
      
      const po: PurchaseOrder = {
          id: `po_${Date.now()}`,
          supplierId: poSupplierId,
          supplierName: supplier?.name || 'Unknown',
          status: 'ordered',
          items: poItems,
          totalCost,
          dateCreated: Date.now(),
          dateExpected: Date.now() + (86400000 * (supplier?.leadTime || 3)),
          notes: poNotes
      };
      
      setPurchaseOrders([po, ...purchaseOrders]);
      setIsCreatingPO(false);
      setPoSupplierId('');
      setPoItems([]);
      setPoNotes('');
  };

  const handleReceiveStock = (poId: string) => {
      const po = purchaseOrders.find(p => p.id === poId);
      if (!po || po.status === 'received') return;
      
      // 1. Update PO Status
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'received' } : p));
      
      // 2. Update Inventory
      const updatedProducts = business.products.map(prod => {
          const poItem = po.items.find(i => i.productId === prod.id);
          if (poItem) {
              return { ...prod, stockLevel: (prod.stockLevel || 0) + poItem.quantity };
          }
          return prod;
      });
      
      onUpdateBusiness({ ...business, products: updatedProducts });
      alert(`Stock updated! Received ${po.items.reduce((acc,i)=>acc+i.quantity,0)} items.`);
  };

  const handleAutoRestock = () => {
      // Auto-select first supplier and add all low stock items
      if (suppliers.length === 0) {
          alert("Add a supplier first.");
          return;
      }
      if (lowStockItems.length === 0) {
          alert("Stock levels look healthy. No suggestions.");
          return;
      }
      
      setIsCreatingPO(true);
      setPoSupplierId(suppliers[0].id);
      
      const suggestedItems = lowStockItems.map(p => ({
          productId: p.id,
          productName: p.name,
          quantity: Math.max(50, (p.salesVelocity || 1) * 14), // Order 2 weeks of stock
          unitCost: p.price * 0.6
      }));
      setPoItems(suggestedItems);
  };

  const renderStatusBadge = (status: string) => {
      switch(status) {
          case 'draft': return <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] uppercase font-bold">Draft</span>;
          case 'ordered': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] uppercase font-bold border border-blue-500/30">Ordered</span>;
          case 'received': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold border border-green-500/30">Received</span>;
          case 'cancelled': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] uppercase font-bold border border-red-500/30">Cancelled</span>;
          default: return null;
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Procurement</h2>
          <p className="text-slate-400">Manage suppliers and restocking.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Purchase Orders
            </button>
            <button 
                onClick={() => setActiveTab('suppliers')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'suppliers' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Suppliers
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'dashboard' && (
              <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Low Stock Items</p>
                          <h3 className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{lowStockItems.length}</h3>
                          <p className="text-xs text-slate-500 mt-1">Require attention</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Pending Deliveries</p>
                          <h3 className="text-3xl font-bold text-blue-400">{pendingOrders}</h3>
                          <p className="text-xs text-slate-500 mt-1">In transit</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Spend (YTD)</p>
                          <h3 className="text-3xl font-bold text-white">{currency}{purchaseOrders.reduce((acc, p) => acc + p.totalCost, 0).toLocaleString()}</h3>
                      </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 flex items-center justify-between">
                      <div>
                          <h4 className="text-lg font-bold text-white">AI Restock Suggestion</h4>
                          <p className="text-blue-200/70 text-sm mt-1">
                              We analyzed your sales velocity. {lowStockItems.length} items are at risk of stocking out in 7 days.
                          </p>
                      </div>
                      <button 
                        onClick={handleAutoRestock}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center"
                      >
                          <span className="mr-2">✨</span> Create Smart PO
                      </button>
                  </div>
              </div>
          )}

          {activeTab === 'suppliers' && (
              <div className="p-6 flex flex-col h-full">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-white">Vendor Directory</h3>
                       <button onClick={() => setIsAddingSupplier(true)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm flex items-center">
                           <Icons.Plus /> <span className="ml-1">Add Supplier</span>
                       </button>
                   </div>

                   {isAddingSupplier && (
                       <div className="bg-slate-900 p-4 rounded-lg border border-slate-600 mb-4 animate-in slide-in-from-top-2">
                           <div className="grid grid-cols-2 gap-4 mb-4">
                               <input 
                                    placeholder="Company Name"
                                    className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                    value={newSupplier.name || ''}
                                    onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                               />
                               <input 
                                    placeholder="Contact Person"
                                    className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                    value={newSupplier.contactName || ''}
                                    onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})}
                               />
                               <input 
                                    placeholder="Email"
                                    className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                    value={newSupplier.email || ''}
                                    onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                               />
                               <input 
                                    placeholder="Lead Time (Days)"
                                    type="number"
                                    className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                                    value={newSupplier.leadTime || ''}
                                    onChange={e => setNewSupplier({...newSupplier, leadTime: parseInt(e.target.value)})}
                               />
                           </div>
                           <div className="flex justify-end gap-2">
                               <button onClick={() => setIsAddingSupplier(false)} className="text-slate-400 hover:text-white text-sm px-3">Cancel</button>
                               <button onClick={handleAddSupplier} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold">Save</button>
                           </div>
                       </div>
                   )}

                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                               <tr>
                                   <th className="p-4">Supplier</th>
                                   <th className="p-4">Contact</th>
                                   <th className="p-4">Lead Time</th>
                                   <th className="p-4">Rating</th>
                                   <th className="p-4 text-right">Action</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700">
                               {suppliers.map(s => (
                                   <tr key={s.id} className="hover:bg-slate-700/30">
                                       <td className="p-4 font-medium text-white">{s.name}</td>
                                       <td className="p-4">
                                           <div className="text-white">{s.contactName}</div>
                                           <div className="text-xs text-slate-500">{s.email}</div>
                                       </td>
                                       <td className="p-4 text-slate-300">{s.leadTime} Days</td>
                                       <td className="p-4 text-yellow-400">{'★'.repeat(Math.round(s.rating))}</td>
                                       <td className="p-4 text-right">
                                           <button className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
              </div>
          )}

          {activeTab === 'orders' && (
              <div className="p-6 flex flex-col h-full">
                  {isCreatingPO ? (
                      <div className="flex flex-col h-full">
                          <div className="flex justify-between items-center mb-6">
                               <h3 className="font-bold text-white text-lg">Create Purchase Order</h3>
                               <div className="flex gap-2">
                                   <button onClick={() => setIsCreatingPO(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                                   <button onClick={handleCreatePO} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold">Confirm Order</button>
                               </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 mb-6">
                               <div>
                                   <label className="block text-slate-400 text-xs font-bold mb-2">Supplier</label>
                                   <select 
                                        value={poSupplierId} 
                                        onChange={e => setPoSupplierId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                                   >
                                       <option value="">Select Supplier...</option>
                                       {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-slate-400 text-xs font-bold mb-2">Notes</label>
                                   <input 
                                        value={poNotes}
                                        onChange={e => setPoNotes(e.target.value)}
                                        placeholder="PO Ref / Instructions"
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                                   />
                               </div>
                               <div className="flex items-end">
                                   <div className="text-right w-full">
                                       <span className="text-xs text-slate-400 uppercase font-bold block">Total Cost</span>
                                       <span className="text-2xl font-bold text-white">{currency}{poItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0).toFixed(2)}</span>
                                   </div>
                               </div>
                          </div>

                          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 p-4 overflow-y-auto custom-scrollbar mb-4">
                               <table className="w-full text-left text-sm">
                                   <thead className="text-slate-500 text-xs uppercase border-b border-slate-700">
                                       <tr>
                                           <th className="pb-2">Product</th>
                                           <th className="pb-2 w-24">Qty</th>
                                           <th className="pb-2 w-24">Unit Cost</th>
                                           <th className="pb-2 w-24 text-right">Total</th>
                                           <th className="pb-2 w-10"></th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-700">
                                       {poItems.map((item, i) => (
                                           <tr key={i}>
                                               <td className="py-2 text-white">{item.productName}</td>
                                               <td className="py-2">
                                                   <input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={e => updatePoItem(i, 'quantity', parseInt(e.target.value))}
                                                        className="w-16 bg-slate-800 border border-slate-600 rounded p-1 text-white text-center"
                                                   />
                                               </td>
                                               <td className="py-2">
                                                   <input 
                                                        type="number" 
                                                        value={item.unitCost}
                                                        onChange={e => updatePoItem(i, 'unitCost', parseFloat(e.target.value))}
                                                        className="w-16 bg-slate-800 border border-slate-600 rounded p-1 text-white text-center"
                                                   />
                                               </td>
                                               <td className="py-2 text-right font-mono text-slate-300">
                                                   {currency}{(item.quantity * item.unitCost).toFixed(2)}
                                               </td>
                                               <td className="py-2 text-right">
                                                   <button onClick={() => removePoItem(i)} className="text-slate-500 hover:text-red-400">✕</button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-2">
                               {business.products.map(p => (
                                   <button 
                                        key={p.id} 
                                        onClick={() => handleAddItemToPO(p.id)}
                                        className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded border border-slate-600"
                                   >
                                       + {p.name}
                                   </button>
                               ))}
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col h-full">
                          <div className="flex justify-between items-center mb-4">
                               <h3 className="font-bold text-white">Order History</h3>
                               <button onClick={() => setIsCreatingPO(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center">
                                   <Icons.Plus /> <span className="ml-1">New Order</span>
                               </button>
                           </div>
                           <div className="flex-1 overflow-y-auto custom-scrollbar">
                               <table className="w-full text-left text-sm">
                                   <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                                       <tr>
                                           <th className="p-4">PO #</th>
                                           <th className="p-4">Supplier</th>
                                           <th className="p-4">Date</th>
                                           <th className="p-4">Status</th>
                                           <th className="p-4">Total</th>
                                           <th className="p-4 text-right">Action</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-700">
                                       {purchaseOrders.map(po => (
                                           <tr key={po.id} className="hover:bg-slate-700/30 transition-colors">
                                               <td className="p-4 font-mono text-slate-300 text-xs">{po.id}</td>
                                               <td className="p-4 font-medium text-white">{po.supplierName}</td>
                                               <td className="p-4 text-slate-400 text-xs">{new Date(po.dateCreated).toLocaleDateString()}</td>
                                               <td className="p-4">{renderStatusBadge(po.status)}</td>
                                               <td className="p-4 font-mono text-white font-bold">{currency}{po.totalCost.toLocaleString()}</td>
                                               <td className="p-4 text-right">
                                                   {po.status === 'ordered' && (
                                                       <button 
                                                            onClick={() => handleReceiveStock(po.id)}
                                                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded font-bold"
                                                       >
                                                           Receive Stock
                                                       </button>
                                                   )}
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default Procurement;
