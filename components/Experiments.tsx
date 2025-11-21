import React, { useState } from 'react';
import { BusinessProfile, Experiment } from '../types';
import { MOCK_EXPERIMENTS, Icons } from '../constants';
import { simulateExperimentResult } from '../services/geminiService';

interface ExperimentsProps {
  business: BusinessProfile;
}

const Experiments: React.FC<ExperimentsProps> = ({ business }) => {
  const [experiments, setExperiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  // Form
  const [expName, setExpName] = useState('');
  const [variable, setVariable] = useState<Experiment['variable']>('Sales Strategy');
  const [variantA, setVariantA] = useState<string>(business.salesStrategy);
  const [variantB, setVariantB] = useState('');

  const handleCreate = () => {
      if (!expName || !variantB) return;
      
      const newExp: Experiment = {
          id: `exp_${Date.now()}`,
          name: expName,
          variable,
          variantA,
          variantB,
          status: 'draft',
          startDate: Date.now(),
          stats: {
              a: { sessions: 0, conversions: 0, revenue: 0 },
              b: { sessions: 0, conversions: 0, revenue: 0 }
          }
      };

      setExperiments([newExp, ...experiments]);
      setIsCreating(false);
      setExpName('');
      setVariantB('');
  };

  const handleSimulate = async (exp: Experiment) => {
      setIsSimulating(exp.id);
      try {
          const result = await simulateExperimentResult(exp, business);
          
          setExperiments(prev => prev.map(e => {
              if (e.id === exp.id) {
                  return {
                      ...e,
                      status: 'completed',
                      stats: result,
                      winner: result.winner,
                      confidence: result.confidence
                  };
              }
              return e;
          }));

      } catch (error) {
          console.error("Simulation failed", error);
      } finally {
          setIsSimulating(null);
      }
  };

  const calculateConversion = (conv: number, sess: number) => {
      if (sess === 0) return 0;
      return ((conv / sess) * 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">A/B Experiments</h2>
          <p className="text-slate-400">Optimize your AI Agent using scientific split testing.</p>
        </div>
        {!isCreating && (
           <button 
             onClick={() => setIsCreating(true)}
             className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
           >
             <span className="mr-2"><Icons.Plus /></span> New Experiment
           </button>
        )}
      </div>

      {isCreating ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl max-w-2xl mx-auto w-full">
              <h3 className="text-lg font-bold text-white mb-6">Design New Experiment</h3>
              <div className="space-y-6">
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Experiment Name</label>
                      <input 
                        value={expName}
                        onChange={e => setExpName(e.target.value)}
                        placeholder="e.g. Strategy Test Q1"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-slate-400 text-sm mb-2">Variable to Test</label>
                      <div className="grid grid-cols-3 gap-2">
                          {['Sales Strategy', 'Welcome Message', 'Pricing Model'].map(v => (
                              <button 
                                key={v}
                                onClick={() => { setVariable(v as any); setVariantA(v === 'Sales Strategy' ? business.salesStrategy : business.welcomeMessage); }}
                                className={`py-2 px-3 rounded border text-sm transition-colors ${variable === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                              >
                                  {v}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Variant A (Control)</div>
                          <div className="text-white text-sm opacity-70">{variantA.length > 50 ? variantA.substring(0,50) + '...' : variantA}</div>
                      </div>
                      <div>
                          <div className="text-xs font-bold text-blue-400 uppercase mb-2">Variant B (Test)</div>
                          <input 
                            value={variantB}
                            onChange={e => setVariantB(e.target.value)}
                            placeholder={variable === 'Sales Strategy' ? "e.g. Aggressive" : "New text..."}
                            className="w-full bg-slate-900 border border-blue-500/50 rounded p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                      <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                      <button 
                        onClick={handleCreate}
                        disabled={!expName || !variantB}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded font-bold shadow-lg"
                      >
                          Create Draft
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pb-4">
              {experiments.map(exp => (
                  <div key={exp.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all relative overflow-hidden">
                      {exp.status === 'completed' && (
                          <div className="absolute top-0 right-0 p-2">
                              <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded uppercase border border-green-500/30">
                                  Winner: Variant {exp.winner?.toUpperCase()}
                              </div>
                          </div>
                      )}

                      <div className="flex items-center mb-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-4 ${exp.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                              <Icons.Flask />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">{exp.name}</h3>
                              <p className="text-xs text-slate-400">{exp.variable} • Started {new Date(exp.startDate).toLocaleDateString()}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                          {/* Variant A */}
                          <div className={`p-3 rounded border ${exp.winner === 'a' ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
                              <div className="flex justify-between mb-2">
                                  <span className="text-xs font-bold text-slate-500">Variant A</span>
                                  <span className="text-xs text-slate-400">{exp.variantA.substring(0, 15)}...</span>
                              </div>
                              <div className="text-2xl font-bold text-white">{calculateConversion(exp.stats.a.conversions, exp.stats.a.sessions)}%</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Conv. Rate</div>
                          </div>

                          {/* Variant B */}
                          <div className={`p-3 rounded border ${exp.winner === 'b' ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
                              <div className="flex justify-between mb-2">
                                  <span className="text-xs font-bold text-blue-400">Variant B</span>
                                  <span className="text-xs text-slate-400">{exp.variantB.substring(0, 15)}...</span>
                              </div>
                              <div className="text-2xl font-bold text-white">{calculateConversion(exp.stats.b.conversions, exp.stats.b.sessions)}%</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Conv. Rate</div>
                          </div>
                      </div>
                      
                      {exp.status === 'draft' ? (
                           <button 
                             onClick={() => handleSimulate(exp)}
                             disabled={!!isSimulating}
                             className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white py-3 rounded-lg font-bold shadow-lg flex justify-center items-center transition-all"
                           >
                               {isSimulating === exp.id ? (
                                   <>
                                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                       Simulating 2,000 sessions...
                                   </>
                               ) : (
                                   <>
                                     <span className="mr-2">⚡</span> Run AI Prediction
                                   </>
                               )}
                           </button>
                      ) : (
                           <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                               <div className="text-xs text-slate-400">
                                   Total Sessions: <span className="text-white font-mono">{exp.stats.a.sessions + exp.stats.b.sessions}</span>
                               </div>
                               {exp.confidence && (
                                   <div className="text-xs text-green-400 font-bold">
                                       {exp.confidence}% Confidence
                                   </div>
                               )}
                           </div>
                      )}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Experiments;