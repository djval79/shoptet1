


import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, Message, Product, CartItem, Flow, Template, MessageLog, WebhookEventLog, SimulatorScenario, Appointment } from '../types';
import { generateAgentResponse } from '../services/geminiService';
import { Icons, MOCK_SCENARIOS } from '../constants';

interface ChatSimulatorProps {
    business: BusinessProfile;
    onOrderConfirmed: (items: CartItem[], total: number) => void;
    onLogEvent: (log: MessageLog) => void;
    onWebhookEvent?: (log: WebhookEventLog) => void;
    onHandover?: () => void; // New Prop
    onBookAppointment?: (appt: Appointment) => void; // New Prop
}

// Extend Window interface for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

// Helper to speak text with settings
const speakText = (text: string, settings?: { rate: number, pitch: number }, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to find a decent voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = settings?.rate || 1.1;
        utterance.pitch = settings?.pitch || 1.0;

        if (onEnd) {
            utterance.onend = onEnd;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        if (onEnd) onEnd();
    }
};

const ProductCard: React.FC<{ product: Product, currency: string, onOrder: (product: Product) => void }> = ({ product, currency, onOrder }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 max-w-[240px] mt-2">
        <div className="h-32 overflow-hidden bg-gray-100 relative">
            {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Icons.Store />
                </div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                {currency}{product.price}
            </div>
        </div>
        <div className="p-3">
            <h4 className="font-bold text-sm text-gray-800 mb-1">{product.name}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
            {product.variants && product.variants.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                    {product.variants.map((v, i) => (
                        <span key={i} className="text-[9px] bg-gray-100 border border-gray-300 px-1 rounded text-gray-500">{v.name}: {v.options.length} opts</span>
                    ))}
                </div>
            )}
            <button
                onClick={() => onOrder(product)}
                className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white text-xs py-2 rounded font-medium transition-colors uppercase tracking-wide"
            >
                {product.variants && product.variants.length > 0 ? 'Select Options' : 'Add to Cart'}
            </button>
        </div>
    </div>
);

const LinkPreview: React.FC<{ url: string }> = ({ url }) => {
    let domain = "";
    try {
        domain = new URL(url).hostname;
    } catch (e) {
        return null;
    }

    return (
        <div className="mt-2 bg-[#f0f2f5] rounded-lg overflow-hidden border border-black/5 max-w-[260px] group cursor-pointer hover:bg-[#e1e4e8] transition-colors">
            <div className="h-28 bg-slate-300 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-200">
                    <Icons.Image />
                </div>
                {/* Simulated Image Overlay */}
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] px-1 rounded">Preview</div>
            </div>
            <div className="p-2 bg-[#f7f7f7] border-t border-gray-200">
                <p className="font-bold text-xs text-slate-800 truncate">{domain.toUpperCase()} - Page Title</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight my-1">
                    This is a simulated WhatsApp rich link preview for {domain}. Real implementation would fetch Open Graph tags.
                </p>
                <p className="text-[9px] text-slate-400 lowercase">{domain}</p>
            </div>
        </div>
    );
};

const FlowButton: React.FC<{ flow: Flow, onOpen: () => void }> = ({ flow, onOpen }) => (
    <div className="mt-2 max-w-[240px]">
        <button
            onClick={onOpen}
            className="w-full bg-white hover:bg-gray-50 text-blue-600 border border-gray-200 rounded-lg px-4 py-3 font-medium text-sm shadow-sm flex items-center justify-center transition-all"
        >
            <span className="mr-2">📋</span> {flow.name}
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-1">Tap to open form</p>
    </div>
);

const AudioBubble: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex items-center space-x-3 min-w-[160px]">
        <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <Icons.Play />
        </button>
        <div className="flex-1">
            <div className="h-1 bg-gray-300 rounded-full w-full mb-1 relative">
                <div className="absolute left-0 top-0 bottom-0 bg-blue-500 w-1/3 rounded-full"></div>
            </div>
            <div className="flex justify-between text-[9px] text-gray-500">
                <span>0:04</span>
                <span>0:12</span>
            </div>
        </div>
    </div>
);

const FileBubble: React.FC<{ name: string, type: string }> = ({ name, type }) => (
    <div className="flex items-center space-x-3 bg-black/5 p-2 rounded-lg mt-1">
        <div className="text-red-500 bg-white p-2 rounded shadow-sm text-xl">
            {type === 'pdf' ? <Icons.FileText /> : <Icons.HardDrive />}
        </div>
        <div className="flex-1">
            <p className="text-xs font-bold truncate max-w-[150px]">{name}</p>
            <p className="text-[10px] text-gray-500 uppercase">{type} • 1.2 MB</p>
        </div>
        <button className="text-gray-400">
            <Icons.Download />
        </button>
    </div>
);

const TemplateMessage: React.FC<{ template: Template }> = ({ template }) => (
    <div className="w-full">
        {/* Header */}
        {template.header && (
            <div className="mb-2 rounded overflow-hidden">
                {template.header.type === 'IMAGE' && <div className="h-24 bg-slate-300 w-full flex items-center justify-center text-slate-500"><Icons.Image /></div>}
                {template.header.type === 'VIDEO' && <div className="h-24 bg-slate-300 w-full flex items-center justify-center text-slate-500"><Icons.Play /></div>}
                {template.header.type === 'DOCUMENT' && <div className="h-12 bg-slate-100 w-full flex items-center justify-center text-slate-500 border border-slate-200"><Icons.FileText /> DOC</div>}
                {template.header.type === 'TEXT' && <p className="font-bold text-sm mb-1">{template.header.content}</p>}
            </div>
        )}

        {/* Body */}
        <p className="whitespace-pre-line leading-relaxed">{template.body.replace(/{{1}}/g, 'Customer').replace(/{{2}}/g, 'Details')}</p>

        {/* Footer */}
        {template.footer && <p className="text-[10px] text-gray-400 mt-2">{template.footer}</p>}

        {/* Buttons */}
        {template.buttons && template.buttons.length > 0 && (
            <div className="mt-2 border-t border-gray-100 -mx-3 -mb-2">
                {template.buttons.map((btn, i) => (
                    <div key={i} className="py-2 text-center text-[#00a884] text-xs font-bold border-b border-gray-100 last:border-0 cursor-pointer hover:bg-black/5">
                        {btn.type === 'URL' && '🔗 '}
                        {btn.type === 'PHONE_NUMBER' && '📞 '}
                        {btn.text}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ business, onOrderConfirmed, onLogEvent, onWebhookEvent, onHandover, onBookAppointment }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [agentSpeaking, setAgentSpeaking] = useState(false);
    const [isSimulatingVoicemail, setIsSimulatingVoicemail] = useState(false);

    // Discount State
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

    // Flow State
    const [activeFlow, setActiveFlow] = useState<Flow | null>(null);
    const [flowData, setFlowData] = useState<Record<string, string>>({});

    // List Menu State
    const [activeList, setActiveList] = useState<{ title: string, sections: any[] } | null>(null);

    // Variant Selector State
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [currentVariantSelection, setCurrentVariantSelection] = useState<Record<string, string>>({});

    // Network Simulation State
    const [networkStatus, setNetworkStatus] = useState<'4g' | '3g' | 'offline'>('4g');
    const [pendingQueue, setPendingQueue] = useState<Message[]>([]);

    // Error Simulation
    const [failNextMessage, setFailNextMessage] = useState(false);

    // Session Window State
    const [timeOffset, setTimeOffset] = useState(0); // To simulate fast-forward

    // Opt-Out & Blocking State
    const [isOptedOut, setIsOptedOut] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Scenario State
    const [showScenarios, setShowScenarios] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const callTimerRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currency = business.currencySymbol || '$';
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = Math.max(0, subtotal - discount);

    // Webhook URLs from Config
    const webhookUrl = business.sandboxConfig?.incomingUrl || `https://api.twilioflow.ai/v1/webhooks/whatsapp/${business.id}/incoming`;
    const statusUrl = business.sandboxConfig?.statusCallbackUrl || `https://api.twilioflow.ai/v1/callbacks/status/${business.id}`;

    // Calculate Session Expiry & Opt-In
    const hasUserReplied = messages.some(m => m.role === 'user');
    const isPolicyGuardActive = !hasUserReplied && messages.length === 0;

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const simulatedNow = Date.now() + timeOffset;
    const hoursSinceLastUserMsg = lastUserMsg ? (simulatedNow - lastUserMsg.timestamp) / (1000 * 60 * 60) : 0;
    const isSessionExpired = lastUserMsg && hoursSinceLastUserMsg > 24;

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isSessionExpired, isPolicyGuardActive]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    if (isSimulatingVoicemail) {
                        handleSendVoicemail(transcript);
                    } else {
                        handleSend(transcript);
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error", event.error);
                setIsListening(false);
            };
        }
    }, [isSimulatingVoicemail]);

    // Persistence Logic: Load state on mount
    useEffect(() => {
        const saved = localStorage.getItem(`sim_state_${business.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMessages(parsed.messages || []);
                setCart(parsed.cart || []);
                setTimeOffset(parsed.timeOffset || 0);
            } catch (e) { console.error("Failed to load sim state", e); }
        }
    }, [business.id]);

    // Persistence Logic: Save state on change
    useEffect(() => {
        if (messages.length > 0 || cart.length > 0) {
            localStorage.setItem(`sim_state_${business.id}`, JSON.stringify({
                messages,
                cart,
                timeOffset
            }));
        }
    }, [messages, cart, timeOffset, business.id]);

    // Process Pending Queue when network returns
    useEffect(() => {
        if (networkStatus !== 'offline' && pendingQueue.length > 0) {
            const processQueue = async () => {
                for (const msg of pendingQueue) {
                    setPendingQueue(prev => prev.filter(p => p.id !== msg.id));
                    await handleSend(msg.text, msg.image, msg.location, msg.file, true);
                }
            };
            processQueue();
        }
    }, [networkStatus]);

    // Simulate Outbound Message Status Lifecycle (Queued -> Sent -> Delivered -> Read)
    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(prev => prev.map(m => {
                if (m.role === 'model' && !m.isSystem && m.status !== 'read' && m.status !== 'failed') {
                    let newStatus: Message['status'] = m.status;
                    if (!m.status || m.status === 'sending') newStatus = 'sent';
                    else if (m.status === 'sent') newStatus = 'delivered';
                    else if (m.status === 'delivered') newStatus = 'read';

                    if (newStatus !== m.status) {
                        // Emit update log event
                        onLogEvent({
                            id: m.id,
                            sid: `SM${m.id}`,
                            to: '+15550009999', // Mock user number
                            from: business.twilioNumber,
                            body: m.text || '[Rich Media]',
                            status: newStatus as any,
                            timestamp: Date.now(),
                            direction: 'outbound'
                        });

                        // Trigger Status Callback Webhook to Configured URL
                        if (onWebhookEvent) {
                            onWebhookEvent({
                                id: `wh_status_${m.id}_${newStatus}`,
                                timestamp: Date.now(),
                                type: 'status_callback',
                                url: statusUrl,
                                method: 'POST',
                                statusCode: 200,
                                payload: {
                                    SmsSid: `SM${m.id}`,
                                    SmsStatus: newStatus,
                                    MessageStatus: newStatus,
                                    To: '+15550009999',
                                    MessageSid: `SM${m.id}`,
                                    AccountSid: business.twilioAccountSid || 'AC_MOCK',
                                    From: business.twilioNumber,
                                    ApiVersion: '2010-04-01'
                                }
                            });
                        }

                        return { ...m, status: newStatus };
                    }
                }
                return m;
            }));
        }, 2000); // Update status every 2s
        return () => clearInterval(interval);
    }, [onLogEvent, business.twilioNumber, onWebhookEvent, business.id, business.twilioAccountSid, statusUrl]);

    // Handle Call Logic
    useEffect(() => {
        if (isCallActive) {
            callTimerRef.current = window.setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'model' && !isSimulatingVoicemail) {
                setAgentSpeaking(true);
                speakText(lastMsg.text, business.voiceSettings, () => {
                    setAgentSpeaking(false);
                    if (recognitionRef.current && !isSimulatingVoicemail) {
                        try { recognitionRef.current.start(); } catch (e) { }
                    }
                });
            }

        } else {
            if (callTimerRef.current) clearInterval(callTimerRef.current);
            setCallDuration(0);
            setIsSimulatingVoicemail(false);
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        }
        return () => {
            if (callTimerRef.current) clearInterval(callTimerRef.current);
            window.speechSynthesis.cancel();
        };
    }, [isCallActive, isSimulatingVoicemail]);

    const handleSendVoicemail = (transcript: string) => {
        handleSend("[Left a Voicemail]", undefined, undefined, undefined, false, { status: 'voicemail', duration: callDuration });
        setIsCallActive(false);
    };

    const handleAddToCart = (product: Product) => {
        if (product.variants && product.variants.length > 0) {
            setSelectedProductForVariant(product);
            setCurrentVariantSelection({});
            return;
        }
        addToCart(product);
    };

    const confirmVariantSelection = () => {
        if (!selectedProductForVariant) return;
        addToCart(selectedProductForVariant, currentVariantSelection);
        setSelectedProductForVariant(null);
        setCurrentVariantSelection({});
    };

    const addToCart = (product: Product, variants?: Record<string, string>) => {
        const existing = cart.find(item =>
            item.id === product.id &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
        );

        let newCart;
        if (existing) {
            newCart = cart.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
            newCart = [...cart, { ...product, quantity: 1, selectedVariants: variants }];
        }
        setCart(newCart);

        const variantText = variants ? ` (${Object.values(variants).join(', ')})` : '';
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            text: `🛒 Added 1x ${product.name}${variantText} to cart.`,
            timestamp: simulatedNow,
            isSystem: true
        }]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (file.type.startsWith('image/')) {
                handleSend('', base64);
            } else {
                // For PDFs, Audio, Video simulation
                const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'video';
                handleSend('', undefined, undefined, { name: file.name, type: fileType as any, url: base64 });
            }
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLocationShare = () => {
        const mockLat = 40.7128;
        const mockLng = -74.0060;
        const offset = (Math.random() - 0.5) * 0.15;
        handleSend('', undefined, { lat: mockLat + offset, lng: mockLng + offset });
    };

    const handleFlowSubmit = () => {
        if (!activeFlow) return;
        // Format data for message
        const flowResponseData = { ...flowData };
        setActiveFlow(null);
        setFlowData({});

        // Simulate capturing the flow response
        handleSend(`[Flow Response]: ${JSON.stringify(flowResponseData)}`);
    };

    const handleSendTemplate = (template: Template) => {
        // 1. Business sends Template
        const msgId = `tpl_${Date.now()}`;
        const tMsg: Message = {
            id: msgId,
            role: 'model',
            // Store full template object for rich rendering
            template: template,
            text: '', // Text is in template body
            timestamp: simulatedNow,
            status: 'sent'
        };
        setMessages(prev => [...prev, tMsg]);

        onLogEvent({
            id: msgId,
            sid: `SM${msgId}`,
            to: '+15550009999',
            from: business.twilioNumber,
            body: `[Template] ${template.name}`,
            status: 'sent',
            timestamp: Date.now(),
            direction: 'outbound'
        });

        // Trigger API Response Log (Simulating the 201 Created from Twilio)
        if (onWebhookEvent) {
            onWebhookEvent({
                id: `api_resp_${msgId}`,
                timestamp: Date.now(),
                type: 'api_response',
                url: 'https://api.twilio.com/2010-04-01/Accounts/.../Messages.json',
                method: 'POST',
                statusCode: 201,
                payload: {
                    "account_sid": business.twilioAccountSid || "AC_MOCK",
                    "api_version": "2010-04-01",
                    "body": `[Template] ${template.name}`,
                    "date_created": new Date().toUTCString(),
                    "direction": "outbound-api",
                    "error_code": null,
                    "from": business.twilioNumber,
                    "num_media": "0",
                    "num_segments": "1",
                    "sid": `SM${msgId}`,
                    "status": "queued",
                    "to": "+15550009999"
                }
            });
        }
    };

    const fastForward24h = () => {
        // Add 25 hours to ensure expiry
        setTimeOffset(prev => prev + (25 * 60 * 60 * 1000));
    };

    const resetChat = () => {
        setMessages([]);
        setCart([]);
        setTimeOffset(0);
        setIsOptedOut(false);
        setIsBlocked(false);
        localStorage.removeItem(`sim_state_${business.id}`);
        setShowUserMenu(false);
    };

    const loadScenario = (scenario: SimulatorScenario) => {
        setMessages(scenario.initialMessages);
        if (scenario.initialCart) setCart(scenario.initialCart);
        setTimeOffset(0); // Reset relative time
        setShowScenarios(false);
    };

    const handleAddReaction = () => {
        // Simulate user adding reaction to the last agent message
        const lastAgentMsg = [...messages].reverse().find(m => m.role === 'model');
        if (lastAgentMsg) {
            const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
            const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
            setMessages(prev => prev.map(m => m.id === lastAgentMsg.id ? { ...m, reaction: randomReact } : m));
        }
    };

    const extractUrl = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = text.match(urlRegex);
        return match ? match[0] : null;
    };

    const handleBlock = () => {
        setIsBlocked(true);
        setShowUserMenu(false);
        setMessages(prev => [...prev, {
            id: 'sys-block-' + Date.now(),
            role: 'system',
            text: '🚫 You blocked this business. You cannot receive messages from them.',
            timestamp: simulatedNow,
            isSystem: true
        }]);

        // Log error callback simulation
        onLogEvent({
            id: 'blk_' + Date.now(),
            sid: 'SM_BLOCK',
            to: business.twilioNumber,
            from: '+15550009999',
            body: '[USER BLOCKED BUSINESS]',
            status: 'failed',
            errorCode: 13006, // Geo-permissions or block
            timestamp: Date.now(),
            direction: 'inbound'
        });
    };

    const handleSend = async (textOverride?: string, imageOverride?: string, locationOverride?: { lat: number, lng: number }, fileOverride?: { name: string, url: string, type: 'pdf' | 'audio' | 'video' }, fromQueue = false, callInfo?: Message['call']) => {
        const textToSend = textOverride !== undefined ? textOverride : input;
        const hasContent = textToSend.trim() || imageOverride || locationOverride || fileOverride || callInfo;

        if (!hasContent) return;

        const msgId = Date.now().toString();
        const userMsg: Message = {
            id: msgId,
            role: 'user',
            text: textToSend,
            image: imageOverride,
            location: locationOverride,
            file: fileOverride,
            call: callInfo,
            timestamp: simulatedNow,
            status: networkStatus === 'offline' ? 'sending' : 'sent'
        };

        // Log User Message (Inbound)
        onLogEvent({
            id: msgId,
            sid: `SM${msgId}`,
            to: business.twilioNumber,
            from: '+15550009999',
            body: textToSend || (callInfo ? '[Voice Call]' : '[Media]'),
            status: 'delivered', // Inbound is usually instantly delivered
            timestamp: Date.now(),
            direction: 'inbound'
        });

        // Trigger Inbound Webhook to Configured URL
        if (onWebhookEvent) {
            onWebhookEvent({
                id: `wh_in_${msgId}`,
                timestamp: Date.now(),
                type: 'inbound_message',
                url: webhookUrl,
                method: 'POST',
                statusCode: 200,
                payload: {
                    SmsMessageSid: `SM${msgId}`,
                    NumMedia: imageOverride || fileOverride ? "1" : "0",
                    ProfileName: "Guest User",
                    SmsSid: `SM${msgId}`,
                    WaId: "15550009999",
                    SmsStatus: "received",
                    Body: textToSend,
                    To: business.twilioNumber,
                    NumSegments: "1",
                    MessageSid: `SM${msgId}`,
                    AccountSid: business.twilioAccountSid || 'AC_MOCK',
                    From: "whatsapp:+15550009999",
                    ApiVersion: "2010-04-01"
                }
            });
        }

        if (networkStatus === 'offline' && !fromQueue) {
            setPendingQueue(prev => [...prev, userMsg]);
            setMessages(prev => [...prev, userMsg]);
            setInput('');
            return;
        }

        if (!fromQueue) {
            setMessages(prev => [...prev, userMsg]);
            setInput('');
        }

        // --- OPT-OUT LOGIC ---
        const upperText = textToSend.toUpperCase().trim();
        if (upperText === 'STOP' || upperText === 'UNSUBSCRIBE' || upperText === 'CANCEL' || upperText === 'STOPPROMOTION') {
            setIsOptedOut(true);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: 'sys-optout-' + Date.now(),
                    role: 'system',
                    text: '✅ You have been unsubscribed. No further messages will be sent.',
                    timestamp: simulatedNow + 500,
                    isSystem: true
                }]);
            }, 500);
            return;
        }

        if (upperText === 'START' && isOptedOut) {
            setIsOptedOut(false);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: 'sys-optin-' + Date.now(),
                    role: 'system',
                    text: '✅ You have re-subscribed.',
                    timestamp: simulatedNow + 500,
                    isSystem: true
                }]);
                // Trigger re-engagement
                handleSend("Hi", undefined, undefined, undefined, true);
            }, 500);
            return;
        }

        if (isOptedOut || isBlocked) return;
        // ---------------------

        // Stop generation if it's a call log
        if (callInfo) return;

        setIsTyping(true);
        // Clear interactive states
        setActiveList(null);

        const latency = networkStatus === '3g' ? 2500 : 800;
        await new Promise(r => setTimeout(r, latency));

        try {
            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));

            const history = [...messages, userMsg];
            let response = await generateAgentResponse(history, business, cart);

            // --- Handle Function Calls ---
            if (response.functionCall) {
                const { name, args } = response.functionCall;
                let toolResult = "";
                let systemMsgText = "";

                if (name === 'checkInventory') {
                    const product = business.products.find(p => p.name.toLowerCase().includes(args.productName.toLowerCase()));
                    if (product) {
                        toolResult = `Inventory Check: ${product.name} is ${product.inStock ? 'In Stock' : 'Out of Stock'}. Price: ${currency}${product.price}.`;
                    } else {
                        toolResult = `Inventory Check: Product '${args.productName}' not found.`;
                    }
                } else if (name === 'addToCart') {
                    const product = business.products.find(p => p.name.toLowerCase().includes(args.productName.toLowerCase()));
                    if (product) {
                        // Execute Action
                        const qty = args.quantity || 1;
                        const existing = cart.find(item => item.id === product.id);
                        let newCart;
                        if (existing) {
                            newCart = cart.map(item => item === existing ? { ...item, quantity: item.quantity + qty } : item);
                        } else {
                            newCart = [...cart, { ...product, quantity: qty }];
                        }
                        setCart(newCart);

                        toolResult = `Action: Added ${qty}x ${product.name} to cart.`;
                        systemMsgText = `🛒 Added ${qty}x ${product.name} to cart.`;
                    } else {
                        toolResult = `Action Failed: Product '${args.productName}' not found.`;
                    }
                } else if (name === 'bookAppointment') {
                    if (onBookAppointment) {
                        const booking: Appointment = {
                            id: `appt_${Date.now()}`,
                            customerId: 'guest_123',
                            customerName: 'Guest User',
                            serviceName: args.type || 'Consultation',
                            startTime: new Date(args.date).getTime(),
                            duration: 60,
                            status: 'confirmed',
                            notes: 'Booked via AI'
                        };
                        onBookAppointment(booking);
                        toolResult = `Action: Appointment booked for ${args.date}.`;
                        systemMsgText = `📅 Appointment Confirmed: ${args.date}`;
                    } else {
                        toolResult = "Action Failed: Booking system unavailable.";
                    }
                }

                // Show System Message for the action
                if (systemMsgText) {
                    setMessages(prev => [...prev, {
                        id: 'sys-tool-' + Date.now(),
                        role: 'system',
                        text: systemMsgText,
                        timestamp: Date.now(),
                        isSystem: true
                    }]);
                }

                // Feed result back to AI for final response
                // We simulate a "Tool Output" message from the system/user perspective so the AI knows what happened
                history.push({
                    id: 'tool-' + Date.now(),
                    role: 'model', // We treat the tool output as context for the model
                    text: `[System Tool Output]: ${toolResult}`,
                    timestamp: Date.now()
                });

                // Generate final response based on tool result
                response = await generateAgentResponse(history, business, cart);
            }

            let finalResponseText = response.text;

            if (response.optOut) {
                setIsOptedOut(true);
            }

            if (response.text.includes('Applying coupon code...')) {
                const potentialCodes = business.promotions?.filter(p => textToSend.toUpperCase().includes(p.code));
                if (potentialCodes && potentialCodes.length > 0) {
                    const coupon = potentialCodes[0];
                    if (subtotal >= (coupon.minSpend || 0)) {
                        const discountAmount = coupon.type === 'fixed' ? coupon.value : (subtotal * (coupon.value / 100));
                        setDiscount(discountAmount);
                        setAppliedCoupon(coupon.code);

                        setMessages(prev => [...prev, {
                            id: 'sys-cpn-' + Date.now(),
                            role: 'system',
                            text: `🎟️ Coupon ${coupon.code} applied! Saved ${currency}${discountAmount.toFixed(2)}`,
                            timestamp: simulatedNow,
                            isSystem: true
                        }]);
                    } else {
                        setMessages(prev => [...prev, {
                            id: 'sys-cpn-err-' + Date.now(),
                            role: 'system',
                            text: `⚠️ Coupon ${coupon.code} requires min spend of ${currency}${coupon.minSpend}.`,
                            timestamp: simulatedNow,
                            isSystem: true
                        }]);
                    }
                }
            }

            // Handle Book Appointment Tool
            if (response.booking && onBookAppointment) {
                const booking = {
                    id: `appt_${Date.now()}`,
                    customerId: 'guest_123',
                    customerName: 'Guest User', // In real app, use verified name
                    serviceName: response.booking.service,
                    startTime: new Date(`${response.booking.date}T${response.booking.time}`).getTime(),
                    duration: 60, // Default duration
                    status: 'confirmed' as const,
                    notes: 'Booked via AI Chat'
                };
                onBookAppointment(booking);

                setMessages(prev => [...prev, {
                    id: 'sys-bk-' + Date.now(),
                    role: 'system',
                    text: `📅 Appointment Confirmed: ${booking.serviceName} on ${response.booking?.date} at ${response.booking?.time}`,
                    timestamp: simulatedNow,
                    isSystem: true
                }]);
            }

            if (userMsg.location && business.deliveryRadius > 0) {
                const bizLat = 40.7128;
                const bizLng = -74.0060;
                const dist = Math.sqrt(Math.pow(userMsg.location.lat - bizLat, 2) + Math.pow(userMsg.location.lng - bizLng, 2)) * 111;

                if (dist <= business.deliveryRadius) {
                    finalResponseText = "Good news! You are within our delivery zone (" + dist.toFixed(1) + "km away). We can deliver to you.";
                } else {
                    finalResponseText = "I'm sorry, it looks like you are " + dist.toFixed(1) + "km away, which is outside our " + business.deliveryRadius + "km delivery radius. We can't deliver there right now.";
                }
            }

            if (finalResponseText.includes('[ORDER_CONFIRMED]')) {
                const currentSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const currentTotal = Math.max(0, currentSubtotal - discount);

                if (currentTotal > 0) {
                    if (business.integrations?.stripe) {
                        const payMsgId = 'stripe-' + Date.now();
                        setMessages(prev => [...prev, {
                            id: payMsgId,
                            role: 'model',
                            text: `Please complete your payment securely: https://checkout.stripe.com/pay/${Date.now()}`,
                            timestamp: simulatedNow,
                            status: 'sent'
                        }]);

                        onLogEvent({
                            id: payMsgId,
                            sid: `SM${payMsgId}`,
                            to: '+15550009999',
                            from: business.twilioNumber,
                            body: 'Stripe Payment Link',
                            status: 'sent',
                            timestamp: Date.now(),
                            direction: 'outbound'
                        });

                        await new Promise(r => setTimeout(r, 1500));
                    }

                    onOrderConfirmed([...cart], currentTotal);
                    setCart([]);
                    setDiscount(0);
                    setAppliedCoupon(null);

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: 'sys-' + Date.now(),
                            role: 'system',
                            text: `✅ Order Placed successfully! Total: ${currency}${currentTotal.toFixed(2)}`,
                            timestamp: simulatedNow,
                            isSystem: true
                        }]);
                    }, 500);
                }
            }

            // --- HANDOVER LOGIC ---
            if (finalResponseText.includes('[CALL_HANDOVER]')) {
                if (onHandover) {
                    onHandover();

                    setMessages(prev => [...prev, {
                        id: 'sys-ho-' + Date.now(),
                        role: 'system',
                        text: '👤 Connecting to a human agent...',
                        timestamp: simulatedNow,
                        isSystem: true
                    }]);
                }
            }

            const cleanText = finalResponseText
                .replace('[ORDER_CONFIRMED]', '')
                .replace('[CALL_HANDOVER]', '')
                .replace('Applying coupon code...', '')
                .replace('(System): Location Checked.', '')
                .replace(/Sending (pdf|audio|video)\.\.\./, '')
                .trim();

            if (cleanText || response.buttons || response.list || response.file) {
                const shouldUseSms = business.smsFallbackEnabled && (networkStatus === '3g' && Math.random() > 0.7);
                const newMsgId = (Date.now() + 1).toString();

                // Error Injection
                const shouldFail = failNextMessage;
                if (shouldFail) setFailNextMessage(false);

                const agentMsg: Message = {
                    id: newMsgId,
                    role: 'model',
                    text: cleanText,
                    product: response.product,
                    flowId: response.flowId,
                    buttons: response.buttons,
                    list: response.list,
                    file: response.file,
                    timestamp: simulatedNow,
                    deliveryType: shouldUseSms ? 'sms' : 'whatsapp',
                    status: shouldFail ? 'failed' : 'sending',
                    errorCode: shouldFail ? 30008 : undefined
                };

                setMessages(prev => [...prev, agentMsg]);

                // Log the Outbound Message (Simulated)
                onLogEvent({
                    id: newMsgId,
                    sid: `SM${newMsgId}`,
                    to: '+15550009999', // Mock user number
                    from: business.twilioNumber,
                    body: cleanText || '[Interactive Content]',
                    status: shouldFail ? 'failed' : 'queued',
                    errorCode: shouldFail ? 30008 : undefined,
                    timestamp: Date.now(),
                    direction: 'outbound'
                });

                // Trigger API Response Log to Configured URL
                if (onWebhookEvent) {
                    onWebhookEvent({
                        id: `api_resp_${newMsgId}`,
                        timestamp: Date.now(),
                        type: 'api_response',
                        url: 'https://api.twilio.com/2010-04-01/Accounts/.../Messages.json',
                        method: 'POST',
                        statusCode: shouldFail ? 500 : 201,
                        payload: {
                            "account_sid": business.twilioAccountSid || "AC_MOCK",
                            "api_version": "2010-04-01",
                            "body": cleanText,
                            "date_created": new Date().toUTCString(),
                            "direction": "outbound-api",
                            "error_code": shouldFail ? 30008 : null,
                            "from": business.twilioNumber,
                            "num_media": "0",
                            "num_segments": "1",
                            "sid": `SM${newMsgId}`,
                            "status": shouldFail ? "failed" : "queued",
                            "to": "+15550009999"
                        }
                    });
                }

                if (isCallActive && !isSimulatingVoicemail) {
                    setAgentSpeaking(true);
                    speakText(cleanText, business.voiceSettings, () => {
                        setAgentSpeaking(false);
                        if (recognitionRef.current) {
                            try { recognitionRef.current.start(); } catch (e) { }
                        }
                    });
                }
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    };

    // ... (rest of the component same as before)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    return (
        <div className="flex flex-col h-[650px] w-full max-w-md bg-[#efeae2] rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative mx-auto">

            {/* Call Overlay */}
            {isCallActive && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-2xl mb-6 transition-all duration-300 ${agentSpeaking ? 'border-green-400 scale-110 shadow-green-500/50' : isListening ? 'border-blue-400' : 'border-slate-700'}`}>
                        <img src={`https://picsum.photos/seed/${business.id}/200`} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">{business.name}</h2>
                    <p className="text-slate-400 mb-4 text-lg">{isSimulatingVoicemail ? 'Recording Voicemail...' : formatTime(callDuration)}</p>

                    <div className="h-8 mb-8 flex items-center justify-center">
                        {agentSpeaking && (
                            <div className="flex space-x-1">
                                <div className="w-1 h-4 bg-green-500 animate-bounce"></div>
                                <div className="w-1 h-6 bg-green-500 animate-bounce delay-75"></div>
                                <div className="w-1 h-3 bg-green-500 animate-bounce delay-150"></div>
                            </div>
                        )}
                        {isListening && (
                            <div className="flex items-center space-x-2">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                <span className="text-sm text-blue-400 font-medium">Listening...</span>
                            </div>
                        )}
                        {!agentSpeaking && !isListening && !isTyping && (
                            <span className="text-xs text-slate-600">Tap mic to speak</span>
                        )}
                    </div>

                    <div className="flex space-x-6 items-center">
                        {!isSimulatingVoicemail && (
                            <button
                                onClick={toggleMic}
                                className={`p-4 rounded-full transition-colors ${isListening ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <Icons.Phone />
                            </button>
                        )}

                        {!isSimulatingVoicemail && (
                            <button
                                onClick={() => setIsSimulatingVoicemail(true)}
                                className="p-4 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg"
                                title="Leave Voicemail"
                            >
                                <Icons.Voicemail />
                            </button>
                        )}

                        <button
                            onClick={() => setIsCallActive(false)}
                            className="p-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 scale-110"
                        >
                            <Icons.X />
                        </button>
                    </div>
                    {isSimulatingVoicemail && <p className="text-xs text-yellow-400 mt-4">Speak now to record message</p>}
                </div>
            )}

            {/* List Menu Bottom Sheet */}
            {activeList && (
                <div className="absolute inset-0 z-40 bg-black/50 flex items-end animate-in fade-in duration-200">
                    <div className="w-full bg-white rounded-t-2xl max-h-[70%] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b bg-slate-50 rounded-t-2xl flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">{activeList.title}</h3>
                            <button onClick={() => setActiveList(null)} className="text-slate-500 hover:text-red-500"><Icons.X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {activeList.sections.map((section: any, i: number) => (
                                <div key={i} className="mb-2">
                                    <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase">{section.title}</h4>
                                    {section.rows.map((row: any) => (
                                        <button
                                            key={row.id}
                                            onClick={() => handleSend(row.title)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-100 active:bg-slate-200 flex flex-col"
                                        >
                                            <span className="font-medium text-sm text-slate-800">{row.title}</span>
                                            {row.description && <span className="text-xs text-slate-500">{row.description}</span>}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Selection Bottom Sheet */}
            {selectedProductForVariant && (
                <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-in fade-in duration-200">
                    <div className="w-full bg-white rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="font-bold text-lg text-slate-800">Select Options</h3>
                            <button onClick={() => setSelectedProductForVariant(null)} className="text-slate-500 text-xl">×</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <img src={selectedProductForVariant.image} className="w-16 h-16 rounded object-cover" alt="" />
                                <div>
                                    <h4 className="font-bold text-slate-800">{selectedProductForVariant.name}</h4>
                                    <p className="text-green-600 font-bold">{currency}{selectedProductForVariant.price}</p>
                                </div>
                            </div>

                            {selectedProductForVariant.variants?.map(variant => (
                                <div key={variant.name}>
                                    <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">{variant.name}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.options.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setCurrentVariantSelection({ ...currentVariantSelection, [variant.name]: opt })}
                                                className={`px-4 py-2 rounded border text-sm transition-colors ${currentVariantSelection[variant.name] === opt
                                                        ? 'bg-slate-800 text-white border-slate-800'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t bg-slate-50">
                            <button
                                onClick={confirmVariantSelection}
                                disabled={selectedProductForVariant.variants?.some(v => !currentVariantSelection[v.name])}
                                className="w-full bg-[#00a884] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[#008f6f] disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-[#075e54] text-white p-3 flex items-center justify-between z-10 shadow-md relative">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg overflow-hidden border border-white/20">
                        <img src={`https://picsum.photos/seed/${business.id}/200`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col cursor-pointer hover:opacity-80">
                        <span className="font-semibold text-sm leading-tight">{business.name}</span>
                        <span className="text-xs text-gray-200 opacity-90">
                            {isTyping ? 'typing...' : 'Business Account'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Scenarios Button */}
                    <button
                        onClick={() => setShowScenarios(!showScenarios)}
                        className="bg-white/20 text-white text-[10px] px-2 py-1 rounded hover:bg-white/30 font-bold"
                    >
                        SCENARIOS
                    </button>

                    <div className="flex items-center bg-black/20 rounded-lg p-1">
                        <button
                            onClick={() => setNetworkStatus('4g')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${networkStatus === '4g' ? 'bg-white text-green-600' : 'text-gray-300 hover:text-white'}`}
                        >
                            4G
                        </button>
                        <button
                            onClick={() => setNetworkStatus('offline')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${networkStatus === 'offline' ? 'bg-white text-red-600' : 'text-gray-300 hover:text-white'}`}
                        >
                            OFF
                        </button>
                    </div>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-1 rounded hover:bg-white/10 text-white">
                        <div className="flex flex-col space-y-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    </button>
                </div>

                {/* Scenario Menu */}
                {showScenarios && (
                    <div className="absolute top-12 right-20 bg-white rounded-lg shadow-xl py-2 z-50 w-64 animate-in zoom-in-95 text-gray-800 border border-gray-200">
                        <div className="px-3 py-1 border-b border-gray-100 text-[10px] text-gray-500 font-bold uppercase mb-1">Load Demo Scenario</div>
                        {MOCK_SCENARIOS.map(sc => (
                            <button
                                key={sc.id}
                                onClick={() => loadScenario(sc)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                                <p className="text-xs font-bold text-slate-800">{sc.name}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1">{sc.description}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* User Menu */}
                {showUserMenu && (
                    <div className="absolute top-12 right-2 bg-white rounded-lg shadow-xl py-1 z-50 w-40 animate-in zoom-in-95 text-gray-800">
                        <button onClick={() => { handleAddReaction(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 font-medium flex items-center">
                            <span className="mr-2">👍</span> React to Agent
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button onClick={() => setFailNextMessage(!failNextMessage)} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 flex justify-between items-center">
                            <span>Fail Next</span>
                            {failNextMessage && <span className="text-red-500">✓</span>}
                        </button>
                        <button onClick={fastForward24h} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100">Fast Forward 24h</button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button onClick={resetChat} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 text-red-600 font-bold">Reset Chat</button>
                        <button onClick={handleBlock} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 text-red-600 font-bold">Block Business</button>
                    </div>
                )}
            </div>

            {/* Cart Summary (Float) */}
            {cart.length > 0 && (
                <div className="absolute top-16 right-4 z-20 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-green-100 p-3 w-56 animate-in slide-in-from-right-4">
                    <h5 className="text-xs font-bold text-green-800 border-b border-green-200 pb-1 mb-2">Shopping Cart</h5>
                    <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                        {cart.map((c, i) => (
                            <div key={i} className="text-[10px] text-slate-600">
                                <div className="flex justify-between font-medium">
                                    <span>{c.quantity}x {c.name}</span>
                                    <span>{currency}{(c.price * c.quantity).toFixed(0)}</span>
                                </div>
                                {c.selectedVariants && (
                                    <div className="text-[9px] text-slate-400 ml-2 mt-0.5">
                                        {Object.entries(c.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-green-200 pt-1 space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Subtotal</span>
                            <span>{currency}{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-xs text-green-600 font-medium">
                                <span>Discount ({appliedCoupon})</span>
                                <span>-{currency}{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-green-800">
                            <span>Total</span>
                            <span>{currency}{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain relative">
                {/* ... (existing chat render logic) ... */}
                <div className="text-center text-xs text-gray-500 my-2 bg-[#fff5c4] p-2 rounded-lg shadow-sm text-[10px] max-w-[90%] mx-auto">
                    🔒 Messages are end-to-end encrypted. This business uses a secure service from Meta to manage this chat.
                </div>

                {messages.length === 0 && business.iceBreakers && business.iceBreakers.length > 0 && (
                    <div className="flex flex-col items-center justify-center mt-12 space-y-3 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-xs text-slate-500 font-medium mb-2 bg-white/80 px-3 py-1 rounded-full">Get started...</p>
                        {business.iceBreakers.map((ib, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(ib)}
                                className="bg-white text-[#075e54] font-bold text-sm px-6 py-3 rounded-full shadow-md hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95 w-[80%]"
                            >
                                {ib}
                            </button>
                        ))}
                    </div>
                )}

                {isPolicyGuardActive && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg shadow-md mb-4 animate-in fade-in slide-in-from-top">
                        <div className="flex items-start space-x-3">
                            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 text-xl"><Icons.Shield /></div>
                            <div>
                                <h4 className="text-yellow-800 font-bold text-xs uppercase tracking-wide mb-1">Policy Guard Active</h4>
                                <p className="text-yellow-700 text-[10px] leading-tight">
                                    Business cannot initiate free-form messages. User must opt-in by sending the first message, or Business must send a Template.
                                </p>
                                <div className="mt-2 flex space-x-2">
                                    <button onClick={() => handleSend("Hi")} className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded border border-yellow-300 transition-colors">
                                        Simulate User Opt-In ("Hi")
                                    </button>
                                    <button onClick={() => handleSendTemplate(business.templates?.[0] || { id: 't', name: 'hello', category: 'MARKETING', body: 'Hello {{1}}', status: 'approved', createdAt: 0, language: 'en_US' })} className="bg-white hover:bg-gray-50 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded border border-yellow-200 transition-colors">
                                        Send Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {networkStatus === 'offline' && (
                    <div className="sticky top-0 left-0 right-0 bg-red-500/90 text-white text-center text-xs py-1 z-20 backdrop-blur-sm">
                        No Internet Connection. Messages queued.
                    </div>
                )}

                {isOptedOut && (
                    <div className="sticky top-0 left-0 right-0 bg-red-600 text-white text-center text-xs py-2 z-20 shadow-md flex justify-center items-center">
                        <span className="mr-2">⛔</span> You have opted out of messages. Type "START" to rejoin.
                    </div>
                )}

                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    const isSystem = msg.isSystem;
                    const isSms = msg.deliveryType === 'sms';
                    const isFailed = msg.status === 'failed';
                    const flow = msg.flowId ? business.flows?.find(f => f.id === msg.flowId) : undefined;
                    const linkUrl = extractUrl(msg.text);
                    const isCall = !!msg.call;

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="bg-gray-200/80 text-gray-600 text-[10px] px-2 py-1 rounded-full shadow-sm backdrop-blur-sm border border-white/40">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    if (isCall) {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <div className="bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow flex items-center gap-3 border border-slate-600">
                                    <div className={`p-2 rounded-full ${msg.call?.status === 'missed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {msg.call?.status === 'missed' ? <Icons.PhoneMissed /> : <Icons.Phone />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold capitalize">{msg.call?.status.replace('_', ' ')} Call</p>
                                        <p className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300 relative`}>
                            <div className={`max-w-[80%] rounded-lg p-2 px-3 text-sm shadow-sm relative group ${isSms ? 'bg-blue-500 text-white' :
                                    isFailed ? 'bg-red-100 text-red-900 border border-red-300' :
                                        isUser ? 'bg-[#d9fdd3] text-black rounded-tr-none' : 'bg-white text-black rounded-tl-none'
                                }`}>
                                {isSms && <div className="text-[10px] font-bold text-blue-100 mb-1">SMS Fallback</div>}
                                {isFailed && <div className="text-[10px] font-bold text-red-500 mb-1 flex items-center"><span className="mr-1">⚠</span> Not Delivered (Error {msg.errorCode})</div>}

                                {msg.image && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                                        <img src={msg.image} alt="Attachment" className="w-full max-h-48 object-cover" />
                                    </div>
                                )}

                                {msg.file && (
                                    msg.file.type === 'audio' ? (
                                        <AudioBubble text={msg.text} />
                                    ) : (
                                        <FileBubble name={msg.file.name} type={msg.file.type} />
                                    )
                                )}

                                {msg.location && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/5 bg-gray-100">
                                        <div className="h-24 w-48 relative bg-slate-200">
                                            <div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
                                                <div className="text-red-500 drop-shadow-md"><Icons.MapPin /></div>
                                            </div>
                                        </div>
                                        <div className="p-2 text-xs text-gray-600 bg-white">
                                            <p className="font-bold">Live Location</p>
                                        </div>
                                    </div>
                                )}

                                {msg.template && (
                                    <TemplateMessage template={msg.template} />
                                )}

                                {msg.text && !msg.template && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}

                                {linkUrl && !isSystem && (
                                    <LinkPreview url={linkUrl} />
                                )}

                                {flow && (
                                    <FlowButton flow={flow} onOpen={() => setActiveFlow(flow)} />
                                )}

                                {msg.list && (
                                    <div className="mt-2 border-t border-slate-100 pt-2">
                                        <button
                                            onClick={() => setActiveList({ title: msg.list!.title, sections: msg.list!.sections })}
                                            className="w-full text-blue-500 text-xs font-bold flex items-center justify-center py-1 hover:bg-blue-50 rounded"
                                        >
                                            <span className="mr-1"><Icons.List /></span> {msg.list.buttonText}
                                        </button>
                                    </div>
                                )}

                                {/* Reaction Badge */}
                                {msg.reaction && (
                                    <div className={`absolute -bottom-2 ${isUser ? '-left-2' : '-right-2'} bg-white rounded-full shadow-md p-1 text-[10px] border border-gray-200 animate-in zoom-in`}>
                                        {msg.reaction}
                                    </div>
                                )}

                                <div className="flex items-center justify-end space-x-1 mt-1">
                                    <span className={`text-[10px] ${isSms ? 'text-blue-100' : isFailed ? 'text-red-400' : 'text-gray-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`${msg.status === 'read' ? 'text-blue-500' : isFailed ? 'text-red-500' : 'text-gray-400'}`}>
                                        {msg.status === 'sending' || !msg.status ? '🕒' :
                                            msg.status === 'failed' ? '!' :
                                                msg.status === 'sent' ? '✓' :
                                                    msg.status === 'delivered' ? '✓✓' : '✓✓'}
                                    </span>
                                </div>
                            </div>

                            {msg.buttons && !isUser && (
                                <div className="flex gap-2 mt-2 flex-wrap max-w-[80%]">
                                    {msg.buttons.map((btn) => (
                                        <button
                                            key={btn.id}
                                            onClick={() => handleSend(btn.title)}
                                            className="bg-white text-blue-500 border border-gray-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors"
                                        >
                                            {btn.title}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.product && !isUser && !isSms && (
                                <ProductCard
                                    product={msg.product}
                                    currency={currency}
                                    onOrder={handleAddToCart}
                                />
                            )}
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white rounded-lg p-3 rounded-tl-none shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Flow Modal Overlay */}
            {activeFlow && (
                <div className="absolute inset-0 z-50 bg-black/60 flex items-end animate-in fade-in duration-200">
                    <div className="w-full bg-white rounded-t-2xl h-[80%] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="font-bold text-lg text-slate-800">{activeFlow.name}</h3>
                            <button onClick={() => setActiveFlow(null)} className="text-slate-500 text-xl">×</button>
                        </div>
                        {/* ... (Existing Flow Form UI) ... */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeFlow.screens[0].components.map(comp => (
                                <div key={comp.id}>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">
                                        {comp.label} {comp.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {comp.type === 'Text' && (
                                        <input
                                            className="w-full border rounded p-3 outline-none focus:border-green-500 transition-colors"
                                            onChange={(e) => setFlowData({ ...flowData, [comp.label]: e.target.value })}
                                        />
                                    )}
                                    {comp.type === 'TextArea' && (
                                        <textarea
                                            className="w-full border rounded p-3 outline-none focus:border-green-500 transition-colors"
                                            onChange={(e) => setFlowData({ ...flowData, [comp.label]: e.target.value })}
                                        />
                                    )}
                                    {(comp.type === 'Dropdown' || comp.type === 'Radio') && (
                                        <select
                                            className="w-full border rounded p-3 outline-none focus:border-green-500 transition-colors"
                                            onChange={(e) => setFlowData({ ...flowData, [comp.label]: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {comp.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t bg-slate-50">
                            <button
                                onClick={handleFlowSubmit}
                                className="w-full bg-[#00a884] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[#008f6f]"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            {isBlocked ? (
                // ... Blocked UI
                <div className="bg-red-100 p-4 z-20 border-t border-red-200 shadow-inner flex flex-col items-center">
                    <span className="text-2xl mb-2">🚫</span>
                    <p className="text-red-800 text-xs font-bold text-center uppercase tracking-wide">
                        You blocked this business
                    </p>
                    <button onClick={() => setIsBlocked(false)} className="bg-white text-red-600 px-4 py-2 rounded border border-red-200 text-xs font-bold shadow-sm mt-2">Unblock</button>
                </div>
            ) : isOptedOut ? (
                // ... Opt Out UI
                <div className="bg-red-50 p-4 z-20 border-t border-red-200 shadow-inner">
                    <p className="text-red-600 text-xs text-center">You have opted out of messaging.</p>
                    <button onClick={() => handleSend("START")} className="w-full mt-2 bg-white text-red-600 border border-red-200 rounded py-2 text-xs font-bold shadow-sm hover:bg-red-50">Re-Subscribe (START)</button>
                </div>
            ) : isSessionExpired ? (
                // ... Expired UI
                <div className="bg-yellow-50 p-4 z-20 border-t border-yellow-200 shadow-inner">
                    <div className="flex items-center text-xs text-yellow-800 mb-3 font-bold uppercase tracking-wide">
                        <span className="mr-2 text-lg">🕒</span> 24-hour window closed.
                    </div>
                    {/* ... (existing re-engagement UI) ... */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {(business.templates || []).filter(t => t.status === 'approved').map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleSendTemplate(t)}
                                className="bg-white border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg text-xs font-medium shadow-sm hover:bg-yellow-100 whitespace-nowrap flex items-center"
                            >
                                <span className="mr-2">📄</span> {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // ... Standard Input Area
                <div className="bg-[#f0f2f5] p-2 px-3 flex items-center space-x-2 z-20">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf,audio/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 p-2 hover:bg-gray-200 rounded-full transition-colors"><Icons.Plus /></button>
                    <button onClick={handleLocationShare} className="text-gray-500 p-2 hover:bg-gray-200 rounded-full transition-colors"><Icons.MapPin /></button>

                    <div className="flex-1 bg-white rounded-lg px-4 py-2 flex items-center border border-white focus-within:border-gray-300 transition-colors">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message"
                            className="flex-1 outline-none text-sm text-black bg-transparent"
                        />
                    </div>
                    {input.trim() ? (
                        <button onClick={() => handleSend()} className="p-2 rounded-full bg-[#00a884] text-white hover:scale-105 transition-transform shadow-sm"><Icons.Send /></button>
                    ) : (
                        <button onClick={() => handleSend("[Voice Note]", undefined, undefined, { name: 'Voice.mp3', type: 'audio', url: '' }, false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"><span className="text-lg">🎤</span></button>
                    )}
                    <button onClick={() => setIsCallActive(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors" title="Call Agent"><Icons.Phone /></button>
                </div>
            )}
        </div>
    );
};

export default ChatSimulator;
