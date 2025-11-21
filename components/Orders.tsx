
import React from 'react';
import { Order, CartItem, BusinessProfile } from '../types';
import { Icons } from '../constants';

interface OrdersProps {
  orders: Order[];
  business?: BusinessProfile;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
}

const StatusColumn: React.FC<{ 
  title: string; 
  status: Order['status']; 
  orders: Order[]; 
  color: string;
  currency: string;
  onStatusUpdate: (id: string, s: Order['status']) => void; 
}> = ({ title, status, orders, color, currency, onStatusUpdate }) => {
  
  const filtered = orders.filter(o => o.status === status);

  return (
    <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col h-full min-h-[500px]">
      <div className={`p-4 border-b border-slate-700 ${color} bg-opacity-10 rounded-t-xl flex justify-between items-center`}>
        <h3 className={`font-bold ${color.replace('bg-', 'text-')}`}>{title}</h3>
        <span className="bg-slate-800 text-xs font-mono px-2 py-1 rounded text-slate-400">{filtered.length}</span>
      </div>
      <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                No orders
            </div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-white font-medium text-sm">{order.customerName}</h4>
                    <p className="text-xs text-slate-500">#{order.id.slice(-6)}</p>
                </div>
                <span className="text-green-400 font-bold text-sm">{currency}{order.total}</span>
            </div>
            <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                    </div>
                ))}
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-[10px] text-slate-500">{new Date(order.timestamp).toLocaleTimeString()}</span>
                <div className="flex space-x-1">
                    {status !== 'new' && (
                        <button 
                            onClick={() => onStatusUpdate(order.id, getPrevStatus(status))}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400" title="Move Back"
                        >
                            ←
                        </button>
                    )}
                     {status !== 'completed' && (
                        <button 
                             onClick={() => onStatusUpdate(order.id, getNextStatus(status))}
                             className="p-1 hover:bg-green-900/30 rounded text-green-400" title="Move Next"
                        >
                            →
                        </button>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getNextStatus = (current: Order['status']): Order['status'] => {
    if (current === 'new') return 'processing';
    if (current === 'processing') return 'shipped';
    return 'completed';
}

const getPrevStatus = (current: Order['status']): Order['status'] => {
    if (current === 'completed') return 'shipped';
    if (current === 'shipped') return 'processing';
    return 'new';
}

const Orders: React.FC<OrdersProps> = ({ orders, business, onStatusUpdate }) => {
  const currency = business?.currencySymbol || '$';

  const handleExportCSV = () => {
      if (orders.length === 0) return;
      
      const headers = ['Order ID', 'Customer', 'Status', 'Total', 'Date', 'Items'];
      const rows = orders.map(o => [
          o.id,
          o.customerName,
          o.status,
          o.total,
          new Date(o.timestamp).toLocaleDateString(),
          o.items.map(i => `${i.quantity}x ${i.name}`).join(' | ')
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Order Fulfillment</h2>
          <p className="text-slate-400">Track and process incoming WhatsApp orders.</p>
        </div>
        <button 
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 text-sm transition-colors"
        >
            Export CSV
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden pb-2">
        <StatusColumn 
            title="New Orders" 
            status="new" 
            orders={orders} 
            color="bg-blue-500" 
            currency={currency}
            onStatusUpdate={onStatusUpdate}
        />
        <StatusColumn 
            title="Preparing" 
            status="processing" 
            orders={orders} 
            color="bg-yellow-500" 
            currency={currency}
            onStatusUpdate={onStatusUpdate}
        />
        <StatusColumn 
            title="Shipped" 
            status="shipped" 
            orders={orders} 
            color="bg-purple-500" 
            currency={currency}
            onStatusUpdate={onStatusUpdate}
        />
         <StatusColumn 
            title="Delivered" 
            status="completed" 
            orders={orders} 
            color="bg-green-500" 
            currency={currency}
            onStatusUpdate={onStatusUpdate}
        />
      </div>
    </div>
  );
};

export default Orders;
