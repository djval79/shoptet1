
import React, { useState } from 'react';
import { BusinessProfile, ComplianceRequest } from '../types';
import { MOCK_COMPLIANCE_REQUESTS, Icons } from '../constants';
import { generateLegalPolicy } from '../services/geminiService';

interface LegalProps {
  business: BusinessProfile;
}

const Legal: React.FC<LegalProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'requests' | 'settings'>('policies');
  const [requests, setRequests] = useState<ComplianceRequest[]>(MOCK_COMPLIANCE_REQUESTS);
  
  // Policy Generator State
  const [docType, setDocType] = useState<'privacy' | 'terms'>('privacy');
  const [docContent, setDocContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
      setIsGenerating(true);
      try {
          const text = await generateLegalPolicy(docType, business);
          setDocContent(text);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleProcessRequest = (id: string) => {
      if(confirm("Are you sure you want to process this data request? This action cannot be undone.")) {
          setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Legal & Compliance Center</h2>
          <p className="text-slate-400">Manage policies, GDPR requests, and Meta compliance.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            {['policies', 'requests', 'settings'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'policies' && (
              <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-64 bg-slate-900 border-r border-slate-700 p-4 space-y-2">
                      <button 
                        onClick={() => setDocType('privacy')}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${docType === 'privacy' ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-transparent text-slate-400 hover:text-white'}`}
                      >
                          Privacy Policy
                      </button>
                      <button 
                        onClick={() => setDocType('terms')}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${docType === 'terms' ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-transparent text-slate-400 hover:text-white'}`}
                      >
                          Terms of Service
                      </button>
                  </div>
                  
                  {/* Editor */}
                  <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white font-bold text-lg capitalize">{docType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} Draft</h3>
                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center disabled:opacity-50"
                          >
                              {isGenerating ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Drafting...
                                  </>
                              ) : (
                                  <>
                                    <span className="mr-2">✨</span> AI Auto-Draft
                                  </>
                              )}
                          </button>
                      </div>
                      <textarea 
                        value={docContent}
                        onChange={e => setDocContent(e.target.value)}
                        className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 font-mono text-sm outline-none focus:border-blue-500 resize-none"
                        placeholder="Click AI Auto-Draft to generate a compliant document based on your business settings..."
                      />
                      <div className="mt-4 flex justify-end">
                          <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">
                              Publish Document
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'requests' && (
              <div className="p-8 overflow-y-auto">
                  <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-8 flex items-start">
                      <div className="text-blue-400 mr-3 text-xl">ℹ️</div>
                      <div>
                          <h4 className="text-blue-300 font-bold text-sm">GDPR / CCPA Compliance</h4>
                          <p className="text-blue-200/70 text-xs mt-1">
                              You must respond to "Right to be Forgotten" (Delete) requests within 30 days. 
                              Processing a request will anonymize customer data in your CRM.
                          </p>
                      </div>
                  </div>

                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                          <tr>
                              <th className="p-4 rounded-tl-lg">Request ID</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Date Requested</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 rounded-tr-lg text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 text-sm">
                          {requests.map(req => (
                              <tr key={req.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-mono text-slate-500 text-xs">{req.id}</td>
                                  <td className="p-4">
                                      <div className="text-white font-medium">{req.customerName}</div>
                                      <div className="text-slate-500 text-xs">{req.customerPhone}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${req.type === 'delete_data' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                          {req.type.replace('_', ' ')}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-400 text-xs">
                                      {new Date(req.requestDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                      {req.status === 'completed' ? (
                                          <span className="flex items-center text-green-400 text-xs font-bold">
                                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span> Completed
                                          </span>
                                      ) : (
                                          <span className="flex items-center text-yellow-400 text-xs font-bold">
                                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span> Pending
                                          </span>
                                      )}
                                  </td>
                                  <td className="p-4 text-right">
                                      {req.status === 'pending' && (
                                          <button 
                                            onClick={() => handleProcessRequest(req.id)}
                                            className="text-xs bg-slate-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                                          >
                                              Process
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {activeTab === 'settings' && (
              <div className="p-8 max-w-2xl">
                  <h3 className="text-white font-bold text-lg mb-6">Compliance Configuration</h3>
                  
                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div>
                              <h4 className="text-white font-medium text-sm">Double Opt-In</h4>
                              <p className="text-slate-400 text-xs mt-1 max-w-sm">Require customers to confirm they want to receive messages before the AI starts selling.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div>
                              <h4 className="text-white font-medium text-sm">Age Verification Gate</h4>
                              <p className="text-slate-400 text-xs mt-1 max-w-sm">Ask users to confirm they are over 18 before showing alcohol or tobacco products.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div>
                              <h4 className="text-white font-medium text-sm">Automated Unsubscribe</h4>
                              <p className="text-slate-400 text-xs mt-1 max-w-sm">Automatically stop bot when user says "Stop", "Unsubscribe" or "Cancel".</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 opacity-50 cursor-not-allowed"></div>
                          </label>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default Legal;
