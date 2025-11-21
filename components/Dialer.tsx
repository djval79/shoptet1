
import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, Customer } from '../types';
import { Icons } from '../constants';
import { generateCallScript } from '../services/geminiService';

interface DialerProps {
  business: BusinessProfile;
  customers: Customer[];
  onUpdateCustomer: (updated: Customer) => void;
}

// Simple text-to-speech helper
const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
};

const Dialer: React.FC<DialerProps> = ({ business, customers, onUpdateCustomer }) => {
  // Lead Queue Logic (Mock: Leads or Negotiating status)
  const queue = customers.filter(c => c.status === 'lead' || c.status === 'negotiating');
  
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [script, setScript] = useState<{opening: string, pitch: string, objectionHandling: string} | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [agentNotes, setAgentNotes] = useState('');

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
      if (callStatus === 'connected') {
          timerRef.current = window.setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const handleStartCall = async (customer: Customer) => {
      setActiveCustomer(customer);
      setCallStatus('dialing');
      setCallDuration(0);
      setScript(null);
      setAgentNotes('');

      // 1. Generate Script in background
      setIsGeneratingScript(true);
      try {
          const generatedScript = await generateCallScript(customer, business);
          setScript(generatedScript);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingScript(false);
      }

      // 2. Simulate connection delay
      setTimeout(() => {
          setCallStatus('connected');
          // Simulate Customer saying hello
          setTimeout(() => speak("Hello? Who is this?"), 1000);
      }, 2500);
  };

  const handleEndCall = () => {
      setCallStatus('ended');
  };

  const handleOutcome = (outcome: 'sale' | 'voicemail' | 'callback' | 'bad_number') => {
      if (!activeCustomer) return;
      
      let newStatus = activeCustomer.status;
      let noteText = `Call Outcome: ${outcome.toUpperCase()}. ${agentNotes}`;

      if (outcome === 'sale') newStatus = 'closed';
      if (outcome === 'bad_number') newStatus = 'churned';

      // Update Customer
      const updatedCustomer: Customer = {
          ...activeCustomer,
          status: newStatus,
          lastActive: Date.now(),
          notes: (activeCustomer.notes ? activeCustomer.notes + '\n' : '') + noteText
      };
      
      onUpdateCustomer(updatedCustomer);
      
      // Reset for next call
      setActiveCustomer(null);
      setCallStatus('idle');
  };

  const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const remaining = secs % 60;
      return `${mins}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Power Dialer</h2>
          <p className="text-slate-400">High-velocity outbound sales with AI scripting.</p>
        </div>
        <div className="flex items-center space-x-4">
             <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">Queue Size</span>
                 <span className="text-xl font-bold text-white">{queue.length} Leads</span>
             </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: Lead Queue */}
          <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">To Call</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {queue.map(c => (
                      <div 
                        key={c.id} 
                        className={`p-4 rounded-lg border transition-all flex justify-between items-center ${activeCustomer?.id === c.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-transparent hover:border-slate-600'}`}
                      >
                          <div>
                              <p className="text-white font-bold text-sm">{c.name}</p>
                              <p className="text-slate-500 text-xs">{c.phone}</p>
                              <div className="flex mt-1 gap-1">
                                  {c.tags?.slice(0,2).map(t => <span key={t} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{t}</span>)}
                              </div>
                          </div>
                          <button 
                            onClick={() => handleStartCall(c)}
                            disabled={callStatus !== 'idle'}
                            className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2.5 rounded-full shadow-lg transition-colors"
                          >
                              <Icons.Phone />
                          </button>
                      </div>
                  ))}
                  {queue.length === 0 && (
                      <div className="text-center py-12 text-slate-500 italic">Queue empty. Good job!</div>
                  )}
              </div>
          </div>

          {/* Right: Active Call Interface */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl relative overflow-hidden flex flex-col">
               {activeCustomer ? (
                   <>
                      {/* Header / Status */}
                      <div className="bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white border-4 border-slate-800 shadow-lg">
                                  {activeCustomer.name.charAt(0)}
                              </div>
                              <div>
                                  <h2 className="text-2xl font-bold text-white">{activeCustomer.name}</h2>
                                  <p className="text-slate-400 text-lg">{activeCustomer.phone}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-3xl font-mono font-bold ${callStatus === 'connected' ? 'text-green-400' : 'text-slate-500'}`}>
                                  {formatTime(callDuration)}
                              </div>
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">
                                  {callStatus === 'dialing' ? 'Connecting...' : callStatus === 'connected' ? 'Live Call' : 'Call Ended'}
                              </p>
                          </div>
                      </div>

                      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                          {/* Script Area */}
                          <div className="flex-1 flex flex-col">
                              <h4 className="text-purple-400 text-xs font-bold uppercase mb-3 flex items-center">
                                  <span className="mr-2"><Icons.Wand /></span> AI Script
                              </h4>
                              <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-6 overflow-y-auto shadow-inner">
                                  {isGeneratingScript ? (
                                      <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                                          Generating personalized script...
                                      </div>
                                  ) : script ? (
                                      <div className="space-y-6 text-lg leading-relaxed text-slate-200">
                                          <div>
                                              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Opening</span>
                                              <p>"{script.opening}"</p>
                                          </div>
                                          <div>
                                              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">The Pitch</span>
                                              <p>"{script.pitch}"</p>
                                          </div>
                                          <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-lg">
                                              <span className="text-xs text-yellow-500 uppercase font-bold block mb-1">Objection Handling</span>
                                              <p className="text-yellow-100 text-sm italic">"{script.objectionHandling}"</p>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="text-slate-500 italic">Script unavailable.</div>
                                  )}
                              </div>
                          </div>

                          {/* Controls & Notes */}
                          <div className="w-64 flex flex-col gap-4">
                              <div className="flex-1 flex flex-col">
                                  <label className="text-xs text-slate-400 font-bold uppercase mb-2">Call Notes</label>
                                  <textarea 
                                      value={agentNotes}
                                      onChange={e => setAgentNotes(e.target.value)}
                                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none outline-none focus:border-blue-500"
                                      placeholder="Type notes here..."
                                  />
                              </div>
                              
                              {callStatus === 'connected' || callStatus === 'dialing' ? (
                                  <button 
                                    onClick={handleEndCall}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center text-lg transition-transform hover:scale-105"
                                  >
                                      <span className="mr-2"><Icons.Phone /></span> End Call
                                  </button>
                              ) : (
                                  <div className="space-y-2 animate-in slide-in-from-bottom-4">
                                      <p className="text-center text-xs text-slate-500 mb-2">Select Outcome</p>
                                      <button onClick={() => handleOutcome('sale')} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg">
                                          Sale / Closed Won
                                      </button>
                                      <button onClick={() => handleOutcome('callback')} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg">
                                          Scheduled Callback
                                      </button>
                                      <button onClick={() => handleOutcome('voicemail')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg font-bold shadow-lg">
                                          Left Voicemail
                                      </button>
                                      <button onClick={() => handleOutcome('bad_number')} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold">
                                          Bad Number
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                       <div className="text-6xl mb-6">📞</div>
                       <h3 className="text-2xl font-bold text-white">Ready to Dial</h3>
                       <p className="text-lg">Select a lead from the queue to start.</p>
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};

export default Dialer;
