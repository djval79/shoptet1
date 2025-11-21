import React, { useState } from 'react';
import { Icons } from '../constants';
import { BusinessProfile } from '../types';

interface BusinessModalProps {
    onClose: () => void;
    onCreate: (business: BusinessProfile) => void;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('retail');
    const [salesStrategy, setSalesStrategy] = useState<'aggressive' | 'consultative' | 'passive'>('consultative');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        const newBusiness: BusinessProfile = {
            id: `biz_${Date.now()}`,
            name,
            industry,
            salesStrategy,
            revenue: 0,
            activeChats: 0,
            products: []
        };

        onCreate(newBusiness);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Create New Business</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. Acme Corp"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Industry</label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="retail">Retail & E-commerce</option>
                            <option value="services">Professional Services</option>
                            <option value="real_estate">Real Estate</option>
                            <option value="software">Software / SaaS</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="automotive">Automotive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Sales Strategy</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['aggressive', 'consultative', 'passive'] as const).map((strategy) => (
                                <button
                                    key={strategy}
                                    type="button"
                                    onClick={() => setSalesStrategy(strategy)}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${salesStrategy === strategy
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                        }`}
                                >
                                    <span className="capitalize">{strategy}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                            {salesStrategy === 'aggressive' && "Focuses on closing deals quickly with high urgency."}
                            {salesStrategy === 'consultative' && "Focuses on understanding needs and building value."}
                            {salesStrategy === 'passive' && "Focuses on support and answering questions only."}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Business
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessModal;
