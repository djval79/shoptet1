
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Customer, Order, Product } from '../types';
import { Icons } from '../constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  data?: {
      customers: Customer[];
      orders: Order[];
      products: Product[];
  };
}

interface CommandOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Help' | 'Customers' | 'Orders' | 'Products';
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, data }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Base Commands
  const navCommands: CommandOption[] = [
    { id: 'nav-dash', title: 'Dashboard', category: 'Navigation', icon: <Icons.TrendingUp />, action: () => onNavigate(AppView.DASHBOARD) },
    { id: 'nav-inbox', title: 'Inbox', subtitle: 'Live Chat', category: 'Navigation', icon: <Icons.Inbox />, action: () => onNavigate(AppView.INBOX) },
    { id: 'nav-orders', title: 'Orders', category: 'Navigation', icon: <Icons.Package />, action: () => onNavigate(AppView.ORDERS) },
    { id: 'nav-crm', title: 'CRM & Leads', category: 'Navigation', icon: <Icons.Contact />, action: () => onNavigate(AppView.CRM) },
    { id: 'nav-inv', title: 'Inventory', category: 'Navigation', icon: <Icons.Grid />, action: () => onNavigate(AppView.INVENTORY) },
    { id: 'nav-camp', title: 'Campaigns', category: 'Navigation', icon: <Icons.MegaphoneSolid />, action: () => onNavigate(AppView.CAMPAIGNS) },
    { id: 'nav-auto', title: 'Automations', category: 'Navigation', icon: <Icons.Workflow />, action: () => onNavigate(AppView.AUTOMATIONS) },
    { id: 'nav-sim', title: 'Simulator', subtitle: 'Test AI Agent', category: 'Navigation', icon: <Icons.MessageSquare />, action: () => onNavigate(AppView.SIMULATOR) },
    { id: 'nav-sett', title: 'Settings', category: 'Navigation', icon: <Icons.Settings />, action: () => onNavigate(AppView.SETTINGS) },
    
    { id: 'act-new-biz', title: 'Create New Business', category: 'Actions', icon: <Icons.Plus />, action: () => onNavigate(AppView.ONBOARDING) },
    { id: 'act-docs', title: 'Developer API Docs', category: 'Actions', icon: <Icons.Code />, action: () => onNavigate(AppView.DEVELOPER) },
  ];

  // Data Commands (Dynamic)
  const dataCommands: CommandOption[] = [];

  if (data && query.length > 1) {
      // Search Customers
      data.customers.forEach(c => {
          if (c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)) {
              dataCommands.push({
                  id: `cust-${c.id}`,
                  title: c.name,
                  subtitle: `${c.phone} • ${c.status.toUpperCase()}`,
                  icon: <Icons.User />,
                  category: 'Customers',
                  action: () => onNavigate(AppView.CRM) // Ideally open specific customer
              });
          }
      });

      // Search Orders
      data.orders.forEach(o => {
          if (o.id.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase())) {
              dataCommands.push({
                  id: `ord-${o.id}`,
                  title: `Order #${o.id.slice(-6)}`,
                  subtitle: `${o.customerName} • ${o.status.toUpperCase()}`,
                  icon: <Icons.Package />,
                  category: 'Orders',
                  action: () => onNavigate(AppView.ORDERS)
              });
          }
      });

      // Search Products
      data.products.forEach(p => {
          if (p.name.toLowerCase().includes(query.toLowerCase())) {
              dataCommands.push({
                  id: `prod-${p.id}`,
                  title: p.name,
                  subtitle: `${p.category} • $${p.price}`,
                  icon: <Icons.Tag />,
                  category: 'Products',
                  action: () => onNavigate(AppView.INVENTORY)
              });
          }
      });
  }

  const allCommands = [...navCommands, ...dataCommands];

  const filteredCommands = query.length > 1 
    ? allCommands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) || 
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query.toLowerCase()))
      )
    : navCommands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-slate-700 p-4">
          <span className="text-slate-400 mr-3"><Icons.Search /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search views, orders, customers..."
            className="flex-1 bg-transparent text-lg text-white placeholder-slate-500 outline-none"
          />
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">ESC</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
               {['Navigation', 'Actions', 'Customers', 'Orders', 'Products', 'Help'].map(category => {
                 const categoryCommands = filteredCommands.filter(c => c.category === category);
                 if (categoryCommands.length === 0) return null;
                 
                 return (
                   <div key={category}>
                     <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900 z-10">{category}</div>
                     {categoryCommands.map((cmd) => {
                       const index = filteredCommands.indexOf(cmd);
                       return (
                         <div
                           key={cmd.id}
                           onClick={() => { cmd.action(); onClose(); }}
                           onMouseEnter={() => setActiveIndex(index)}
                           className={`flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors ${activeIndex === index ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                         >
                           <div className={`mr-3 ${activeIndex === index ? 'text-white' : 'text-slate-400'}`}>
                             {cmd.icon}
                           </div>
                           <div className="flex-1">
                             <div className="font-medium">{cmd.title}</div>
                             {cmd.subtitle && <div className={`text-xs ${activeIndex === index ? 'text-blue-200' : 'text-slate-500'}`}>{cmd.subtitle}</div>}
                           </div>
                           {activeIndex === index && (
                             <span className="text-xs text-blue-200">↵</span>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 );
               })}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 p-2 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500 px-4">
           <span><strong>↑↓</strong> to navigate</span>
           <span><strong>↵</strong> to select</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
