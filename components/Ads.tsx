
import React, { useState } from 'react';
import { BusinessProfile, Ad, Product } from '../types';
import { MOCK_ADS, Icons } from '../constants';
import { generateAdCopy, generateBusinessImage } from '../services/geminiService';

interface AdsProps {
  business: BusinessProfile;
  onUpdate: (updatedBusiness: BusinessProfile) => void;
}

const Ads: React.FC<AdsProps> = ({ business, onUpdate }) => {
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [platform, setPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [headline, setHeadline] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [budget, setBudget] = useState('50');

  const handleMagicCreate = async () => {
      if (!selectedProduct) {
          alert("Select a product first!");
          return;
      }
      setIsGenerating(true);
      try {
          const product = business.products.find(p => p.id === selectedProduct);
          if (!product) return;

          // 1. Generate Text
          const copy = await generateAdCopy(business, product, platform);
          setHeadline(copy.headline);
          setPrimaryText(copy.primaryText);

          // 2. Generate Image
          const imgPrompt = `High quality professional advertising photo for ${product.name}, ${product.description}. Minimalist, clean background.`;
          const base64 = await generateBusinessImage(imgPrompt);
          setMediaUrl(`data:image/jpeg;base64,${base64}`);
          
      } catch (e) {
          console.error(e);
          alert("AI Generation failed. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSave = () => {
      if (!headline || !mediaUrl) return;
      
      const product = business.products.find(p => p.id === selectedProduct);
      
      const newAd: Ad = {
          id: `ad_${Date.now()}`,
          name: product ? `Promo: ${product.name}` : 'New Ad',
          platform,
          status: 'active',
          headline,
          primaryText,
          mediaUrl,
          productName: product?.name,
          budget: Number(budget),
          spent: 0,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          createdAt: Date.now()
      };

      setAds([newAd, ...ads]);
      setIsCreating(false);
      
      // Reset
      setHeadline('');
      setPrimaryText('');
      setMediaUrl('');
      setSelectedProduct('');
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'active': return 'bg-green-500/20 text-green-400';
          case 'paused': return 'bg-yellow-500/20 text-yellow-400';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Click-to-WhatsApp Ads</h2>
          <p className="text-slate-400">Acquire new customers from Facebook & Instagram.</p>
        </div>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> Create Ad
            </button>
        )}
      </div>

      {isCreating ? (
          <div className="flex flex-1 gap-8 overflow-hidden">
              {/* Left: Editor */}
              <div className="w-1/2 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">Ad Creator</h3>
                      <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">Cancel</button>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Platform</label>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => setPlatform('facebook')}
                                className={`flex-1 py-2 rounded border text-sm font-bold ${platform === 'facebook' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                              >
                                  Facebook
                              </button>
                              <button 
                                onClick={() => setPlatform('instagram')}
                                className={`flex-1 py-2 rounded border text-sm font-bold ${platform === 'instagram' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                              >
                                  Instagram
                              </button>
                          </div>
                      </div>

                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                          <div className="flex justify-between items-center mb-3">
                              <label className="block text-slate-300 text-sm font-bold">AI Creative Studio</label>
                          </div>
                          <div className="flex gap-2">
                              <select 
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                              >
                                  <option value="">Select Product to Promote...</option>
                                  {business.products.map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                              </select>
                              <button 
                                onClick={handleMagicCreate}
                                disabled={isGenerating || !selectedProduct}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold text-xs disabled:opacity-50 flex items-center"
                              >
                                  {isGenerating ? 'Generating...' : '✨ Auto-Generate'}
                              </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2">Gemini will write the copy and generate a unique image for this product.</p>
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Primary Text</label>
                          <textarea 
                            value={primaryText}
                            onChange={e => setPrimaryText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-24 text-sm"
                            placeholder="Enter the main ad text..."
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Headline</label>
                          <input 
                            value={headline}
                            onChange={e => setHeadline(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="Chat with us on WhatsApp"
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Media URL</label>
                          <input 
                            value={mediaUrl}
                            onChange={e => setMediaUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-sm"
                            placeholder="https://..."
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Daily Budget ($)</label>
                          <input 
                            type="number"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>

                      <div className="pt-4 border-t border-slate-700 flex justify-end">
                          <button 
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                          >
                              Launch Campaign
                          </button>
                      </div>
                  </div>
              </div>

              {/* Right: Preview */}
              <div className="flex-1 bg-[#f0f2f5] rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                   <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase">Live Preview</div>
                   
                   {/* Facebook Feed Card */}
                   {platform === 'facebook' && (
                       <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-[380px] overflow-hidden">
                           <div className="p-3 flex items-center">
                               <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
                                   <img src={`https://ui-avatars.com/api/?name=${business.name}&background=random`} alt="" />
                               </div>
                               <div>
                                   <h4 className="font-bold text-sm text-gray-900">{business.name}</h4>
                                   <p className="text-xs text-gray-500">Sponsored • 🌍</p>
                               </div>
                           </div>
                           <div className="px-3 pb-2 text-sm text-gray-900">
                               {primaryText || "Ad text will appear here..."}
                           </div>
                           <div className="aspect-video bg-gray-100 relative overflow-hidden">
                               {mediaUrl ? (
                                   <img src={mediaUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                       <Icons.Image />
                                   </div>
                               )}
                           </div>
                           <div className="p-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                               <div>
                                   <p className="text-xs text-gray-500 uppercase">WhatsApp</p>
                                   <h5 className="font-bold text-sm text-gray-900">{headline || "Headline"}</h5>
                               </div>
                               <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded font-bold text-sm transition-colors">
                                   Send Message
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Instagram Feed Card */}
                   {platform === 'instagram' && (
                       <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-[380px] overflow-hidden">
                           <div className="p-3 flex items-center justify-between">
                               <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${business.name}&background=random`} alt="" />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900">{business.name}</h4>
                               </div>
                               <span className="text-gray-900">...</span>
                           </div>
                           <div className="aspect-square bg-gray-100 relative overflow-hidden">
                               {mediaUrl ? (
                                   <img src={mediaUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                       <Icons.Image />
                                   </div>
                               )}
                               <div className="absolute bottom-0 left-0 right-0 bg-[#25D366] text-white py-3 text-center font-bold text-sm cursor-pointer hover:bg-[#1ebc57]">
                                   Send Message
                               </div>
                           </div>
                           <div className="p-3">
                               <div className="flex gap-4 mb-2">
                                   <span>❤️</span> <span>💬</span> <span>✈️</span>
                               </div>
                               <p className="text-sm text-gray-900">
                                   <span className="font-bold mr-2">{business.name}</span>
                                   {primaryText || "Caption goes here..."}
                               </p>
                           </div>
                       </div>
                   )}
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
              {ads.map(ad => (
                  <div key={ad.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group hover:border-slate-600 transition-all">
                      <div className="h-40 relative bg-slate-900">
                          <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-3 right-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${getStatusColor(ad.status)}`}>{ad.status}</span>
                          </div>
                          <div className="absolute bottom-3 left-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase bg-black/50 text-white border border-white/20`}>{ad.platform}</span>
                          </div>
                      </div>
                      <div className="p-4">
                          <h4 className="text-white font-bold text-sm mb-1 truncate">{ad.name}</h4>
                          <p className="text-xs text-slate-400 mb-4">Created {new Date(ad.createdAt).toLocaleDateString()}</p>
                          
                          <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                              <div className="text-center">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">Spend</p>
                                  <p className="text-white text-xs font-mono">${ad.spent}</p>
                              </div>
                              <div className="text-center border-l border-slate-700">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">Clicks</p>
                                  <p className="text-blue-400 text-xs font-mono">{ad.clicks}</p>
                              </div>
                              <div className="text-center border-l border-slate-700">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">CTR</p>
                                  <p className="text-green-400 text-xs font-mono">{ad.ctr}%</p>
                              </div>
                          </div>

                          <div className="flex justify-between items-center">
                              <button className="text-xs text-slate-400 hover:text-white font-medium">Edit Ad</button>
                              <button className="text-xs text-red-400 hover:text-red-300 font-medium">Pause</button>
                          </div>
                      </div>
                  </div>
              ))}
              {ads.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                      <div className="text-4xl mb-4 opacity-30">🎯</div>
                      <p>No ads created yet. Launch your first campaign!</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Ads;
