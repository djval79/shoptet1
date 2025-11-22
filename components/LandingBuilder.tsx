import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Icons } from '../constants';
import { generateLandingPage } from '../services/geminiService';

interface LandingBuilderProps {
    business: BusinessProfile;
    onUpdateBusiness: (business: BusinessProfile) => void;
}

const LandingBuilder: React.FC<LandingBuilderProps> = ({ business, onUpdateBusiness }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content');

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Simulate AI generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert("AI has optimized your storefront layout!");
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Storefront Builder</h2>
                    <p className="text-slate-400 text-sm">Design your WhatsApp catalog and landing page.</p>
                </div>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <div className="bg-[#1e293b] p-1 rounded-lg border border-slate-700 flex">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewMode('desktop');
                            }}
                            className={`p-3 rounded transition-all touch-manipulation ${previewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            aria-label="Desktop view"
                        >
                            <Icons.Monitor className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewMode('mobile');
                            }}
                            className={`p-3 rounded transition-all touch-manipulation ${previewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            aria-label="Mobile view"
                        >
                            <Icons.Smartphone className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20 transition-all flex items-center space-x-2 touch-manipulation"
                    >
                        {isGenerating ? <Icons.Loader className="animate-spin w-4 h-4" /> : <Icons.Wand className="w-4 h-4" />}
                        <span className="hidden sm:inline">AI Redesign</span>
                        <span className="sm:hidden">AI</span>
                    </button>
                    <button
                        type="button"
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-green-900/20 transition-all touch-manipulation"
                    >
                        <span className="hidden sm:inline">Publish Changes</span>
                        <span className="sm:hidden">Publish</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Left: Editor Panel */}
                <div className="w-full lg:w-80 bg-[#1e293b] rounded-xl border border-slate-700/50 flex flex-col overflow-hidden shadow-lg max-h-[400px] lg:max-h-none">
                    <div className="flex border-b border-slate-700">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'content' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Content
                        </button>
                        <button
                            onClick={() => setActiveTab('style')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'style' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Style
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Settings
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        {activeTab === 'content' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hero Headline</label>
                                    <input type="text" defaultValue="Summer Collection 2024" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subheadline</label>
                                    <textarea defaultValue="Discover the hottest trends of the season. Shop now and get 20% off." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500 h-24 resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Call to Action</label>
                                    <input type="text" defaultValue="Shop Now" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500" />
                                </div>
                            </>
                        )}
                        {activeTab === 'style' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Color</label>
                                    <div className="flex space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-purple-600 border border-transparent cursor-pointer opacity-50 hover:opacity-100"></div>
                                        <div className="w-8 h-8 rounded-full bg-green-600 border border-transparent cursor-pointer opacity-50 hover:opacity-100"></div>
                                        <div className="w-8 h-8 rounded-full bg-orange-600 border border-transparent cursor-pointer opacity-50 hover:opacity-100"></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Family</label>
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-blue-500">
                                        <option>Inter</option>
                                        <option>Roboto</option>
                                        <option>Playfair Display</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl flex items-center justify-center overflow-hidden relative bg-grid-slate-800/[0.2]">
                    <div className={`transition-all duration-500 ease-in-out bg-white overflow-hidden shadow-2xl ${previewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-[8px] border-slate-800' : 'w-full h-full rounded-none'
                        }`}>
                        {/* Mock Storefront Preview */}
                        <div className="h-full overflow-y-auto bg-white text-slate-900">
                            {/* Navbar */}
                            <div className="flex justify-between items-center p-4 border-b">
                                <span className="font-bold text-lg">StoreLogo</span>
                                <Icons.Menu className="w-6 h-6" />
                            </div>
                            {/* Hero */}
                            <div className="bg-slate-100 p-8 text-center">
                                <h1 className="text-3xl font-bold mb-4">Summer Collection 2024</h1>
                                <p className="text-slate-600 mb-6">Discover the hottest trends of the season. Shop now and get 20% off.</p>
                                <button className="bg-black text-white px-6 py-3 rounded-full font-medium">Shop Now</button>
                            </div>
                            {/* Products Grid */}
                            <div className="p-4 grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="aspect-square bg-slate-200 rounded-lg"></div>
                                        <h3 className="font-medium">Product Name</h3>
                                        <p className="text-sm text-slate-500">$49.00</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingBuilder;
