
import React, { useState } from 'react';
import { BusinessProfile, Coupon } from '../types';
import { MOCK_COUPONS, Icons } from '../constants';

interface PromotionsProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Promotions: React.FC<PromotionsProps> = ({ business, onUpdate }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(business.promotions || MOCK_COUPONS);
  const [isCreating, setIsCreating] = useState(false);
  
  const currency = business.currencySymbol || '$';
  
  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<Coupon['type']>('percentage');
  const [value, setValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
      if (!code || !value) return;
      const newCoupon: Coupon = {
          id: `cpn_${Date.now()}`,
          code: code.toUpperCase(),
          type,
          value: Number(value),
          minSpend: Number(minSpend) || 0,
          description: desc,
          active: true,
          usageCount: 0
      };
      const updatedCoupons = [...coupons, newCoupon];
      setCoupons(updatedCoupons);
      onUpdate({ ...business, promotions: updatedCoupons });
      
      // Reset
      setIsCreating(false);
      setCode('');
      setValue('');
      setMinSpend('');
      setDesc('');
  };

  const toggleStatus = (id: string) => {
      const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
      setCoupons(updated);
      onUpdate({ ...business, promotions: updated });
  };

  const deleteCoupon = (id: string) => {
      if(confirm("Delete this coupon?")) {
          const updated = coupons.filter(c => c.id !== id);
          setCoupons(updated);
          onUpdate({ ...business, promotions: updated });
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Promotions & Coupons</h2>
          <p className="text-slate-400">Create discount codes for the AI agent to negotiate with.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
        >
            <span className="mr-2"><Icons.Plus /></span> Create Coupon
        </button>
      </div>

      {isCreating && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 animate-in slide-in-from-top-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">New Discount Code</h3>
              <div className="grid grid-cols-3 gap-6 mb-4">
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Coupon Code</label>
                      <input 
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SAVE20"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white uppercase font-mono outline-none focus:border-blue-500"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Type</label>
                      <select 
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                      >
                          <option value="percentage">Percentage Off (%)</option>
                          <option value="fixed">Fixed Amount ({currency})</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Value</label>
                      <input 
                        type="number"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="20"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                      />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Min Spend ({currency})</label>
                      <input 
                        type="number"
                        value={minSpend}
                        onChange={e => setMinSpend(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Description (Internal)</label>
                      <input 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        placeholder="For new customers only"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                      />
                  </div>
              </div>
              <div className="flex justify-end space-x-3">
                  <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold">Save Coupon</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
          {coupons.map(c => (
              <div key={c.id} className={`relative bg-[#efeae2] rounded-lg overflow-hidden shadow-lg transition-all ${!c.active ? 'opacity-60 grayscale' : ''}`}>
                  {/* Perforated edge effect */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-[#0f172a] rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-[#0f172a] rounded-full"></div>
                  
                  <div className="p-6 border-2 border-dashed border-slate-400/50 m-2 rounded-lg flex flex-col items-center text-center h-full">
                      <div className="text-slate-500 text-xs uppercase font-bold mb-1 tracking-widest">Voucher</div>
                      <h3 className="text-3xl font-black text-slate-800 mb-2">{c.type === 'percentage' ? `${c.value}%` : `${currency}${c.value}`}</h3>
                      <div className="bg-slate-800 text-white font-mono font-bold px-4 py-1 rounded text-lg mb-2 border-2 border-dashed border-slate-600">
                          {c.code}
                      </div>
                      <p className="text-slate-600 text-xs mb-4">{c.description}</p>
                      <div className="text-[10px] text-slate-500 space-y-1 mb-4">
                          <p>Min Spend: {currency}{c.minSpend}</p>
                          <p>Redeemed: {c.usageCount} times</p>
                      </div>
                      
                      <div className="mt-auto flex items-center space-x-3 w-full pt-4 border-t border-slate-300">
                          <button 
                            onClick={() => toggleStatus(c.id)}
                            className={`flex-1 py-1.5 rounded text-xs font-bold text-white ${c.active ? 'bg-slate-600 hover:bg-slate-700' : 'bg-green-600 hover:bg-green-500'}`}
                          >
                              {c.active ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => deleteCoupon(c.id)} className="text-slate-400 hover:text-red-500">
                              <Icons.Trash />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Promotions;
