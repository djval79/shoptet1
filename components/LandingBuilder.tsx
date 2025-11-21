
import React, { useState } from 'react';
import { BusinessProfile, LandingPageConfig } from '../types';
import { Icons } from '../constants';
import { generateLandingCopy } from '../services/geminiService';

interface LandingBuilderProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const LandingBuilder: React.FC<LandingBuilderProps> = ({ business, onUpdate }) => {
  const [config, setConfig] = useState<LandingPageConfig>(business.landingPage || {
      enabled: false,
      title: business.name,
      bio: "Welcome to our store! Chat with us on WhatsApp to order.",
      theme: 'brand',
      featuredProductIds: [],
      socialLinks: [],
      views: 0,
      clicks: 0
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState('instagram');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const currency = business.currencySymbol || '$';

  const handleSave = () => {
      onUpdate({ ...business, landingPage: config });
  };

  const handleMagicCopy = async () => {
      setIsGenerating(true);
      try {
          const copy = await generateLandingCopy(business);
          setConfig({ ...config, bio: copy });
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const toggleProduct = (id: string) => {
      const current = config.featuredProductIds;
      if (current.includes(id)) {
          setConfig({ ...config, featuredProductIds: current.filter(pid => pid !== id) });
      } else {
          if (current.length >= 4) {
              alert("Max 4 featured products allowed.");
              return;
          }
          setConfig({ ...config, featuredProductIds: [...current, id] });
      }
  };

  const addSocialLink = () => {
      if (!newLinkUrl) return;
      setConfig({
          ...config,
          socialLinks: [...config.socialLinks, { platform: newLinkPlatform as any, url: newLinkUrl }]
      });
      setNewLinkUrl('');
  };

  const removeSocialLink = (index: number) => {
      setConfig({
          ...config,
          socialLinks: config.socialLinks.filter((_, i) => i !== index)
      });
  };

  // Preview Helpers
  const featuredProducts = business.products.filter(p => config.featuredProductIds.includes(p.id));
  const phone = business.twilioNumber.replace(/\D/g, '');
  const waLink = `https://wa.me/${phone}`;
  const bgClass = config.theme === 'light' ? 'bg-white' : config.theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-b from-slate-900 to-blue-900';
  const textClass = config.theme === 'light' ? 'text-slate-900' : 'text-white';

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Storefront & Link-in-Bio</h2>
          <p className="text-slate-400">Create a mobile landing page to drive traffic to WhatsApp.</p>
        </div>
        <div className="flex items-center space-x-3">
             <span className="text-sm text-slate-400">
                 {config.enabled ? '🟢 Live' : '⚪ Draft'}
             </span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={config.enabled} 
                    onChange={e => { setConfig({...config, enabled: e.target.checked}); handleSave(); }}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
        </div>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
          {/* Editor Pane */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
               
               {/* Hero Section */}
               <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center">
                       <span className="bg-blue-500/20 text-blue-400 p-1 rounded mr-2"><Icons.Star /></span> Hero Section
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-slate-400 text-sm mb-2">Page Title</label>
                           <input 
                                value={config.title}
                                onChange={e => setConfig({...config, title: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                           />
                       </div>
                       <div>
                           <label className="block text-slate-400 text-sm mb-2">Bio / Description</label>
                           <div className="flex space-x-2">
                               <textarea 
                                    value={config.bio}
                                    onChange={e => setConfig({...config, bio: e.target.value})}
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-24"
                               />
                               <button 
                                    onClick={handleMagicCopy}
                                    disabled={isGenerating}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded font-bold text-xs flex flex-col items-center justify-center w-16 disabled:opacity-50"
                               >
                                   {isGenerating ? '...' : <><Icons.Wand /><span className="mt-1">AI</span></>}
                               </button>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Theme */}
               <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center">
                       <span className="bg-pink-500/20 text-pink-400 p-1 rounded mr-2"><Icons.Image /></span> Appearance
                   </h3>
                   <div className="flex space-x-4">
                       {['light', 'dark', 'brand'].map(t => (
                           <button 
                                key={t}
                                onClick={() => setConfig({...config, theme: t as any})}
                                className={`flex-1 py-3 rounded-lg border capitalize text-sm font-medium transition-all ${config.theme === t ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-slate-600 bg-slate-900 text-slate-400'}`}
                           >
                               {t}
                           </button>
                       ))}
                   </div>
               </div>

               {/* Products */}
               <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center">
                       <span className="bg-green-500/20 text-green-400 p-1 rounded mr-2"><Icons.Grid /></span> Featured Products
                   </h3>
                   <p className="text-xs text-slate-400 mb-3">Select up to 4 items to display on your landing page.</p>
                   <div className="grid grid-cols-2 gap-2">
                       {business.products.map(p => (
                           <div 
                                key={p.id}
                                onClick={() => toggleProduct(p.id)}
                                className={`p-2 rounded border cursor-pointer flex items-center space-x-2 ${config.featuredProductIds.includes(p.id) ? 'bg-green-900/30 border-green-500' : 'bg-slate-900 border-slate-600 opacity-60'}`}
                           >
                               <img src={p.image} className="w-8 h-8 rounded object-cover" alt="" />
                               <div className="overflow-hidden">
                                   <p className="text-white text-xs truncate">{p.name}</p>
                                   <p className="text-slate-400 text-[10px]">{currency}{p.price}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>

               {/* Socials */}
               <div className="mb-8">
                   <h3 className="text-white font-bold mb-4 flex items-center">
                       <span className="bg-yellow-500/20 text-yellow-400 p-1 rounded mr-2"><Icons.Share /></span> Social Links
                   </h3>
                   <div className="space-y-2 mb-4">
                       {config.socialLinks.map((link, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                               <span className="text-xs text-slate-300 capitalize">{link.platform}</span>
                               <span className="text-xs text-slate-500 truncate max-w-[150px]">{link.url}</span>
                               <button onClick={() => removeSocialLink(i)} className="text-slate-500 hover:text-red-400"><Icons.X /></button>
                           </div>
                       ))}
                   </div>
                   <div className="flex space-x-2">
                       <select 
                            value={newLinkPlatform}
                            onChange={e => setNewLinkPlatform(e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded px-2 text-xs text-white outline-none"
                       >
                           <option value="instagram">Instagram</option>
                           <option value="facebook">Facebook</option>
                           <option value="website">Website</option>
                           <option value="tiktok">TikTok</option>
                       </select>
                       <input 
                            value={newLinkUrl}
                            onChange={e => setNewLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-xs outline-none"
                       />
                       <button onClick={addSocialLink} className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded"><Icons.Plus /></button>
                   </div>
               </div>

               <button 
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg"
               >
                   Save Changes
               </button>
          </div>

          {/* Preview Pane */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl flex items-center justify-center relative overflow-hidden">
               <div className="absolute top-4 right-4 text-right">
                   <div className="text-xs text-slate-400 uppercase font-bold mb-1">Stats</div>
                   <div className="flex space-x-4 text-white font-mono text-sm">
                       <span className="flex items-center"><Icons.Eye /> <span className="ml-1">{config.views}</span></span>
                       <span className="flex items-center"><span className="text-green-400">👆</span> <span className="ml-1">{config.clicks}</span></span>
                   </div>
               </div>

               {/* Simulated Phone */}
               <div className={`w-[300px] h-[600px] rounded-[30px] border-8 border-slate-900 shadow-2xl overflow-hidden relative flex flex-col ${bgClass} ${textClass} transition-colors duration-300`}>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-10"></div>
                   
                   <div className="flex-1 overflow-y-auto p-6 pt-12 no-scrollbar">
                       {/* Profile */}
                       <div className="text-center mb-8">
                           <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-white/20">
                               {config.title.charAt(0)}
                           </div>
                           <h1 className="text-lg font-bold mb-2">{config.title}</h1>
                           <p className="text-sm opacity-80 leading-relaxed">{config.bio}</p>
                       </div>

                       {/* Main CTA */}
                       <a href={waLink} target="_blank" rel="noreferrer" className="block bg-[#25D366] text-white text-center py-3 rounded-full font-bold shadow-lg shadow-green-900/20 mb-8 flex items-center justify-center hover:scale-105 transition-transform">
                           <span className="mr-2 text-lg">💬</span> Chat on WhatsApp
                       </a>

                       {/* Featured Grid */}
                       {featuredProducts.length > 0 && (
                           <div className="mb-8">
                               <h5 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-widest text-center">Featured</h5>
                               <div className="grid grid-cols-2 gap-3">
                                   {featuredProducts.map(p => (
                                       <div key={p.id} className={`rounded-lg overflow-hidden shadow-sm ${config.theme === 'light' ? 'bg-slate-100' : 'bg-white/10'}`}>
                                           <div className="aspect-square bg-slate-800">
                                               <img src={p.image} className="w-full h-full object-cover" alt="" />
                                           </div>
                                           <div className="p-2 text-center">
                                               <p className="text-xs font-medium truncate">{p.name}</p>
                                               <p className="text-xs opacity-70">{currency}{p.price}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}

                       {/* Social Links */}
                       <div className="space-y-3">
                           {config.socialLinks.map((link, i) => (
                               <a 
                                key={i} 
                                href={link.url} 
                                className={`block text-center py-3 rounded-lg text-sm font-medium border ${config.theme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-white/20 hover:bg-white/10'}`}
                               >
                                   {link.platform}
                               </a>
                           ))}
                       </div>

                       <div className="mt-12 text-center">
                           <p className="text-[10px] opacity-40">Powered by TwilioFlow</p>
                       </div>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};

export default LandingBuilder;
