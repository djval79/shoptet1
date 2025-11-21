
import React, { useState } from 'react';
import { BusinessProfile, IVRConfig, IVRAction } from '../types';
import { Icons } from '../constants';
import { generateIVRScript } from '../services/geminiService';

interface IVRProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const IVR: React.FC<IVRProps> = ({ business, onUpdate }) => {
  const [config, setConfig] = useState<IVRConfig>(business.ivrConfig || {
      enabled: false,
      greetingText: `Thank you for calling ${business.name}. Press 1 for Sales, 2 for Support.`,
      voiceGender: 'female',
      actions: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [simulatedCallStatus, setSimulatedCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');

  const handleSave = () => {
      onUpdate({ ...business, ivrConfig: config });
  };

  const handleGenerate = async () => {
      setIsGenerating(true);
      try {
          const result = await generateIVRScript(business, 'Professional and Warm');
          setConfig({
              ...config,
              greetingText: result.greeting,
              actions: result.actions || []
          });
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const addAction = () => {
      const nextKey = (config.actions.length + 1).toString();
      if (Number(nextKey) > 9) return;
      
      const newAction: IVRAction = {
          key: nextKey,
          action: 'forward_agent',
          label: 'New Option'
      };
      setConfig({ ...config, actions: [...config.actions, newAction] });
  };

  const updateAction = (index: number, field: keyof IVRAction, value: any) => {
      const updatedActions = [...config.actions];
      updatedActions[index] = { ...updatedActions[index], [field]: value };
      setConfig({ ...config, actions: updatedActions });
  };

  const removeAction = (index: number) => {
      setConfig({ ...config, actions: config.actions.filter((_, i) => i !== index) });
  };

  const simulateCall = () => {
      setSimulatedCallStatus('ringing');
      setTimeout(() => {
          setSimulatedCallStatus('connected');
          // Speak Greeting
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(config.greetingText);
              // utterance.voice = ... (find female voice)
              window.speechSynthesis.speak(utterance);
          }
      }, 1500);
  };

  const handleSimulatedKeyPress = (key: string) => {
      const action = config.actions.find(a => a.key === key);
      if (action) {
          // Provide Feedback
          let feedbackText = "";
          if (action.action === 'send_whatsapp') feedbackText = "We have sent a message to your WhatsApp. Goodbye.";
          if (action.action === 'forward_agent') feedbackText = "Connecting you to an agent...";
          if (action.action === 'voicemail') feedbackText = "Please leave a message after the tone.";
          
          if ('speechSynthesis' in window) {
               const utterance = new SpeechSynthesisUtterance(feedbackText);
               window.speechSynthesis.speak(utterance);
               utterance.onend = () => setSimulatedCallStatus('ended');
          } else {
               setSimulatedCallStatus('ended');
          }
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Voice IVR & Routing</h2>
          <p className="text-slate-400">Configure inbound call menus and WhatsApp deflection.</p>
        </div>
        <div className="flex items-center space-x-3">
             <span className="text-sm text-slate-400">
                 {config.enabled ? '🟢 Active' : '⚪ Disabled'}
             </span>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={config.enabled} 
                    onChange={e => { setConfig({...config, enabled: e.target.checked}); handleSave(); }}
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
        </div>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
          {/* Editor */}
          <div className="w-2/3 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold flex items-center">
                          <Icons.Phone /> <span className="ml-2">Incoming Call Greeting</span>
                      </h3>
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded font-bold flex items-center disabled:opacity-50"
                      >
                          {isGenerating ? '...' : '✨ AI Write'}
                      </button>
                  </div>
                  <textarea 
                      value={config.greetingText}
                      onChange={e => setConfig({...config, greetingText: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-lg font-medium h-32 outline-none focus:border-purple-500"
                  />
                  <div className="mt-4 flex items-center space-x-4">
                      <label className="text-slate-400 text-sm">Voice Personality:</label>
                      <div className="flex bg-slate-800 rounded p-1">
                          <button 
                            onClick={() => setConfig({...config, voiceGender: 'female'})}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${config.voiceGender === 'female' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                          >
                              Female
                          </button>
                          <button 
                            onClick={() => setConfig({...config, voiceGender: 'male'})}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${config.voiceGender === 'male' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                          >
                              Male
                          </button>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold">Keypress Actions</h3>
                      <button onClick={addAction} className="text-blue-400 hover:text-blue-300 text-sm font-medium">+ Add Key</button>
                  </div>
                  
                  {config.actions.map((action, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                          <div className="w-10 h-10 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center text-xl font-bold text-white">
                              {action.key}
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                              <input 
                                value={action.label}
                                onChange={e => updateAction(i, 'label', e.target.value)}
                                placeholder="Label (e.g. Sales)"
                                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                              />
                              <select 
                                value={action.action}
                                onChange={e => updateAction(i, 'action', e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                              >
                                  <option value="forward_agent">Forward to Agent (Browser)</option>
                                  <option value="forward_mobile">Forward to Mobile</option>
                                  <option value="send_whatsapp">Deflect to WhatsApp</option>
                                  <option value="voicemail">Send to Voicemail</option>
                              </select>
                          </div>
                          
                          {action.action === 'send_whatsapp' && (
                              <select 
                                className="bg-green-900/30 border border-green-500/50 rounded px-2 py-2 text-green-400 text-sm w-40 outline-none"
                                value={action.target || ''}
                                onChange={e => updateAction(i, 'target', e.target.value)}
                              >
                                  <option value="">Select Template...</option>
                                  {(business.templates || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                          )}
                          
                          <button onClick={() => removeAction(i)} className="text-slate-500 hover:text-red-400">
                              <Icons.Trash />
                          </button>
                      </div>
                  ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                  <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg">
                      Deploy IVR Config
                  </button>
              </div>
          </div>

          {/* Simulator */}
          <div className="flex-1 bg-[#0b1120] border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-bold text-slate-500 uppercase">Phone Simulator</div>
              
              {simulatedCallStatus === 'idle' ? (
                  <div className="text-center">
                      <button 
                        onClick={simulateCall}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl hover:scale-110 transition-transform animate-pulse"
                      >
                          <Icons.Phone />
                      </button>
                      <p className="text-slate-400 mt-6 text-sm">Click to simulate incoming call to<br/><span className="text-white font-mono text-lg">{business.twilioNumber}</span></p>
                  </div>
              ) : (
                  <div className="w-64 bg-slate-900 border border-slate-600 rounded-[30px] p-6 shadow-2xl animate-in zoom-in duration-300">
                      <div className="text-center mb-8 mt-4">
                          <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🏢</div>
                          <h3 className="text-white font-bold text-lg">{business.name}</h3>
                          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{simulatedCallStatus}</p>
                          <p className="text-white font-mono text-lg mt-2">00:0{simulatedCallStatus === 'ringing' ? '0' : '5'}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-8">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map(k => (
                              <button 
                                key={k}
                                onClick={() => handleSimulatedKeyPress(k.toString())}
                                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors active:bg-blue-600"
                              >
                                  {k}
                              </button>
                          ))}
                      </div>

                      <div className="flex justify-center">
                          <button 
                            onClick={() => { window.speechSynthesis.cancel(); setSimulatedCallStatus('idle'); }}
                            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:bg-red-600"
                          >
                              <Icons.PhoneIncoming /> {/* Using as Hangup icon rotated conceptually */}
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default IVR;
