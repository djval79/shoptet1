import React, { useState } from 'react';
import { BusinessProfile, Customer } from '../types';
import { Icons } from '../constants';
import { generateCallScript } from '../services/geminiService';

interface DialerProps {
    business: BusinessProfile;
    customers: Customer[];
    onUpdateCustomer: (customer: Customer) => void;
}

const Dialer: React.FC<DialerProps> = ({ business, customers, onUpdateCustomer }) => {
    const queue = customers.filter(c => c.status === 'lead' || c.status === 'negotiating');
    const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
    const [script, setScript] = useState<any | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);

    const handleStartCall = async (customer: Customer) => {
        setActiveCustomer(customer);
        setCallStatus('dialing');
        setIsGeneratingScript(true);

        // Generate script in background
        try {
            const generatedScript = await generateCallScript(customer, business);
            setScript(generatedScript);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingScript(false);
        }

        // Simulate connection
        setTimeout(() => setCallStatus('connected'), 2500);
    };

    const handleEndCall = () => {
        setCallStatus('ended');
        setTimeout(() => {
            setActiveCustomer(null);
            setCallStatus('idle');
            setScript(null);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Power Dialer</h2>
                    <p className="text-slate-400 text-sm">AI-assisted calling with real-time script generation.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-200">VoIP Connected</span>
                    </div>
                    <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-200">
                        Queue: {queue.length} Leads
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Lead Queue */}
                <div className="w-1/3 bg-[#1e293b] rounded-xl border border-slate-700/50 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                        <h3 className="font-semibold text-white">Up Next</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {queue.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => callStatus === 'idle' && handleStartCall(customer)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer group ${activeCustomer?.id === customer.id
                                        ? 'bg-blue-600/10 border-blue-500/50'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{customer.name}</h4>
                                        <p className="text-xs text-slate-400">{customer.phone}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${customer.leadScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        Score: {customer.leadScore}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Last active: 2h ago</span>
                                    <Icons.ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Active Call Interface */}
                <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                    {activeCustomer ? (
                        <>
                            {/* Call Header */}
                            <div className="bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-white border border-slate-700">
                                        {activeCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{activeCustomer.name}</h3>
                                        <p className="text-slate-400 text-sm">{activeCustomer.phone} • {activeCustomer.tags.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-mono font-bold ${callStatus === 'connected' ? 'text-green-400' : 'text-slate-500'}`}>
                                        {callStatus === 'connected' ? '00:42' : callStatus === 'dialing' ? 'Dialing...' : 'Ended'}
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Duration</p>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-6 p-6 overflow-hidden bg-[#0b1120]">
                                {/* Script Area */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-purple-400 font-medium flex items-center">
                                            <Icons.Wand className="w-4 h-4 mr-2" /> AI Script Assistant
                                        </h4>
                                        {isGeneratingScript && <span className="text-xs text-slate-500 animate-pulse">Generating...</span>}
                                    </div>

                                    <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-6 overflow-y-auto custom-scrollbar">
                                        {script ? (
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Opening</p>
                                                    <p className="text-lg text-slate-200 leading-relaxed">"{script.opening}"</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Key Points</p>
                                                    <ul className="space-y-2">
                                                        {script.keyPoints?.map((point: string, i: number) => (
                                                            <li key={i} className="flex items-start text-slate-300">
                                                                <span className="mr-2 text-blue-500">•</span> {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Closing</p>
                                                    <p className="text-slate-300">"{script.closing}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                                                <div className="w-12 h-12 border-2 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                                                <p>Analyzing customer profile...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Controls & Notes */}
                                <div className="w-72 flex flex-col space-y-4">
                                    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col">
                                        <label className="text-xs text-slate-500 font-bold uppercase mb-2">Call Notes</label>
                                        <textarea
                                            placeholder="Type notes here..."
                                            className="flex-1 bg-transparent resize-none outline-none text-slate-300 text-sm placeholder-slate-600"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium transition-colors">
                                            Left Voicemail
                                        </button>
                                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium transition-colors">
                                            Callback Later
                                        </button>
                                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium transition-colors">
                                            Not Interested
                                        </button>
                                        <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium transition-colors">
                                            Wrong Number
                                        </button>
                                    </div>

                                    {callStatus === 'connected' || callStatus === 'dialing' ? (
                                        <button
                                            onClick={handleEndCall}
                                            className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Icons.PhoneMissed className="w-5 h-5" />
                                            <span>End Call</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { }}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Icons.Check className="w-5 h-5" />
                                            <span>Mark as Sale</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0b1120]">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <Icons.Phone className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Dial</h3>
                            <p className="max-w-xs text-center text-sm">Select a lead from the queue to start calling. AI will generate a script automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dialer;
