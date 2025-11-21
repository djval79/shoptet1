
import React, { useState } from 'react';
import { BusinessProfile, Flow, FlowScreen, FlowComponent } from '../types';
import { Icons } from '../constants';
import { generateFlow } from '../services/geminiService';

interface FlowsProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Flows: React.FC<FlowsProps> = ({ business, onUpdate }) => {
  const [flows, setFlows] = useState<Flow[]>(business.flows || []);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState('');

  const selectedFlow = flows.find(f => f.id === selectedFlowId);

  const handleGenerate = async () => {
    if (!aiGoal) return;
    setIsGenerating(true);
    try {
        const result = await generateFlow(business, aiGoal);
        const newFlow: Flow = {
            id: `flow_${Date.now()}`,
            name: aiGoal.length > 20 ? aiGoal.substring(0, 20) + '...' : aiGoal,
            triggerKeyword: aiGoal.split(' ')[0].toLowerCase(),
            screens: result.screens.map((s: any, i: number) => ({
                id: `scr_${Date.now()}_${i}`,
                title: s.title,
                components: s.components.map((c: any, j: number) => ({
                    id: `comp_${Date.now()}_${i}_${j}`,
                    type: c.type,
                    label: c.label,
                    required: c.required,
                    options: c.options
                }))
            }))
        };
        const updatedFlows = [...flows, newFlow];
        setFlows(updatedFlows);
        onUpdate({ ...business, flows: updatedFlows });
        setSelectedFlowId(newFlow.id);
        setAiGoal('');
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const deleteFlow = (id: string) => {
      const updated = flows.filter(f => f.id !== id);
      setFlows(updated);
      onUpdate({ ...business, flows: updated });
      if (selectedFlowId === id) setSelectedFlowId(null);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">WhatsApp Flows Builder</h2>
          <p className="text-slate-400">Create native, interactive forms that open inside WhatsApp.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700 w-1/3">
            <input 
                value={aiGoal}
                onChange={e => setAiGoal(e.target.value)}
                placeholder="e.g. 'Book a hair appointment'"
                className="flex-1 bg-transparent text-sm text-white outline-none px-2"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !aiGoal}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center disabled:opacity-50"
            >
                {isGenerating ? 'Building...' : '✨ AI Build'}
            </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar List */}
          <div className="w-64 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
               <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                   <h3 className="font-bold text-white text-sm uppercase tracking-wide">My Flows</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                   {flows.map(flow => (
                       <div 
                            key={flow.id}
                            onClick={() => setSelectedFlowId(flow.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${selectedFlowId === flow.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-transparent hover:bg-slate-700/50'}`}
                       >
                           <div className="font-medium text-white text-sm mb-1">{flow.name}</div>
                           <div className="text-[10px] text-slate-500">Trigger: <span className="font-mono text-blue-300">{flow.triggerKeyword}</span></div>
                           <button 
                                onClick={(e) => { e.stopPropagation(); deleteFlow(flow.id); }}
                                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                           >
                               <Icons.Trash />
                           </button>
                       </div>
                   ))}
                   {flows.length === 0 && (
                       <div className="text-center py-8 text-slate-500 text-xs italic">No flows yet. Use AI to build one!</div>
                   )}
               </div>
          </div>

          {/* Editor / Preview */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">
               {selectedFlow ? (
                   <div className="w-[320px] bg-white rounded-[32px] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
                       {/* Phone Status Bar */}
                       <div className="h-6 bg-slate-100 w-full flex justify-between px-4 items-center text-[10px] font-bold text-slate-800">
                           <span>9:41</span>
                           <span>5G</span>
                       </div>
                       
                       {/* WhatsApp Header */}
                       <div className="bg-[#075e54] p-3 text-white flex items-center space-x-3 shadow-md z-10">
                           <span className="text-lg">←</span>
                           <div className="font-bold">{selectedFlow.name}</div>
                       </div>

                       {/* Flow Content (Scrollable) */}
                       <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-6">
                           {selectedFlow.screens.map((screen, idx) => (
                               <div key={screen.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                                   <h4 className="font-bold text-slate-800 mb-4 text-sm">{screen.title}</h4>
                                   <div className="space-y-4">
                                       {screen.components.map(comp => (
                                           <div key={comp.id}>
                                               <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                                                   {comp.label} {comp.required && <span className="text-red-500">*</span>}
                                               </label>
                                               
                                               {comp.type === 'Text' && (
                                                   <input disabled className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-2 text-xs" placeholder="Text input..." />
                                               )}
                                               
                                               {comp.type === 'TextArea' && (
                                                   <textarea disabled className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-2 text-xs h-16" placeholder="Long text..." />
                                               )}

                                               {(comp.type === 'Dropdown' || comp.type === 'Radio') && (
                                                   <div className="space-y-1">
                                                       {comp.options?.map((opt, i) => (
                                                           <div key={i} className="flex items-center p-2 border border-slate-100 rounded bg-slate-50">
                                                               <div className="w-3 h-3 rounded-full border border-slate-400 mr-2"></div>
                                                               <span className="text-xs text-slate-700">{opt}</span>
                                                           </div>
                                                       ))}
                                                   </div>
                                               )}

                                               {comp.type === 'Checkbox' && (
                                                   <div className="flex items-center">
                                                       <div className="w-3 h-3 border border-slate-400 rounded mr-2"></div>
                                                       <span className="text-xs text-slate-700">Yes</span>
                                                   </div>
                                               )}
                                           </div>
                                       ))}
                                   </div>
                                   {idx === selectedFlow.screens.length - 1 && (
                                       <button className="w-full bg-[#00a884] text-white py-2 rounded mt-4 text-xs font-bold uppercase shadow-sm">
                                           Submit
                                       </button>
                                   )}
                               </div>
                           ))}
                       </div>
                   </div>
               ) : (
                   <div className="text-center opacity-50">
                       <div className="text-6xl mb-4">📱</div>
                       <p className="text-slate-400">Select or generate a flow to preview.</p>
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};

export default Flows;
