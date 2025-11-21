
import React, { useState } from 'react';
import { BusinessProfile, ReturnRequest } from '../types';
import { Icons } from '../constants';
import { analyzeReturnRequest } from '../services/geminiService';

interface ReturnsProps {
  business: BusinessProfile;
}

const MOCK_RETURNS: ReturnRequest[] = [
    {
        id: 'ret_1',
        orderId: 'ord_123',
        customerName: 'Alice Walker',
        items: ['Neon Espresso'],
        reason: 'Item arrived damaged',
        status: 'pending',
        requestedAt: Date.now() - 3600000,
        refundAmount: 25.50
    },
    {
        id: 'ret_2',
        orderId: 'ord_456',
        customerName: 'Bob Builder',
        items: ['Cyber Mug'],
        reason: 'Changed my mind',
        status: 'approved',
        requestedAt: Date.now() - 86400000,
        refundAmount: 15.00
    }
];

const Returns: React.FC<ReturnsProps> = ({ business }) => {
  const [requests, setRequests] = useState<ReturnRequest[]>(MOCK_RETURNS);
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currency = business.currencySymbol || '$';

  const handleAudit = async (req: ReturnRequest) => {
      setIsAnalyzing(true);
      try {
          const result = await analyzeReturnRequest(req, business);
          const updatedReq = { ...req, aiDecision: result };
          
          setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
          setSelectedRequest(updatedReq);
      } catch (e) {
          console.error(e);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleAction = (id: string, action: ReturnRequest['status']) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
      if (action === 'approved') {
          alert("Return Approved! Shipping label sent to customer via WhatsApp.");
      }
      if (action === 'refunded') {
          alert("Refund processed successfully via Stripe.");
      }
      setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          case 'approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'refunded': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Returns & Refunds</h2>
          <p className="text-slate-400">Manage RMAs and reverse logistics.</p>
        </div>
        <div className="flex space-x-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Pending</span>
                <span className="text-xl font-bold text-yellow-400">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Refunded (Mo)</span>
                <span className="text-xl font-bold text-green-400">{currency}{requests.filter(r => r.status === 'refunded').reduce((acc,r) => acc+r.refundAmount, 0)}</span>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* List */}
          <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                  <h3 className="font-bold text-white text-sm uppercase">Requests</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {requests.map(req => (
                      <div 
                        key={req.id} 
                        onClick={() => setSelectedRequest(req)}
                        className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors ${selectedRequest?.id === req.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                      >
                          <div className="flex justify-between mb-1">
                              <span className="font-bold text-white text-sm">{req.customerName}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">Order #{req.orderId}</p>
                          <p className="text-xs text-slate-300 italic truncate">"{req.reason}"</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Detail */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl p-8 flex flex-col overflow-y-auto custom-scrollbar relative">
              {selectedRequest ? (
                  <>
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h2 className="text-2xl font-bold text-white">Return Request #{selectedRequest.id.slice(-4)}</h2>
                              <p className="text-slate-400 text-sm">Requested on {new Date(selectedRequest.requestedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold">Refund Amount</p>
                              <p className="text-2xl font-mono font-bold text-white">{currency}{selectedRequest.refundAmount.toFixed(2)}</p>
                          </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                          <h4 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Items to Return</h4>
                          {selectedRequest.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between py-2">
                                  <span className="text-slate-300 text-sm">{item}</span>
                                  <span className="text-xs text-slate-500">Qty: 1</span>
                              </div>
                          ))}
                          <div className="mt-4 pt-4 border-t border-slate-700">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Customer Reason</p>
                              <p className="text-white italic">"{selectedRequest.reason}"</p>
                          </div>
                      </div>

                      {/* AI Audit Section */}
                      <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-purple-300 flex items-center">
                                  <Icons.Shield /> <span className="ml-2">AI Policy Audit</span>
                              </h4>
                              {!selectedRequest.aiDecision && (
                                  <button 
                                    onClick={() => handleAudit(selectedRequest)}
                                    disabled={isAnalyzing}
                                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold flex items-center disabled:opacity-50"
                                  >
                                      {isAnalyzing ? 'Analyzing...' : 'Run Check'}
                                  </button>
                              )}
                          </div>
                          
                          {selectedRequest.aiDecision ? (
                              <div className="animate-in fade-in">
                                  <div className="flex items-center mb-2">
                                      <span className={`text-sm font-bold px-2 py-0.5 rounded uppercase ${selectedRequest.aiDecision.action === 'approve' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                          Recommended: {selectedRequest.aiDecision.action}
                                      </span>
                                      <span className="text-xs text-purple-300 ml-3 font-mono">Confidence: {(selectedRequest.aiDecision.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed">{selectedRequest.aiDecision.reasoning}</p>
                              </div>
                          ) : (
                              <p className="text-xs text-slate-500 italic">Click run check to compare this request against your store policies.</p>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto border-t border-slate-700 pt-6 flex justify-end gap-3">
                          {selectedRequest.status === 'pending' && (
                              <>
                                  <button onClick={() => handleAction(selectedRequest.id, 'rejected')} className="px-4 py-2 rounded border border-red-500 text-red-400 hover:bg-red-900/20 font-bold text-sm">Reject</button>
                                  <button onClick={() => handleAction(selectedRequest.id, 'approved')} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg">Approve & Send Label</button>
                              </>
                          )}
                          {selectedRequest.status === 'approved' && (
                              <button onClick={() => handleAction(selectedRequest.id, 'refunded')} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg">Issue Refund</button>
                          )}
                      </div>
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                      <div className="text-6xl mb-4">📦</div>
                      <p>Select a return request to view details.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Returns;
