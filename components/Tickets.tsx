
import React, { useState } from 'react';
import { BusinessProfile, Ticket } from '../types';
import { Icons } from '../constants';
import { generateTicketSolution } from '../services/geminiService';

interface TicketsProps {
  business: BusinessProfile;
  tickets: Ticket[];
  onUpdateTickets: (tickets: Ticket[]) => void;
}

const Tickets: React.FC<TicketsProps> = ({ business, tickets, onUpdateTickets }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftReply, setDraftReply] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleMagicSolve = async () => {
    if (!selectedTicket) return;
    setIsDrafting(true);
    try {
      const solution = await generateTicketSolution(selectedTicket, business);
      setDraftReply(solution);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendReply = () => {
    if (!selectedTicket) return;
    // Update ticket status
    onUpdateTickets(tickets.map(t => t.id === selectedTicketId ? { ...t, status: 'resolved' } : t));
    setDraftReply('');
    alert("Reply sent via WhatsApp & Ticket Resolved!");
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Helpdesk</h2>
          <p className="text-slate-400">Resolve customer disputes and issues.</p>
        </div>
        <div className="flex space-x-2">
             <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700 text-sm text-slate-300 flex items-center">
                 <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {tickets.filter(t => t.priority === 'high').length} High Priority
             </div>
             <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700 text-sm text-slate-300 flex items-center">
                 <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> {tickets.filter(t => t.status === 'open').length} Open
             </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Ticket List */}
        <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-900/30">
                <input 
                    placeholder="Search tickets..." 
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white outline-none focus:border-blue-500"
                />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tickets.map(t => (
                    <div 
                        key={t.id}
                        onClick={() => { setSelectedTicketId(t.id); setDraftReply(''); }}
                        className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors ${selectedTicketId === t.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                    >
                        <div className="flex justify-between mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${t.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {t.status}
                            </span>
                            <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1 truncate">{t.subject}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                             <span className="text-xs text-slate-500">{t.customerName}</span>
                             {t.priority === 'high' && <span className="text-[10px] text-red-400 font-bold">🔥 HIGH</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Detail & Resolution */}
        <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl flex flex-col overflow-hidden relative">
             {selectedTicket ? (
                 <>
                    <div className="p-6 border-b border-slate-700 bg-slate-800">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                                 <p className="text-sm text-slate-400">Ticket #{selectedTicket.id} • via WhatsApp</p>
                             </div>
                             <div className="flex items-center space-x-2">
                                 <button className="text-slate-400 hover:text-white p-2 border border-slate-600 rounded"><Icons.Trash /></button>
                             </div>
                         </div>
                         
                         <div className="mt-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                             <div className="flex items-center mb-2">
                                 <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold mr-2">
                                     {selectedTicket.customerName.charAt(0)}
                                 </div>
                                 <span className="text-white text-sm font-bold">{selectedTicket.customerName}</span>
                             </div>
                             <p className="text-slate-300 text-sm leading-relaxed">{selectedTicket.description}</p>
                         </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {draftReply ? (
                             <div className="bg-green-900/10 border border-green-500/30 p-4 rounded-lg animate-in slide-in-from-bottom-2">
                                 <div className="flex justify-between mb-2">
                                     <span className="text-green-400 text-xs font-bold uppercase">Draft Reply (AI Generated)</span>
                                     <button onClick={() => setDraftReply('')} className="text-xs text-slate-500 hover:text-white">Discard</button>
                                 </div>
                                 <textarea 
                                    value={draftReply}
                                    onChange={(e) => setDraftReply(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm h-32 outline-none focus:border-green-500"
                                 />
                                 <div className="mt-3 flex justify-end">
                                     <button 
                                        onClick={handleSendReply}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center"
                                     >
                                         <span className="mr-2"><Icons.Send /></span> Send & Resolve
                                     </button>
                                 </div>
                             </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                 <div className="text-5xl">🪄</div>
                                 <p className="text-slate-400 max-w-xs">Let AI analyze the issue and store policies to draft the perfect response.</p>
                                 <button 
                                    onClick={handleMagicSolve}
                                    disabled={isDrafting}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-purple-900/30 transition-transform hover:scale-105"
                                 >
                                     {isDrafting ? 'Analyzing...' : 'Magic Solve'}
                                 </button>
                             </div>
                        )}
                    </div>
                 </>
             ) : (
                 <div className="flex items-center justify-center h-full text-slate-500">Select a ticket</div>
             )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
