
import React, { useState } from 'react';
import { BusinessProfile, Product, ProductVariant } from '../types';
import { Icons } from '../constants';

interface InventoryProps {
  business: BusinessProfile;
  onUpdate: (updatedBusiness: BusinessProfile) => void;
}

const Inventory: React.FC<InventoryProps> = ({ business, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const isShopifySynced = business.integrations?.shopify;
  const currency = business.currencySymbol || '$';
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stockLevel, setStockLevel] = useState('50');
  const [negotiable, setNegotiable] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [isService, setIsService] = useState(false);
  const [duration, setDuration] = useState('30');
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  
  // Variant State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOptions, setNewVariantOptions] = useState('');

  // Group products by category
  const groupedProducts = business.products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Calculate Low Stock Alerts
  const lowStockItems = business.products.filter(p => {
      if (p.isService || !p.stockLevel || !p.salesVelocity) return false;
      const daysLeft = p.stockLevel / p.salesVelocity;
      return daysLeft < 7; // Warning if < 1 week cover
  });

  const handleToggleStock = (productId: string) => {
    const updatedProducts = business.products.map(p => 
        p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    onUpdate({ ...business, products: updatedProducts });
  };

  const handleDelete = (productId: string) => {
    if (isShopifySynced) {
        alert("Cannot delete products manually while Shopify Sync is active. Please remove it from your Shopify Store.");
        return;
    }
    if (window.confirm("Are you sure you want to remove this product?")) {
        const updatedProducts = business.products.filter(p => p.id !== productId);
        onUpdate({ ...business, products: updatedProducts });
    }
  };

  const handleAddVariant = () => {
      if (!newVariantName || !newVariantOptions) return;
      const optionsList = newVariantOptions.split(',').map(o => o.trim()).filter(o => o);
      if (optionsList.length === 0) return;
      
      setVariants([...variants, { name: newVariantName, options: optionsList }]);
      setNewVariantName('');
      setNewVariantOptions('');
  };

  const removeVariant = (index: number) => {
      setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddProduct = () => {
    if (!name || !price) return;

    const newProduct: Product = {
        id: `prod_${Date.now()}`,
        name,
        price: parseFloat(price),
        description: desc,
        image: img || `https://picsum.photos/seed/${Date.now()}/300`,
        inStock: inStock,
        stockLevel: inStock ? parseInt(stockLevel) : 0,
        salesVelocity: Math.floor(Math.random() * 10) + 1, // Mock velocity
        negotiable: negotiable,
        minPrice: negotiable ? parseFloat(minPrice) : undefined,
        isService: isService,
        duration: isService ? parseInt(duration) : undefined,
        category: category || 'Uncategorized',
        relatedProductIds: relatedIds,
        variants: variants
    };

    onUpdate({ ...business, products: [...business.products, newProduct] });
    
    // Reset
    setIsAdding(false);
    setName('');
    setPrice('');
    setDesc('');
    setImg('');
    setCategory('');
    setInStock(true);
    setStockLevel('50');
    setNegotiable(false);
    setMinPrice('');
    setIsService(false);
    setRelatedIds([]);
    setVariants([]);
  };

  const toggleRelated = (id: string) => {
      if (relatedIds.includes(id)) {
          setRelatedIds(relatedIds.filter(rid => rid !== id));
      } else {
          setRelatedIds([...relatedIds, id]);
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white">Inventory & Catalog</h2>
            {isShopifySynced && (
                <span className="bg-green-900/30 border border-green-500/30 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> Synced with Shopify
                </span>
            )}
          </div>
          <p className="text-slate-400">Manage your products, stock levels, and categories.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          disabled={isShopifySynced}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center transition-colors"
        >
          <span className="mr-2"><Icons.Plus /></span> {isShopifySynced ? 'Managed in Shopify' : 'Add Product'}
        </button>
      </div>

      {/* Smart Forecasting Banner */}
      {lowStockItems.length > 0 && (
          <div className="mb-8 bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 flex items-start shadow-lg">
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400 mr-4 text-xl">
                  <Icons.TrendingUp />
              </div>
              <div className="flex-1">
                  <h3 className="text-orange-300 font-bold text-sm uppercase tracking-wide mb-1">AI Stock Forecast</h3>
                  <p className="text-slate-300 text-sm mb-2">Based on current sales velocity, you will stock out of the following items soon:</p>
                  <div className="flex gap-2 flex-wrap">
                      {lowStockItems.map(p => {
                          const daysLeft = Math.floor((p.stockLevel || 0) / (p.salesVelocity || 1));
                          return (
                            <div key={p.id} className="bg-slate-900/50 border border-orange-500/20 rounded px-3 py-1.5 flex items-center">
                                <span className="text-white text-xs font-bold mr-2">{p.name}</span>
                                <span className="text-orange-400 text-xs">{daysLeft} days left</span>
                            </div>
                          );
                      })}
                  </div>
              </div>
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold ml-4 shadow-md">
                  Generate PO
              </button>
          </div>
      )}

      {isAdding && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">New Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Product Name</label>
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                        placeholder="e.g. Wireless Headphones"
                    />
                </div>
                <div className="flex space-x-4">
                     <div className="flex-1">
                        <label className="block text-slate-400 text-sm mb-2">Price ({currency})</label>
                        <input 
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="0.00"
                        />
                     </div>
                     <div className="flex-1">
                        <label className="block text-slate-400 text-sm mb-2">Initial Stock</label>
                        <input 
                            type="number"
                            value={stockLevel}
                            onChange={e => setStockLevel(e.target.value)}
                            disabled={!inStock}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                            placeholder="50"
                        />
                     </div>
                     <div className="flex items-center pt-6">
                         <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={inStock} 
                                onChange={e => setInStock(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-white text-sm">Track Stock</span>
                         </label>
                     </div>
                </div>
                
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Category</label>
                    <input 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                        placeholder="e.g. Electronics, Summer Menu"
                    />
                    <div className="mt-2 flex gap-2 flex-wrap">
                         {(Object.keys(groupedProducts) as string[]).map(cat => (
                             <button key={cat} onClick={() => setCategory(cat)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded border border-slate-600">
                                 {cat}
                             </button>
                         ))}
                    </div>
                </div>

                {/* Service Toggle */}
                <div className="md:col-span-2 bg-slate-900/50 p-3 rounded border border-slate-700 flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isService} 
                            onChange={e => setIsService(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-purple-400 text-sm font-medium">Is this a Service?</span>
                    </label>
                    {isService && (
                         <div className="flex items-center">
                             <span className="text-slate-400 text-xs mr-2">Duration (mins):</span>
                             <input 
                                type="number"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                className="w-20 bg-slate-800 border border-slate-600 rounded p-1 text-white text-sm outline-none focus:border-purple-500"
                            />
                         </div>
                    )}
                </div>

                {/* Variants Section */}
                <div className="md:col-span-2 bg-slate-900/50 p-4 rounded border border-slate-700">
                    <label className="block text-slate-400 text-sm mb-3 font-bold flex items-center">
                        <span className="mr-2"><Icons.List /></span> Product Variants (Size, Color)
                    </label>
                    
                    <div className="flex gap-2 mb-3">
                        <input 
                            value={newVariantName}
                            onChange={e => setNewVariantName(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-1/3 outline-none"
                            placeholder="Name (e.g. Size)"
                        />
                        <input 
                            value={newVariantOptions}
                            onChange={e => setNewVariantOptions(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm flex-1 outline-none"
                            placeholder="Options (comma sep: S, M, L)"
                        />
                        <button 
                            onClick={handleAddVariant}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded text-sm"
                        >
                            Add
                        </button>
                    </div>

                    <div className="space-y-2">
                        {variants.map((v, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-600">
                                <div>
                                    <span className="text-white font-bold text-xs mr-2">{v.name}:</span>
                                    {v.options.map((opt, j) => (
                                        <span key={j} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded mr-1">{opt}</span>
                                    ))}
                                </div>
                                <button onClick={() => removeVariant(i)} className="text-slate-500 hover:text-red-400 text-xs">Remove</button>
                            </div>
                        ))}
                        {variants.length === 0 && <p className="text-xs text-slate-500 italic">No variants defined. Product is single SKU.</p>}
                    </div>
                </div>
                
                {/* Related Products Selector */}
                <div className="md:col-span-2 bg-slate-900/50 p-3 rounded border border-slate-700">
                    <label className="block text-slate-400 text-sm mb-2 font-bold">Related Products (Upsells)</label>
                    <p className="text-xs text-slate-500 mb-2">Select items the AI should recommend when buying this product.</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {business.products.map(p => (
                            <button
                                key={p.id}
                                onClick={() => toggleRelated(p.id)}
                                className={`text-xs px-2 py-1 rounded border flex items-center ${relatedIds.includes(p.id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {relatedIds.includes(p.id) && <span className="mr-1">✓</span>} {p.name}
                            </button>
                        ))}
                        {business.products.length === 0 && <span className="text-xs text-slate-600 italic">No other products available.</span>}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">Description</label>
                    <textarea 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                        rows={2}
                        placeholder="Short description for the catalog..."
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-2">Image URL</label>
                    <input 
                        value={img}
                        onChange={e => setImg(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                        placeholder="https://..."
                    />
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                    <label className="flex items-center cursor-pointer mb-3">
                        <input 
                            type="checkbox" 
                            checked={negotiable} 
                            onChange={e => setNegotiable(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className="ml-2 text-yellow-400 text-sm font-medium">Enable Haggling?</span>
                    </label>
                    {negotiable && (
                         <div>
                            <label className="block text-slate-400 text-xs mb-1">Minimum Acceptable Price ({currency})</label>
                            <input 
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-500"
                                placeholder="Lowest price AI can accept"
                            />
                         </div>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button 
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold"
                >
                    Save Product
                </button>
            </div>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedProducts).map(([catName, products]) => (
            <div key={catName}>
                 <div className="flex items-center mb-4">
                     <div className="h-px bg-slate-700 flex-1"></div>
                     <span className="px-4 text-slate-400 font-bold text-sm uppercase tracking-wider">{catName}</span>
                     <div className="h-px bg-slate-700 flex-1"></div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(products as Product[]).map(p => (
                        <div key={p.id} className={`bg-slate-800 rounded-xl border transition-all relative group overflow-hidden ${p.inStock === false ? 'border-red-900/50 opacity-70' : 'border-slate-700 hover:border-blue-500/50'}`}>
                            <div className="h-40 relative">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                    <h3 className="text-white font-bold text-lg leading-tight">{p.name}</h3>
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white font-bold text-sm">{currency}{p.price}</span>
                                </div>
                                {p.inStock === false ? (
                                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                        OUT OF STOCK
                                    </div>
                                ) : (
                                    <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur border border-slate-700">
                                        QTY: {p.stockLevel || '∞'}
                                    </div>
                                )}
                                
                                {p.negotiable && (
                                    <div className="absolute top-3 left-3 bg-yellow-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                                        Negotiable
                                    </div>
                                )}
                                {p.isService && (
                                    <div className="absolute top-3 left-3 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase flex items-center">
                                        <Icons.Calendar /> <span className="ml-1">Service ({p.duration}m)</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4">
                                <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">{p.description}</p>
                                
                                {p.variants && p.variants.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-1">
                                        {p.variants.map((v, i) => (
                                            <span key={i} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                                                {v.name}: {v.options.join('/')}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {p.relatedProductIds && p.relatedProductIds.length > 0 && (
                                    <div className="mb-4 text-xs text-slate-500">
                                        <span className="font-bold text-slate-400">Upsells:</span> {p.relatedProductIds.length} linked
                                    </div>
                                )}
                                
                                {p.salesVelocity && (
                                    <div className="mb-4 text-xs text-slate-500 flex justify-between">
                                        <span>Sales/Day: <span className="text-white font-bold">{p.salesVelocity}</span></span>
                                        <span>Cover: <span className={`font-bold ${(p.stockLevel || 0) / p.salesVelocity < 7 ? 'text-red-400' : 'text-green-400'}`}>
                                            {((p.stockLevel || 0) / p.salesVelocity).toFixed(1)} days
                                        </span></span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={p.inStock !== false}
                                                onChange={() => handleToggleStock(p.id)}
                                            />
                                            <div className={`block w-10 h-6 rounded-full ${p.inStock !== false ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${p.inStock !== false ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-3 text-xs text-slate-300 font-medium">{p.inStock !== false ? 'Active' : 'Inactive'}</span>
                                    </label>

                                    <button 
                                        onClick={() => handleDelete(p.id)}
                                        className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                                        disabled={isShopifySynced}
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        ))}
        {business.products.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                 <p className="text-slate-500">No products in catalog.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
