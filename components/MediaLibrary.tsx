
import React, { useState } from 'react';
import { MediaAsset } from '../types';
import { MOCK_MEDIA, Icons } from '../constants';
import { generateImageTags, generateBusinessImage } from '../services/geminiService';

const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(MOCK_MEDIA);
  const [activeTab, setActiveTab] = useState<'library' | 'studio'>('library');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  
  // Studio Form
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Tagging
  const [isTagging, setIsTagging] = useState(false);

  const handleUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                  const newAsset: MediaAsset = {
                      id: `img_${Date.now()}`,
                      url: event.target?.result as string,
                      name: file.name,
                      type: 'image',
                      size: `${(file.size / 1024).toFixed(1)} KB`,
                      tags: [],
                      createdAt: Date.now()
                  };
                  setAssets([newAsset, ...assets]);
              };
              reader.readAsDataURL(file);
          }
      };
      input.click();
  };

  const handleAutoTag = async (asset: MediaAsset) => {
      setIsTagging(true);
      try {
          const result = await generateImageTags(asset.url);
          setAssets(prev => prev.map(a => {
              if (a.id === asset.id) {
                  return { ...a, tags: result.tags || [] };
              }
              return a;
          }));
          // Update selected view
          if (selectedAsset?.id === asset.id) {
              setSelectedAsset({ ...asset, tags: result.tags || [] });
          }
      } catch (e) {
          console.error("Tagging failed", e);
      } finally {
          setIsTagging(false);
      }
  };

  const handleGenerateImage = async () => {
      if (!prompt) return;
      setIsGenerating(true);
      setGeneratedImage(null);
      try {
          const base64 = await generateBusinessImage(prompt);
          setGeneratedImage(`data:image/jpeg;base64,${base64}`);
      } catch (e) {
          console.error(e);
          alert("Failed to generate image. Please check API key or try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const saveGeneratedImage = () => {
      if (!generatedImage) return;
      const newAsset: MediaAsset = {
          id: `ai_img_${Date.now()}`,
          url: generatedImage,
          name: `ai_gen_${Date.now()}.jpg`,
          type: 'image',
          size: '500 KB',
          tags: ['ai-generated'],
          createdAt: Date.now(),
          aiGenerated: true
      };
      setAssets([newAsset, ...assets]);
      setGeneratedImage(null);
      setPrompt('');
      setActiveTab('library');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Library & AI Studio</h2>
          <p className="text-slate-400">Manage visuals and generate new assets with Imagen 3.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('library')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <span className="mr-2"><Icons.Grid /></span> Library
            </button>
            <button 
                onClick={() => setActiveTab('studio')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'studio' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <span className="mr-2"><Icons.Wand /></span> AI Studio
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          {activeTab === 'library' && (
              <div className="flex h-full">
                  {/* Grid */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between mb-4">
                          <div className="flex space-x-2">
                              <input placeholder="Search assets..." className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-sm text-white outline-none" />
                          </div>
                          <button onClick={handleUpload} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded text-sm flex items-center">
                              <Icons.Plus /> <span className="ml-2">Upload</span>
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {assets.map(asset => (
                              <div 
                                key={asset.id} 
                                onClick={() => setSelectedAsset(asset)}
                                className={`aspect-square bg-slate-900 rounded-lg border overflow-hidden cursor-pointer group relative ${selectedAsset?.id === asset.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-700 hover:border-slate-500'}`}
                              >
                                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                  {asset.aiGenerated && (
                                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">AI</div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                      <span className="text-white text-xs truncate w-full">{asset.name}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Detail Pane */}
                  {selectedAsset && (
                      <div className="w-80 border-l border-slate-700 bg-slate-900 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 border border-slate-700">
                              <img src={selectedAsset.url} alt="" className="w-full h-full object-contain" />
                          </div>
                          
                          <h3 className="text-white font-bold text-sm truncate mb-1">{selectedAsset.name}</h3>
                          <p className="text-xs text-slate-500 mb-4">{new Date(selectedAsset.createdAt).toLocaleDateString()} • {selectedAsset.size}</p>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Tags</label>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedAsset.tags.length > 0 ? (
                                          selectedAsset.tags.map(t => (
                                              <span key={t} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{t}</span>
                                          ))
                                      ) : (
                                          <span className="text-xs text-slate-600 italic">No tags yet</span>
                                      )}
                                  </div>
                              </div>

                              <button 
                                onClick={() => handleAutoTag(selectedAsset)}
                                disabled={isTagging}
                                className="w-full bg-blue-900/30 border border-blue-500/50 text-blue-300 hover:bg-blue-900/50 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                              >
                                  {isTagging ? 'Analyzing...' : '✨ AI Auto-Tag'}
                              </button>
                              
                              <div className="pt-4 border-t border-slate-800">
                                  <button className="w-full text-red-400 hover:text-red-300 text-xs py-2">Delete Asset</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'studio' && (
              <div className="flex h-full">
                   <div className="w-80 p-6 border-r border-slate-700 bg-slate-900 flex flex-col">
                       <h3 className="text-white font-bold mb-4">Generator Settings</h3>
                       <div className="space-y-4">
                           <div>
                               <label className="block text-slate-400 text-sm mb-2">Prompt</label>
                               <textarea 
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-purple-500 h-32"
                                    placeholder="Describe the image you want (e.g. 'A futuristic neon pizza box on a dark table')"
                               />
                           </div>
                           <div>
                               <label className="block text-slate-400 text-sm mb-2">Aspect Ratio</label>
                               <div className="grid grid-cols-3 gap-2">
                                   <button className="bg-purple-600 text-white border border-purple-500 rounded py-2 text-xs">1:1</button>
                                   <button className="bg-slate-800 text-slate-400 border border-slate-700 rounded py-2 text-xs hover:text-white">16:9</button>
                                   <button className="bg-slate-800 text-slate-400 border border-slate-700 rounded py-2 text-xs hover:text-white">9:16</button>
                               </div>
                           </div>
                           <button 
                                onClick={handleGenerateImage}
                                disabled={isGenerating || !prompt}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 flex justify-center items-center"
                           >
                               {isGenerating ? (
                                   <>
                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                     Dreaming...
                                   </>
                               ) : (
                                   <>
                                     <span className="mr-2">✨</span> Generate
                                   </>
                               )}
                           </button>
                       </div>
                   </div>
                   
                   <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
                       {generatedImage ? (
                           <div className="max-w-lg w-full animate-in zoom-in duration-300">
                               <div className="aspect-square bg-black rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl mb-6 relative group">
                                   <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <button onClick={saveGeneratedImage} className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                                           Save to Library
                                       </button>
                                   </div>
                               </div>
                               <div className="text-center">
                                   <p className="text-slate-400 text-sm italic">"{prompt}"</p>
                               </div>
                           </div>
                       ) : (
                           <div className="text-center opacity-50">
                               <div className="text-6xl mb-4">🎨</div>
                               <h3 className="text-xl font-bold text-white">AI Canvas</h3>
                               <p className="text-slate-400">Enter a prompt to create unique assets.</p>
                           </div>
                       )}
                   </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default MediaLibrary;
