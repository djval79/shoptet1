
import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile, Customer, Message, Product, Template, User } from '../types';
import { Icons, MOCK_TEMPLATES, MOCK_TEAM } from '../constants';
import { generateAgentResponse, generateSmartReplies } from '../services/geminiService';

interface InboxProps {
  business: BusinessProfile;
  customers: Customer[];
  currentUser?: User | null;
  onUpdateCustomers: (customers: Customer[]) => void;
}

const Inbox: React.FC<InboxProps> = ({ business, customers, currentUser, onUpdateCustomers }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'unassigned'>('all');
  
  // UI State
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Quick Reply State
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [filteredQuickReplies, setFilteredQuickReplies] = useState(business.savedReplies || []);
  
  // Filtered Customer List
  const filteredCustomers = customers.filter(c => {
      if (filterType === 'mine') return c.assignedTo === currentUser?.id;
      if (filterType === 'unassigned') return !c.assignedTo;
      return true;
  });

  // Ensure selected customer is valid
  useEffect(() => {
      if (filteredCustomers.length > 0) {
          // If current selected is not in list, select first
          if (!selectedCustomerId || !filteredCustomers.find(c => c.id === selectedCustomerId)) {
              setSelectedCustomerId(filteredCustomers[0].id);
          }
      } else {
          setSelectedCustomerId('');
      }
  }, [filterType, customers.length]); // Intentionally not depending on customers deep content to avoid jumps

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isOptedOut = selectedCustomer?.optInStatus === 'opted_out';
  
  // 24-hour Window Logic
  const lastUserMsg = selectedCustomer ? [...selectedCustomer.history].reverse().find(m => m.role === 'user') : undefined;
  const hoursSinceLastUserMsg = lastUserMsg ? (Date.now() - lastUserMsg.timestamp) / (1000 * 60 * 60) : 0;
  const isSessionExpired = lastUserMsg && hoursSinceLastUserMsg > 24;
  const timeRemaining = lastUserMsg ? Math.max(0, 24 - hoursSinceLastUserMsg) : 24;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedCustomer?.history, isTyping, selectedCustomerId]);
  
  // Quick Reply Logic
  useEffect(() => {
      if (input.startsWith('/')) {
          const query = input.slice(1).toLowerCase();
          const matches = (business.savedReplies || []).filter(r => r.shortcut.toLowerCase().includes(query));
          setFilteredQuickReplies(matches);
          setShowQuickReplies(matches.length > 0);
      } else {
          setShowQuickReplies(false);
      }
  }, [input, business.savedReplies]);

  // Generate Suggestions when AI is paused and user is last sender
  useEffect(() => {
      if (selectedCustomer) {
        const lastMsg = selectedCustomer.history[selectedCustomer.history.length - 1];
        if (selectedCustomer.aiPaused && lastMsg && lastMsg.role === 'user' && !isSessionExpired && !isOptedOut) {
            generateSuggestions();
        } else {
            setSuggestedReplies([]);
        }
      }
  }, [selectedCustomer?.history, selectedCustomer?.aiPaused]);

  const generateSuggestions = async () => {
      if (!selectedCustomer) return;
      setIsGeneratingSuggestions(true);
      try {
          const result = await generateSmartReplies(selectedCustomer.history, business);
          setSuggestedReplies(result.suggestions || []);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingSuggestions(false);
      }
  };

  const updateCustomer = (updated: Customer) => {
      onUpdateCustomers(customers.map(c => c.id === updated.id ? updated : c));
  };

  const toggleAiPause = (customerId: string) => {
    if (selectedCustomer) {
        updateCustomer({ ...selectedCustomer, aiPaused: !selectedCustomer.aiPaused });
    }
  };
  
  const handleAssign = (agentId: string) => {
      if (!selectedCustomer) return;
      const agent = MOCK_TEAM.find(m => m.id === agentId);
      const assignedName = agent ? agent.name : 'Unassigned';
      
      const sysMsg: Message = {
          id: `sys_assign_${Date.now()}`,
          role: 'system',
          text: `⇄ Conversation assigned to ${assignedName}`,
          timestamp: Date.now(),
          isSystem: true
      };

      updateCustomer({ 
          ...selectedCustomer, 
          assignedTo: agentId,
          history: [...selectedCustomer.history, sysMsg]
      });
      setShowAssignMenu(false);
  };

  // --- SMART ROUTING LOGIC ---
  const applyRoutingRules = (text: string, customer: Customer): Customer => {
      let updatedCustomer = { ...customer };
      let didRoute = false;

      if (business.routingRules) {
          business.routingRules.forEach(rule => {
              if (!rule.active) return;
              
              let matches = false;
              if (rule.condition === 'contains_keyword' && text.toLowerCase().includes(rule.value.toLowerCase())) matches = true;
              if (rule.condition === 'is_vip' && customer.tags?.includes('VIP')) matches = true;
              if (rule.condition === 'is_new' && customer.history.length <= 1) matches = true;

              if (matches) {
                  if (rule.action === 'assign_agent') {
                      updatedCustomer.assignedTo = rule.target;
                      didRoute = true;
                  }
                  if (rule.action === 'add_tag') {
                      const currentTags = updatedCustomer.tags || [];
                      if (!currentTags.includes(rule.target)) {
                          updatedCustomer.tags = [...currentTags, rule.target];
                          didRoute = true;
                      }
                  }
                  // Additional actions like priority could be handled if Customer had a priority field
              }
          });
      }
      
      if (didRoute) {
          // Add system message about routing
          const sysMsg: Message = {
              id: `sys_route_${Date.now()}`,
              role: 'system',
              text: `⚡ Smart Routing Applied`,
              timestamp: Date.now(),
              isSystem: true
          };
          updatedCustomer.history = [...updatedCustomer.history, sysMsg];
      }

      return updatedCustomer;
  };

  const sendMessage = async (text: string, role: 'user' | 'model', product?: Product, template?: Template, file?: { name: string, url: string, type: 'pdf' | 'audio' | 'video' }, isSimulation = false) => {
    if (!selectedCustomer) return;
    if (!text.trim() && !product && !template && !file) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: role,
      text: text,
      product: product,
      template: template,
      file: file,
      timestamp: Date.now()
    };

    // 1. Update State with New Message
    let updatedCustomer = {
        ...selectedCustomer,
        history: [...selectedCustomer.history, newMessage],
        lastActive: Date.now()
    };

    // 2. Apply Routing if User Message
    if (role === 'user') {
        updatedCustomer = applyRoutingRules(text, updatedCustomer);
    }

    updateCustomer(updatedCustomer);

    setInput('');
    setShowQuickReplies(false);
    setShowAttachMenu(false);
    setSuggestedReplies([]); // Clear suggestions on send

    // 3. If this was a USER message (simulated) and AI is NOT PAUSED, trigger AI response
    if (role === 'user' && !updatedCustomer.aiPaused && !isSimulation) {
        // Pass the updated customer (with potentially new routing assignment) to AI trigger? 
        // Actually just using ID is safer to re-fetch latest state in trigger
        triggerAiResponse(selectedCustomerId, updatedCustomer.history);
    }
  };

  const triggerAiResponse = async (customerId: string, history: Message[]) => {
    setIsTyping(true);
    try {
       const response = await generateAgentResponse(history, business, []);
       
       if (response.optOut) {
            const c = customers.find(cust => cust.id === customerId);
            if (c) updateCustomer({ ...c, optInStatus: 'opted_out' });
       }

       const aiMsg: Message = {
           id: (Date.now() + 1).toString(),
           role: 'model',
           text: response.text,
           product: response.product,
           timestamp: Date.now()
       };
       
       const c = customers.find(cust => cust.id === customerId);
       if (c) {
           onUpdateCustomers(customers.map(cust => cust.id === customerId ? { ...cust, history: [...history, aiMsg], lastActive: Date.now() } : cust));
       }

    } catch (e) {
        console.error("AI Fail", e);
    } finally {
        setIsTyping(false);
    }
  };

  const handleSimulateIncoming = () => {
    if (!selectedCustomer) return;
    const randomPhrases = [
        "Is this still in stock?",
        "Can I get a discount?",
        "Do you deliver to downtown?",
        "I'm ready to buy.",
        "What are your hours?",
        "STOP",
        "Please unsubscribe me",
        "I want a refund",
        "Can I speak to support?"
    ];
    const text = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
    
    if (text.toUpperCase() === 'STOP') {
         updateCustomer({ ...selectedCustomer, optInStatus: 'opted_out' });
    }

    sendMessage(text, 'user');
  };

  const handleHumanSend = () => {
      sendMessage(input, 'model');
  };
  
  const handleSendProduct = (p: Product) => {
      sendMessage("", 'model', p);
      setShowProductPicker(false);
  };
  
  const handleSendTemplate = (t: Template) => {
      sendMessage("", 'model', undefined, t);
      setShowTemplatePicker(false);
  };
  
  const handleSmartReplyClick = (reply: string) => {
      sendMessage(reply, 'model');
  };

  const handleQuickReplySelect = (text: string) => {
      setInput(text);
      setShowQuickReplies(false);
  };

  const handleCreateTicket = () => {
      if (selectedCustomer)
         alert(`Ticket created for ${selectedCustomer.name}. View it in the Support tab.`);
  };

  const handleUpdateNotes = (notes: string) => {
      if (selectedCustomer)
         updateCustomer({ ...selectedCustomer, notes });
  };
  
  const handleUpdateTags = (tagInput: string) => {
      if (!selectedCustomer) return;
      const newTags = tagInput.split(',').map(t => t.trim()).filter(t => t);
      updateCustomer({ ...selectedCustomer, tags: newTags });
  };

  const handleMockAttachment = (type: 'image' | 'pdf') => {
      if (!selectedCustomer) return;
      if (type === 'image') {
          // Hack: creating a message with image property manually
          const newMessage: Message = {
              id: Date.now().toString(),
              role: 'model',
              text: '',
              image: 'https://picsum.photos/400/300',
              timestamp: Date.now()
          };
          updateCustomer({ ...selectedCustomer, history: [...selectedCustomer.history, newMessage] });
      } else {
          sendMessage("", 'model', undefined, undefined, { name: 'Brochure.pdf', url: '', type: 'pdf' });
      }
      setShowAttachMenu(false);
  };

  const toggleRecording = () => {
      if (isRecording) {
          setIsRecording(false);
          sendMessage("", 'model', undefined, undefined, { name: 'Voice Note', url: '', type: 'audio' });
      } else {
          setIsRecording(true);
      }
  };

  const handleExportTranscript = () => {
      if (!selectedCustomer) return;
      const lines = selectedCustomer.history.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.text || (m.image ? 'Image' : m.file ? 'File' : '')}`);
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${selectedCustomer.name}_${Date.now()}.txt`;
      a.click();
  };

  const formatRemainingTime = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.floor((hours - h) * 60);
      return `${h}h ${m}m`;
  };

  const getAgentAvatar = (id?: string) => {
      if (!id) return null;
      const agent = MOCK_TEAM.find(m => m.id === id);
      return agent ? agent.avatar : null;
  };
  
  const getAgentName = (id?: string) => {
      if (!id) return 'Unassigned';
      const agent = MOCK_TEAM.find(m => m.id === id);
      return agent ? agent.name : 'Unknown';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-900 animate-in fade-in duration-500 border-t border-slate-800">
      
      {/* LEFT: Conversation List (25%) */}
      <div className="w-1/4 border-r border-slate-800 flex flex-col bg-slate-900 min-w-[250px]">
         <div className="p-4 border-b border-slate-800 flex flex-col gap-4 bg-slate-900/95 sticky top-0 z-10">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Inbox</h3>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleSimulateIncoming}
                        className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors"
                        title="Simulate Customer Message"
                    >
                        ⚡ Test Msg
                    </button>
                    <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-1 rounded-full font-bold">{filteredCustomers.length}</span>
                </div>
            </div>
            
            {/* Filters */}
            <div className="flex bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setFilterType('mine')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${filterType === 'mine' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Mine
                </button>
                <button 
                    onClick={() => setFilterType('unassigned')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${filterType === 'unassigned' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    Unassigned
                </button>
                <button 
                    onClick={() => setFilterType('all')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${filterType === 'all' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    All
                </button>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                    No chats found.
                </div>
            )}
            {filteredCustomers.map(c => {
                const lastMsg = c.history[c.history.length - 1];
                return (
                    <div 
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`p-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors relative group ${selectedCustomerId === c.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                    >
                        <div className="flex justify-between mb-1">
                            <span className={`font-semibold text-sm truncate ${selectedCustomerId === c.id ? 'text-white' : 'text-slate-300'}`}>{c.name}</span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(lastMsg?.timestamp || c.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                            {lastMsg?.call ? (lastMsg.call.status === 'missed' ? '📞 Missed Call' : '📞 Call Log') : lastMsg?.file ? `📎 ${lastMsg.file.type}` : lastMsg?.image ? '📷 Image' : lastMsg?.text || "No messages"}
                        </p>
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${c.status === 'lead' ? 'border-blue-500/30 text-blue-400' : 'border-green-500/30 text-green-400'}`}>
                                    {c.status}
                                 </span>
                                 {c.aiPaused && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">HUMAN</span>}
                            </div>
                            {c.assignedTo && (
                                <img src={getAgentAvatar(c.assignedTo) || ''} alt="Assignee" className="w-4 h-4 rounded-full border border-slate-600" title={`Assigned to ${getAgentName(c.assignedTo)}`} />
                            )}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      {/* CENTER: Chat Area (50%) */}
      <div className="w-1/2 flex flex-col bg-[#0b1120] relative border-r border-slate-800">
         {selectedCustomer ? (
             <>
                {/* Header */}
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-20 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-white text-sm">{selectedCustomer.name}</h3>
                                {isOptedOut ? (
                                    <span className="text-[9px] bg-red-500 text-white px-1.5 rounded font-bold uppercase">Opted Out</span>
                                ) : isSessionExpired && (
                                    <span className="text-[9px] bg-orange-500 text-white px-1.5 rounded font-bold uppercase">Window Closed</span>
                                )}
                            </div>
                            <div className="flex items-center text-[10px] text-slate-400 space-x-2">
                                <span>{selectedCustomer.phone}</span>
                                <span>•</span>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowAssignMenu(!showAssignMenu)}
                                        className="flex items-center hover:text-white transition-colors"
                                    >
                                        <span className="mr-1">{selectedCustomer.assignedTo ? '👤' : '⚪'}</span>
                                        {selectedCustomer.assignedTo ? getAgentName(selectedCustomer.assignedTo) : 'Unassigned'}
                                    </button>
                                    
                                    {showAssignMenu && (
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="p-2 border-b border-slate-700 text-[10px] text-slate-500 uppercase font-bold">Assign To</div>
                                            {MOCK_TEAM.map(member => (
                                                <button 
                                                    key={member.id}
                                                    onClick={() => handleAssign(member.id)}
                                                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center"
                                                >
                                                    <img src={member.avatar} className="w-4 h-4 rounded-full mr-2" alt="" />
                                                    {member.name}
                                                    {selectedCustomer.assignedTo === member.id && <span className="ml-auto text-blue-400">✓</span>}
                                                </button>
                                            ))}
                                            {selectedCustomer.assignedTo && (
                                                <button 
                                                    onClick={() => { updateCustomer({...selectedCustomer, assignedTo: undefined}); setShowAssignMenu(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-700 border-t border-slate-700"
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button onClick={handleExportTranscript} className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-700 flex items-center">
                            <span className="mr-1"><Icons.DownloadCloud /></span> Export
                        </button>
                        
                        {!selectedCustomer.assignedTo && currentUser && (
                            <button 
                                onClick={() => handleAssign(currentUser.id)}
                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold shadow-sm mr-2"
                            >
                                Claim
                            </button>
                        )}

                        <button 
                            onClick={() => toggleAiPause(selectedCustomer.id)}
                            disabled={isOptedOut || isSessionExpired}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all border ${selectedCustomer.aiPaused ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}
                        >
                            <span className="text-xs font-bold">{selectedCustomer.aiPaused ? 'PAUSED' : 'AUTO-PILOT'}</span>
                            <div className={`w-2 h-2 rounded-full ${selectedCustomer.aiPaused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain bg-slate-900/95 bg-blend-overlay relative custom-scrollbar">
                    {selectedCustomer.history.map(msg => {
                        const isUser = msg.role === 'user';
                        const isSystem = msg.isSystem;
                        const isCall = !!msg.call;

                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <span className="text-[10px] text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                                        {msg.text}
                                    </span>
                                </div>
                            );
                        }
                        
                        if (isCall) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4 animate-in fade-in">
                                    <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg shadow-lg border border-opacity-20 ${msg.call?.status === 'missed' ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                                        <div className={`p-2 rounded-full ${msg.call?.status === 'missed' ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
                                            <Icons.PhoneMissed />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold uppercase">{msg.call?.status.replace('_', ' ')} Call</p>
                                            <p className="opacity-70">{new Date(msg.timestamp).toLocaleString()} • {msg.call?.duration ? `${Math.floor(msg.call.duration / 60)}m ${msg.call.duration % 60}s` : '0s'}</p>
                                        </div>
                                        {msg.call?.status === 'voicemail' && (
                                            <div className="pl-3 border-l border-slate-600 flex flex-col">
                                                <span className="text-[9px] font-bold uppercase mb-1">Transcription</span>
                                                <p className="italic text-[10px] opacity-80 max-w-[150px]">"{msg.text.replace('[Left a Voicemail]', 'Hi, please call me back...')}"</p>
                                                <button className="mt-1 text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded flex items-center justify-center">
                                                    ▶ Play Audio
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                                <div className={`max-w-[80%] rounded-lg p-2 px-3 text-sm shadow-md relative ${
                                    isUser 
                                    ? 'bg-[#202c33] text-white rounded-tl-none' 
                                    : 'bg-[#005c4b] text-white rounded-tr-none'
                                }`}>
                                    {msg.text}
                                    
                                    {msg.image && (
                                        <div className="mb-1 rounded overflow-hidden">
                                            <img src={msg.image} alt="Att" className="w-full h-auto max-h-48 object-cover" />
                                        </div>
                                    )}

                                    {msg.file && (
                                        <div className="flex items-center space-x-2 bg-black/20 p-2 rounded mt-1">
                                            <div className="text-lg">
                                                {msg.file.type === 'audio' ? '🎤' : msg.file.type === 'pdf' ? '📄' : '📹'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold truncate">{msg.file.name}</p>
                                                <p className="text-[10px] opacity-70 uppercase">{msg.file.type}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {msg.template && (
                                        <div className="mt-2 border-t border-white/20 pt-2 text-xs">
                                            <p className="font-bold opacity-75 mb-1">Template: {msg.template.name}</p>
                                            <p className="whitespace-pre-line opacity-90 italic">{msg.template.body}</p>
                                            {msg.template.buttons && (
                                                <div className="mt-2 flex gap-1 flex-wrap">
                                                    {msg.template.buttons.map((b, i) => (
                                                        <span key={i} className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-bold">{b.text}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.product && (
                                        <div className="mt-2 bg-white rounded overflow-hidden text-black p-2 flex items-center space-x-2">
                                            {msg.product.image && <img src={msg.product.image} className="w-10 h-10 object-cover rounded" alt="" />}
                                            <div>
                                                <p className="font-bold text-xs">{msg.product.name}</p>
                                                <p className="font-bold text-green-600 text-xs">${msg.product.price}</p>
                                            </div>
                                        </div>
                                    )}
                                    <span className="text-[9px] text-slate-300 block text-right mt-1 opacity-70">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {!isUser && ' • Agent'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-end">
                            <div className="bg-[#005c4b] p-2 rounded-xl rounded-tr-none">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    
                    {/* Suggestions */}
                    {suggestedReplies.length > 0 && !isOptedOut && !isSessionExpired && selectedCustomer.aiPaused && (
                        <div className="sticky bottom-0 left-0 right-0 flex gap-2 p-2 overflow-x-auto justify-end bg-gradient-to-t from-[#0b1120] to-transparent pb-4">
                            {suggestedReplies.map((reply, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleSmartReplyClick(reply)}
                                    className="bg-slate-800/90 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-500 hover:text-white transition-colors shadow-lg backdrop-blur-sm whitespace-nowrap"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {isOptedOut ? (
                    <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center text-slate-500 text-sm italic">
                        🚫 Messaging disabled (Opt-out).
                    </div>
                ) : isSessionExpired ? (
                    <div className="p-4 bg-orange-900/20 border-t border-orange-500/30 flex flex-col items-center justify-center text-orange-300 text-sm">
                        <p className="text-xs text-orange-400/70 mb-2">Session expired. Send a template to re-engage.</p>
                        <button 
                            onClick={() => setShowTemplatePicker(true)}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold text-xs shadow-lg"
                        >
                            Browse Templates
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-900 border-t border-slate-800 p-3 relative">
                        {/* Quick Replies Popover */}
                        {showQuickReplies && (
                            <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-40">
                                <div className="max-h-48 overflow-y-auto">
                                    {filteredQuickReplies.map(qr => (
                                        <div 
                                            key={qr.id} 
                                            onClick={() => handleQuickReplySelect(qr.text)}
                                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/30 last:border-0"
                                        >
                                            <div className="flex justify-between"><span className="text-white font-bold text-xs">/{qr.shortcut}</span></div>
                                            <p className="text-slate-400 text-xs truncate">{qr.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Attachment Menu */}
                        {showAttachMenu && (
                            <div className="absolute bottom-16 left-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 flex flex-col gap-2 animate-in slide-in-from-bottom-2 z-30">
                                <button onClick={() => handleMockAttachment('image')} className="flex items-center space-x-2 text-xs text-slate-300 hover:bg-slate-700 p-2 rounded"><span className="text-lg">📷</span> <span>Image</span></button>
                                <button onClick={() => handleMockAttachment('pdf')} className="flex items-center space-x-2 text-xs text-slate-300 hover:bg-slate-700 p-2 rounded"><span className="text-lg">📄</span> <span>Document</span></button>
                                <button onClick={() => setShowProductPicker(true)} className="flex items-center space-x-2 text-xs text-slate-300 hover:bg-slate-700 p-2 rounded"><span className="text-lg">🛍️</span> <span>Product</span></button>
                            </div>
                        )}

                        <div className="flex items-end space-x-2">
                            <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 mb-1">
                                <Icons.Plus />
                            </button>
                            
                            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex items-center">
                                <textarea 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleHumanSend(); } }}
                                    placeholder={selectedCustomer.aiPaused ? "Type a message..." : "Pause AI to type..."}
                                    disabled={!selectedCustomer.aiPaused}
                                    rows={1}
                                    className={`flex-1 bg-transparent text-white outline-none text-sm resize-none max-h-24 ${!selectedCustomer.aiPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={{minHeight: '24px'}}
                                />
                            </div>
                            
                            {input.trim() ? (
                                <button onClick={handleHumanSend} disabled={!selectedCustomer.aiPaused} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg mb-1">
                                    <Icons.Send />
                                </button>
                            ) : (
                                <button onClick={toggleRecording} disabled={!selectedCustomer.aiPaused} className={`p-2 rounded-full transition-all shadow-lg mb-1 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                    {isRecording ? '⏹' : '🎤'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Floating Template Picker */}
                {showTemplatePicker && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setShowTemplatePicker(false)}>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md max-h-[80%] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                <h4 className="text-white font-bold">Select Template</h4>
                                <button onClick={() => setShowTemplatePicker(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {(business.templates || MOCK_TEMPLATES).map(t => (
                                    <div key={t.id} onClick={() => handleSendTemplate(t)} className="p-3 hover:bg-slate-700/50 rounded cursor-pointer border-b border-slate-700/30 last:border-0 group">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-white text-sm">{t.name}</span>
                                            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">{t.category}</span>
                                        </div>
                                        <p className="text-slate-400 text-xs line-clamp-2">{t.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Product Picker */}
                {showProductPicker && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setShowProductPicker(false)}>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md max-h-[80%] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                <h4 className="text-white font-bold">Select Product</h4>
                                <button onClick={() => setShowProductPicker(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                {business.products.map(p => (
                                    <div key={p.id} onClick={() => handleSendProduct(p)} className="p-2 hover:bg-slate-700/50 rounded cursor-pointer flex items-center gap-3 group">
                                        <img src={p.image} className="w-10 h-10 rounded object-cover bg-slate-700" alt="" />
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-bold">{p.name}</p>
                                            <p className="text-slate-400 text-xs">${p.price}</p>
                                        </div>
                                        <button className="text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100">Send</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
             </>
         ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                 <div className="text-4xl mb-4 opacity-30">💬</div>
                 <p>Select a conversation</p>
             </div>
         )}
      </div>

      {/* RIGHT: Customer Context (25%) */}
      <div className="w-1/4 border-l border-slate-800 bg-slate-900 flex flex-col min-w-[250px]">
          {selectedCustomer ? (
              <>
                <div className="p-6 border-b border-slate-800 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mx-auto mb-3 flex items-center justify-center text-2xl text-white font-bold shadow-lg shadow-blue-900/20">
                        {selectedCustomer.name.charAt(0)}
                    </div>
                    <h3 className="text-white font-bold text-lg">{selectedCustomer.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{selectedCustomer.phone}</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={handleCreateTicket} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs px-3 py-1.5 rounded transition-colors">Create Ticket</button>
                        <button onClick={() => alert("Order draft feature simulated")} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs px-3 py-1.5 rounded transition-colors">Draft Order</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Lifetime Value</p>
                            <p className="text-white font-mono font-bold text-lg">${selectedCustomer.totalSpend}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Lead Score</p>
                            <p className={`font-mono font-bold text-lg ${selectedCustomer.leadScore && selectedCustomer.leadScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {selectedCustomer.leadScore || '--'}
                            </p>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {selectedCustomer.aiSummary && (
                        <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                                <span className="text-xs font-bold text-purple-300 uppercase">AI Summary</span>
                            </div>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{selectedCustomer.aiSummary}"</p>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tags</label>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCustomer.tags?.map((t, i) => (
                                <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{t}</span>
                            ))}
                        </div>
                        <input 
                            placeholder="+ Add tags (comma sep)"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdateTags(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>

                    {/* Notes */}
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Agent Notes</label>
                        <textarea 
                            className="w-full bg-slate-800/50 border border-slate-700 rounded p-3 text-xs text-slate-300 outline-none focus:border-blue-500 resize-none h-32"
                            placeholder="Add internal notes about this customer..."
                            value={selectedCustomer.notes || ''}
                            onChange={(e) => handleUpdateNotes(e.target.value)}
                        />
                    </div>
                </div>
              </>
          ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-xs">
                  Customer details
              </div>
          )}
      </div>
    </div>
  );
};

export default Inbox;
