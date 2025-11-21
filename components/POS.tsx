
import React, { useState } from 'react';
import { BusinessProfile, Product, CartItem, Customer } from '../types';
import { Icons } from '../constants';

interface POSProps {
  business: BusinessProfile;
  customers: Customer[];
  onOrderPlaced: (items: CartItem[], total: number, customerId?: string) => void;
}

const POS: React.FC<POSProps> = ({ business, customers, onOrderPlaced }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('card');
  const [sendReceipt, setSendReceipt] = useState(true);

  const currency = business.currencySymbol || '$';

  const categories = ['All', ...Array.from(new Set(business.products.map(p => p.category || 'General')))];

  const filteredProducts = business.products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
      const existing = cart.find(i => i.id === product.id);
      if (existing) {
          setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
          setCart([...cart, { ...product, quantity: 1 }]);
      }
  };

  const removeFromCart = (id: string) => {
      setCart(cart.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
      setCart(cart.map(i => {
          if (i.id === id) {
              const newQty = Math.max(1, i.quantity + delta);
              return { ...i, quantity: newQty };
          }
          return i;
      }));
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const tax = subtotal * 0.1; // Mock tax
  const total = subtotal + tax;

  const handleCheckout = () => {
      if (cart.length === 0) return;
      
      onOrderPlaced(cart, total, selectedCustomer?.id);
      
      if (sendReceipt && selectedCustomer) {
          alert(`Receipt sent to ${selectedCustomer.name} via WhatsApp!`);
      } else if (sendReceipt && !selectedCustomer) {
           alert("Digital receipt requires a customer.");
      }
      
      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setIsCheckingOut(false);
      setPaymentMethod('card');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0f172a] animate-in fade-in">
      
      {/* Left: Products Grid */}
      <div className="flex-1 flex flex-col border-r border-slate-800">
          {/* Header & Filters */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900">
              <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-500"><Icons.Search /></span>
                  <input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500"
                  />
              </div>
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto max-w-md no-scrollbar">
                  {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 transition-all group relative active:scale-95"
                      >
                          <div className="aspect-square bg-slate-700 relative">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              {p.stockLevel !== undefined && p.stockLevel < 5 && (
                                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                      Low Stock: {p.stockLevel}
                                  </div>
                              )}
                          </div>
                          <div className="p-3">
                              <h4 className="text-white font-bold text-sm truncate">{p.name}</h4>
                              <p className="text-slate-400 text-xs">{currency}{p.price}</p>
                          </div>
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold shadow-lg text-xs">Add</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-96 bg-slate-900 flex flex-col border-l border-slate-800">
          {/* Customer Bar */}
          <div className="p-4 border-b border-slate-800">
              {selectedCustomer ? (
                  <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                              {selectedCustomer.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-white font-bold text-sm">{selectedCustomer.name}</p>
                              <p className="text-blue-300 text-xs">{selectedCustomer.loyaltyPoints || 0} pts</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedCustomer(null)} className="text-slate-500 hover:text-white">✕</button>
                  </div>
              ) : (
                  <div className="relative">
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-300 outline-none focus:border-blue-500 text-sm appearance-none"
                        onChange={(e) => {
                            const c = customers.find(cust => cust.id === e.target.value);
                            if (c) setSelectedCustomer(c);
                        }}
                        value=""
                      >
                          <option value="" disabled>Select Customer (Optional)</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                      </select>
                      <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">▼</div>
                  </div>
              )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <div className="text-4xl mb-2 opacity-50">🛒</div>
                      <p className="text-sm">Cart is empty</p>
                  </div>
              ) : (
                  cart.map(item => (
                      <div key={item.id} className="flex items-center bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                          <div className="w-10 h-10 rounded bg-slate-700 overflow-hidden mr-3">
                              <img src={item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1">
                              <h5 className="text-white font-medium text-sm truncate">{item.name}</h5>
                              <p className="text-slate-400 text-xs">{currency}{item.price}</p>
                          </div>
                          <div className="flex items-center bg-slate-900 rounded border border-slate-700">
                              <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-slate-400 hover:text-white">-</button>
                              <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-slate-400 hover:text-white">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="ml-2 text-slate-600 hover:text-red-500">✕</button>
                      </div>
                  ))
              )}
          </div>

          {/* Totals & Action */}
          <div className="p-6 bg-slate-800 border-t border-slate-700">
              <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>{currency}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                      <span>Tax (10%)</span>
                      <span>{currency}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-slate-700">
                      <span>Total</span>
                      <span>{currency}{total.toFixed(2)}</span>
                  </div>
              </div>

              {isCheckingOut ? (
                  <div className="animate-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                          <button 
                            onClick={() => setPaymentMethod('card')}
                            className={`py-2 rounded border text-xs font-bold flex flex-col items-center justify-center ${paymentMethod === 'card' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                          >
                              <span className="text-lg mb-1">💳</span> Card
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`py-2 rounded border text-xs font-bold flex flex-col items-center justify-center ${paymentMethod === 'cash' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                          >
                              <span className="text-lg mb-1">💵</span> Cash
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('qr')}
                            className={`py-2 rounded border text-xs font-bold flex flex-col items-center justify-center ${paymentMethod === 'qr' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                          >
                              <span className="text-lg mb-1">📱</span> QR
                          </button>
                      </div>
                      
                      <label className="flex items-center mb-4 cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={sendReceipt} 
                             onChange={e => setSendReceipt(e.target.checked)}
                             className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600"
                          />
                          <span className="ml-2 text-slate-300 text-xs">Send Receipt to WhatsApp</span>
                      </label>

                      <div className="flex gap-2">
                          <button onClick={() => setIsCheckingOut(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold">Cancel</button>
                          <button onClick={handleCheckout} className="flex-[2] bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg">
                              Confirm {currency}{total.toFixed(2)}
                          </button>
                      </div>
                  </div>
              ) : (
                  <button 
                    onClick={() => setIsCheckingOut(true)}
                    disabled={cart.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                  >
                      Charge {currency}{total.toFixed(2)}
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};

export default POS;
