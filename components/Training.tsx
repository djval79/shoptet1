
import React, { useState } from 'react';
import { BusinessProfile, TrainingExample } from '../types';
import { MOCK_TRAINING_EXAMPLES, Icons } from '../constants';

interface TrainingProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Training: React.FC<TrainingProps> = ({ business, onUpdate }) => {
  const [examples, setExamples] = useState<TrainingExample[]>(business.trainingExamples || MOCK_TRAINING_EXAMPLES);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  
  // Correction Form
  const [newCorrection, setNewCorrection] = useState('');
  
  const selectedExample = examples.find(e => e.id === selectedExampleId);

  const handleApprove = (id: string) => {
      const updated = examples.map(e => e.id === id ? { ...e, status: 'approved' as const } : e);
      setExamples(updated);
      onUpdate({ ...business, trainingExamples: updated });
  };

  const handleSaveCorrection = () => {
      if (!selectedExample) return;
      const updated = examples.map(e => e.id === selectedExample.id ? { ...e, correction: newCorrection, status: 'approved' as const } : e);
      setExamples(updated);
      onUpdate({ ...business, trainingExamples: updated });
      
      // Simulate Training
      setIsTraining(true);
      setTimeout(() => {
          setIsTraining(false);
          setSelectedExampleId(null);
      }, 1500);
  };

  const handleDiscard = (id: string) => {
      const updated = examples.filter(e => e.id !== id);
      setExamples(updated);
      onUpdate({ ...business, trainingExamples: updated });
      if (selectedExampleId === id) setSelectedExampleId(null);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Quality Assurance</h2>
          <p className="text-slate-400">Review flagged conversations and train the AI with golden corrections.</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-3">
            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-bold">Accuracy Score</span>
                <span className="text-green-400 font-bold text-lg">94%</span>
            </div>
            <div className="h-8 w-px bg-slate-600"></div>
            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-bold">Pending Review</span>
                <span className="text-yellow-400 font-bold text-lg">{examples.filter(e => e.status === 'pending').length}</span>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: List */}
          <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">Training Queue</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {examples.map(ex => (
                      <div 
                        key={ex.id}
                        onClick={() => { setSelectedExampleId(ex.id); setNewCorrection(ex.correction); }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedExampleId === ex.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-transparent hover:bg-slate-700/50'}`}
                      >
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${ex.status === 'approved' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                  {ex.status}
                              </span>
                              <span className="text-[10px] text-slate-500">Today</span>
                          </div>
                          <p className="text-white text-sm font-medium mb-1 line-clamp-1">"{ex.trigger}"</p>
                          <p className="text-xs text-slate-400">{ex.context || 'No Context'}</p>
                      </div>
                  ))}
                  {examples.length === 0 && (
                      <div className="text-center py-12 text-slate-500 italic">
                          No items to review.
                      </div>
                  )}
              </div>
          </div>

          {/* Right: Detail */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl relative overflow-hidden flex flex-col">
              {selectedExample ? (
                  <>
                    <div className="p-6 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">Correction Editor</h3>
                            <p className="text-xs text-slate-400">Teach the AI the correct response for this scenario.</p>
                        </div>
                        <button onClick={() => handleDiscard(selectedExample.id)} className="text-slate-400 hover:text-red-400 px-3 py-1 border border-slate-600 rounded text-xs">
                            Delete
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {/* User Trigger */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">User Said</label>
                            <div className="bg-slate-800 border border-slate-600 p-4 rounded-lg text-white text-lg">
                                {selectedExample.trigger}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* Bad Response */}
                            <div>
                                <label className="block text-xs font-bold text-red-400 uppercase mb-2">AI Said (Incorrect)</label>
                                <div className="bg-red-900/10 border border-red-500/30 p-4 rounded-lg text-slate-300 text-sm h-full">
                                    {selectedExample.badResponse}
                                </div>
                            </div>
                            
                            {/* Correction Input */}
                            <div>
                                <label className="block text-xs font-bold text-green-400 uppercase mb-2">Human Correction (Target)</label>
                                <textarea 
                                    value={newCorrection}
                                    onChange={e => setNewCorrection(e.target.value)}
                                    className="w-full bg-green-900/10 border border-green-500/30 p-4 rounded-lg text-white text-sm h-full outline-none focus:border-green-500 min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                             <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-blue-300 text-xs max-w-lg text-center">
                                 💡 By approving this, you are adding a <strong>Few-Shot Example</strong> to the AI's system prompt. Future responses to similar questions will mimic this correction.
                             </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-700 bg-slate-800 flex justify-end">
                         {isTraining ? (
                             <button disabled className="bg-slate-700 text-white px-8 py-3 rounded-lg font-bold cursor-wait flex items-center">
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                 Retraining Model...
                             </button>
                         ) : (
                             <button 
                                onClick={handleSaveCorrection}
                                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                             >
                                 Approve & Train
                             </button>
                         )}
                    </div>
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70">
                      <div className="text-6xl mb-4">🎓</div>
                      <p>Select a conversation to review</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Training;
