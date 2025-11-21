import React, { useState } from 'react';
import { BusinessProfile, Customer } from '../types';
import { Icons } from '../constants';
import { generateTicketResponse } from '../services/geminiService';

interface TicketsProps {
    business: BusinessProfile;
    customers: Customer[];
    onUpdateCustomer: (customer: Customer) => void;
}

interface Ticket {
    id: string;
    customerId: string;
    customerName: string;
    subject: string;
    status: 'open' | 'pending' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    lastMessage: string;
    timestamp: number;
    messages: { role: 'user' | 'agent', text: string, timestamp: number }[];
}

const Tickets: React.FC<TicketsProps> = ({ business, customers, onUpdateCustomer }) => {
    // Mock Tickets Data
    const [tickets, setTickets] = useState<Ticket[]>([
        {
            id: 'T-1023',
            customerId: 'c1',
            customerName: 'Alice Freeman',
            subject: 'Order delivery delayed',
            status: 'open',
            priority: 'high',
            lastMessage: 'I still haven\'t received my package.',
            timestamp: Date.now() - 3600000,
            messages: [
                { role: 'user', text: 'Hi, where is my order?', timestamp: Date.now() - 86400000 },
                { role: 'agent', text: 'Let me check that for you.', timestamp: Date.now() - 86300000 },
                { role: 'user', text: 'I still haven\'t received my package.', timestamp: Date.now() - 3600000 }
            ]
        },
        {
            id: 'T-1024',
            customerId: 'c2',
            customerName: 'Bob Smith',
            subject: 'Refund request',
            status: 'pending',
            priority: 'medium',
            lastMessage: 'Can you process this?',
            timestamp: Date.now() - 7200000,
            messages: [
                { role: 'user', text: 'I want a refund for the damaged item.', timestamp: Date.now() - 7200000 }
            ]
        }
    ]);

    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateResponse = async () => {
        if (!activeTicket) return;
        setIsGenerating(true);
        try {
            // Simulate AI generation
            await new Promise(resolve => setTimeout(resolve, 1500));
            const aiResponse = "I apologize for the delay, Alice. I've checked with our logistics partner and your package is currently out for delivery. It should arrive by 5 PM today. Is there anything else I can help you with?";
            setReply(aiResponse);
        } catch (error) {
            console.error("Failed to generate response", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendReply = () => {
        if (!activeTicket || !reply) return;

        const updatedTicket = {
            ...activeTicket,
            messages: [...activeTicket.messages, { role: 'agent' as const, text: reply, timestamp: Date.now() }],
            lastMessage: reply,
            status: 'pending' as const
        };

        setTickets(tickets.map(t => t.id === activeTicket.id ? updatedTicket : t));
        setActiveTicket(updatedTicket);
        setReply('');
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Support Helpdesk</h2>
                    <p className="text-slate-400 text-sm">Manage customer inquiries with AI-assisted responses.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-200">{tickets.filter(t => t.status === 'open').length} Open</span>
                    </div>
                    <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-200">{tickets.filter(t => t.status === 'pending').length} Pending</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Ticket List */}
                <div className="w-1/3 bg-[#1e293b] rounded-xl border border-slate-700/50 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Inbox</h3>
                        <Icons.Filter className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setActiveTicket(ticket)}
                                className={`p-4 border-b border-slate-700/50 cursor-pointer transition-colors hover:bg-slate-800/50 ${activeTicket?.id === ticket.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-sm ${activeTicket?.id === ticket.id ? 'text-blue-400' : 'text-white'}`}>{ticket.customerName}</h4>
                                    <span className="text-[10px] text-slate-500">2m ago</span>
                                </div>
                                <p className="text-xs text-slate-300 font-medium mb-1">{ticket.subject}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{ticket.lastMessage}</p>
                                <div className="flex mt-2 space-x-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                            ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                        }`}>
                                        {ticket.priority}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-slate-700 text-slate-400'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Ticket Detail */}
                <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                    {activeTicket ? (
                        <>
                            {/* Header */}
                            <div className="bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                        <h2 className="text-xl font-bold text-white">{activeTicket.subject}</h2>
                                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">#{activeTicket.id}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">from <span className="text-blue-400 cursor-pointer hover:underline">{activeTicket.customerName}</span> via Email</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Icons.Check /></button>
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Icons.Users /></button>
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Icons.Settings /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0b1120]">
                                {activeTicket.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === 'agent'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <p className={`text-[10px] mt-2 ${msg.role === 'agent' ? 'text-blue-200' : 'text-slate-500'}`}>10:42 AM</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Area */}
                            <div className="p-4 bg-slate-900 border-t border-slate-700">
                                <div className="relative">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type your reply here..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                                    ></textarea>
                                    <button
                                        onClick={handleGenerateResponse}
                                        disabled={isGenerating}
                                        className="absolute top-3 right-3 p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                                        title="Generate AI Response"
                                    >
                                        {isGenerating ? <Icons.Loader className="animate-spin w-4 h-4" /> : <Icons.Wand className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex space-x-2">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Icons.Paperclip className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Icons.Smile className="w-4 h-4" /></button>
                                    </div>
                                    <button
                                        onClick={handleSendReply}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center space-x-2"
                                    >
                                        <span>Send Reply</span>
                                        <Icons.Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0b1120]">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <Icons.MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Ticket Selected</h3>
                            <p className="max-w-xs text-center text-sm">Select a ticket from the inbox to view details and respond.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tickets;
