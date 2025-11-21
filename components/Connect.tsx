
import React, { useState } from 'react';
import { BusinessProfile, SandboxParticipant, WhatsAppSender, WidgetSettings } from '../types';
import { Icons, MOCK_SANDBOX_PARTICIPANTS, MOCK_SENDERS } from '../constants';
import { generateWidgetGreeting } from '../services/geminiService';

interface ConnectProps {
    business: BusinessProfile;
    onUpdate?: (updated: BusinessProfile) => void;
}

const Connect: React.FC<ConnectProps> = ({ business, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'widget' | 'links' | 'sandbox' | 'production' | 'senders'>('widget');
    const [copied, setCopied] = useState(false);
    const [sandboxParticipants, setSandboxParticipants] = useState<SandboxParticipant[]>(MOCK_SANDBOX_PARTICIPANTS);
    const [snippetType, setSnippetType] = useState<'text' | 'media'>('text');

    // Widget State
    const defaultWidget: WidgetSettings = {
        enabled: true,
        color: '#25D366',
        position: 'right',
        ctaText: 'Chat on WhatsApp',
        greeting: 'Hi! 👋 How can we help you today?',
        icon: 'whatsapp',
        delay: 2
    };
    const [widget, setWidget] = useState<WidgetSettings>(business.widgetSettings || defaultWidget);
    const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);

    // Link Builder State
    const [linkType, setLinkType] = useState<'custom' | 'product' | 'coupon'>('custom');
    const [linkMessage, setLinkMessage] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [qrColor, setQrColor] = useState('#000000');

    // Senders State
    const [senders, setSenders] = useState<WhatsAppSender[]>(business.senders || MOCK_SENDERS);
    const [isVerifyingMeta, setIsVerifyingMeta] = useState(false);

    // Sandbox Config State (Linked to Business Profile)
    const [incomingUrl, setIncomingUrl] = useState(business.sandboxConfig?.incomingUrl || `https://api.chat2close.ai/v1/webhooks/whatsapp/${business.id}/incoming`);
    const [statusCallbackUrl, setStatusCallbackUrl] = useState(business.sandboxConfig?.statusCallbackUrl || `https://api.chat2close.ai/v1/callbacks/status/${business.id}`);
    const [fallbackUrl, setFallbackUrl] = useState(business.sandboxConfig?.fallbackUrl || `https://api.chat2close.ai/v1/callbacks/fallback/${business.id}`);
    const [isSaved, setIsSaved] = useState(false);

    // Sanitize phone number (remove non-numeric characters)
    const phone = business.twilioNumber.replace(/\D/g, '') || '14155238886';
    const whatsappLink = `https://wa.me/${phone}`;

    // Dynamic Join Code
    const joinWord = 'were';
    const joinCode = `join ${joinWord}-rhythm`;

    // Sandbox Specific QR
    const sandboxJoinLink = `https://wa.me/14155238886?text=${encodeURIComponent(joinCode)}`;
    const sandboxQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sandboxJoinLink)}&bgcolor=ffffff&color=000000`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWidgetUpdate = (field: keyof WidgetSettings, value: any) => {
        const updated = { ...widget, [field]: value };
        setWidget(updated);
        if (onUpdate) {
            onUpdate({ ...business, widgetSettings: updated });
        }
    };

    const handleSandboxSave = () => {
        if (onUpdate) {
            onUpdate({
                ...business,
                sandboxConfig: {
                    incomingUrl,
                    statusCallbackUrl,
                    fallbackUrl
                }
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const handleGenerateGreeting = async () => {
        setIsGeneratingGreeting(true);
        try {
            const greeting = await generateWidgetGreeting(business);
            handleWidgetUpdate('greeting', greeting);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingGreeting(false);
        }
    };

    const handleMetaVerify = () => {
        setIsVerifyingMeta(true);
        setTimeout(() => {
            setIsVerifyingMeta(false);
            alert("Meta Business Manager Connected Successfully! Limit increased.");
        }, 2000);
    };

    const getGeneratedLink = () => {
        let text = '';
        if (linkType === 'custom') {
            text = linkMessage;
        } else if (linkType === 'product') {
            const p = business.products.find(prod => prod.id === selectedProductId);
            text = p ? `Hi, I'm interested in the ${p.name}. Is it available?` : 'Hi';
        } else if (linkType === 'coupon') {
            text = `Hi, I'd like to redeem coupon ${selectedCouponCode}.`;
        }

        // Fallback
        if (!text) text = "Hi!";

        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    const generatedLink = getGeneratedLink();
    const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedLink)}&bgcolor=ffffff&color=${qrColor.replace('#', '')}&margin=10`;

    const widgetCodeSnippet = `
<script>
  window.chat2closeConfig = {
    phone: "${phone}",
    message: "Hi! I'm interested in your services.",
    color: "${widget.color}",
    position: "${widget.position}", // 'left' or 'right'
    ctaText: "${widget.ctaText}",
    greeting: "${widget.greeting}",
    delay: ${widget.delay}
  };
</script>
<script src="https://cdn.chat2close.ai/widget/v1/bundle.js" async></script>
  `.trim();

    const textSnippet = `
// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); 
const accountSid = "${business.twilioAccountSid || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}";
const authToken = "${business.twilioAuthToken || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}";
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "Hello, there!",
    from: "whatsapp:+14155238886",
    to: "whatsapp:+15005550006",
  });

  console.log(message.sid);
}

createMessage();`.trim();

    const mediaSnippet = `
// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); 
const accountSid = "${business.twilioAccountSid || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}";
const authToken = "${business.twilioAuthToken || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}";
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "Here's that picture of an owl you requested.",
    from: "whatsapp:+14155238886",
    mediaUrl: ["https://demo.twilio.com/owl.png"],
    to: "whatsapp:+15017122661"
  });

  console.log(message.body);
}

createMessage();`.trim();

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Connect & Grow</h2>
                    <p className="text-slate-400">Setup your WhatsApp channel and drive traffic.</p>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => setActiveTab('widget')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'widget' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2"><Icons.Globe /></span> Web Widget
                    </button>
                    <button
                        onClick={() => setActiveTab('links')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'links' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2">🔗</span> Links & QR
                    </button>
                    <button
                        onClick={() => setActiveTab('sandbox')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'sandbox' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2">🧪</span> Sandbox Config
                    </button>
                    <button
                        onClick={() => setActiveTab('production')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'production' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2">🚀</span> Production
                    </button>
                    <button
                        onClick={() => setActiveTab('senders')}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'senders' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2"><Icons.Phone /></span> Senders
                    </button>
                </div>
            </div>

            {activeTab === 'widget' && (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left: Builder */}
                    <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                        <h3 className="font-bold text-white mb-6 flex items-center">
                            <span className="bg-blue-500/20 text-blue-400 p-1.5 rounded mr-2"><Icons.Settings /></span>
                            Widget Customizer
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Greeting Message</label>
                                <div className="flex gap-2">
                                    <textarea
                                        value={widget.greeting}
                                        onChange={(e) => handleWidgetUpdate('greeting', e.target.value)}
                                        className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm h-20 resize-none outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleGenerateGreeting}
                                        disabled={isGeneratingGreeting}
                                        className="bg-purple-600 hover:bg-purple-500 text-white w-12 rounded flex flex-col items-center justify-center text-[10px] font-bold disabled:opacity-50"
                                    >
                                        {isGeneratingGreeting ? '...' : <><Icons.Wand /><span className="mt-1">AI</span></>}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Button Color</label>
                                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded border border-slate-600">
                                    <input
                                        type="color"
                                        value={widget.color}
                                        onChange={(e) => handleWidgetUpdate('color', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    />
                                    <span className="text-slate-300 font-mono text-sm">{widget.color}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Position</label>
                                    <select
                                        value={widget.position}
                                        onChange={(e) => handleWidgetUpdate('position', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                    >
                                        <option value="right">Bottom Right</option>
                                        <option value="left">Bottom Left</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Icon Style</label>
                                    <select
                                        value={widget.icon}
                                        onChange={(e) => handleWidgetUpdate('icon', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                    >
                                        <option value="whatsapp">WhatsApp Logo</option>
                                        <option value="chat">Chat Bubble</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">CTA Label</label>
                                <input
                                    value={widget.ctaText}
                                    onChange={(e) => handleWidgetUpdate('ctaText', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Popup Delay (seconds)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={widget.delay}
                                        onChange={(e) => handleWidgetUpdate('delay', parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <span className="text-white font-mono w-8 text-right">{widget.delay}s</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <h4 className="text-white text-xs font-bold uppercase mb-3">Installation Code</h4>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative group">
                                    <pre className="text-[10px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                                        {widgetCodeSnippet}
                                    </pre>
                                    <button
                                        onClick={() => handleCopy(widgetCodeSnippet)}
                                        className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Paste this before the closing &lt;/body&gt; tag.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="flex-1 bg-white rounded-xl border-8 border-slate-800 overflow-hidden relative shadow-2xl flex flex-col">
                        {/* Mock Browser Bar */}
                        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center space-x-2">
                            <div className="flex space-x-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-white h-6 rounded border border-slate-200 mx-4 flex items-center px-3 text-[10px] text-slate-400">
                                https://your-business.com
                            </div>
                        </div>

                        {/* Mock Website Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                            <div className="max-w-2xl mx-auto">
                                <div className="h-8 w-1/3 bg-slate-200 rounded mb-8"></div>
                                <div className="h-64 w-full bg-slate-200 rounded-xl mb-8"></div>
                                <div className="space-y-4">
                                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                                    <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* The Widget */}
                        <div
                            className={`absolute bottom-6 ${widget.position === 'right' ? 'right-6' : 'left-6'} flex flex-col items-${widget.position === 'right' ? 'end' : 'start'} z-20 transition-all duration-500`}
                        >
                            {/* Greeting Bubble */}
                            <div className={`bg-white p-4 rounded-lg shadow-xl border border-slate-100 mb-4 max-w-xs relative animate-in slide-in-from-bottom-4 fade-in duration-700 ${widget.position === 'right' ? 'rounded-br-none' : 'rounded-bl-none'}`} style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${business.name}&background=random`} alt="Agent" className="w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{business.name}</p>
                                        <p className="text-[10px] text-slate-500">Replies instantly</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-snug">{widget.greeting}</p>

                                {/* Close X */}
                                <button className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-slate-200 text-slate-400 hover:text-red-500 text-[10px] w-5 h-5 flex items-center justify-center">✕</button>
                            </div>

                            {/* Main Button */}
                            <button
                                className="flex items-center shadow-lg hover:scale-105 transition-transform active:scale-95 group"
                                style={{
                                    backgroundColor: widget.color,
                                    borderRadius: '2rem',
                                    padding: widget.ctaText ? '10px 20px 10px 16px' : '14px'
                                }}
                            >
                                <span className="text-white text-2xl flex items-center justify-center">
                                    {widget.icon === 'whatsapp' ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    ) : (
                                        <Icons.MessageSquare />
                                    )}
                                </span>
                                {widget.ctaText && (
                                    <span className="text-white font-bold text-sm ml-2">{widget.ctaText}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'links' && (
                <div className="flex flex-1 gap-8 overflow-hidden">
                    {/* Left: Configuration */}
                    <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
                        <h3 className="font-bold text-white mb-6 flex items-center">
                            <span className="bg-pink-500/20 text-pink-400 p-1.5 rounded mr-2">🔗</span>
                            Link Builder
                        </h3>

                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Link Context</label>
                                <div className="flex bg-slate-900 rounded p-1 border border-slate-600">
                                    <button onClick={() => setLinkType('custom')} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${linkType === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Custom</button>
                                    <button onClick={() => setLinkType('product')} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${linkType === 'product' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Product</button>
                                    <button onClick={() => setLinkType('coupon')} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${linkType === 'coupon' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Coupon</button>
                                </div>
                            </div>

                            {linkType === 'custom' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Pre-filled Message</label>
                                    <textarea
                                        value={linkMessage}
                                        onChange={e => setLinkMessage(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm h-24 outline-none focus:border-blue-500"
                                        placeholder="Hi, I'm interested in your services..."
                                    />
                                </div>
                            )}

                            {linkType === 'product' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Select Product</label>
                                    <select
                                        value={selectedProductId}
                                        onChange={e => setSelectedProductId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="">Choose a product...</option>
                                        {business.products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {linkType === 'coupon' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Select Coupon</label>
                                    <select
                                        value={selectedCouponCode}
                                        onChange={e => setSelectedCouponCode(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="">Choose a coupon...</option>
                                        {business.promotions?.map(c => (
                                            <option key={c.id} value={c.code}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : `$${c.value}`})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">QR Color</label>
                                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded border border-slate-600">
                                    <input
                                        type="color"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    />
                                    <span className="text-slate-300 font-mono text-sm">{qrColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Output */}
                    <div className="flex-1 bg-white rounded-xl border-8 border-slate-800 p-8 flex flex-col items-center justify-center relative shadow-2xl">
                        <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase">Live Preview</div>

                        <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 mb-8 transform hover:scale-105 transition-transform duration-300">
                            <img src={generatedQrUrl} alt="QR Code" className="w-64 h-64" />
                        </div>

                        <div className="w-full max-w-lg space-y-4">
                            <div>
                                <label className="block text-slate-500 text-xs font-bold mb-2 uppercase text-center">Direct Link</label>
                                <div className="flex items-center">
                                    <input
                                        readOnly
                                        value={generatedLink}
                                        className="flex-1 bg-slate-100 border border-slate-300 rounded-l p-3 text-slate-600 text-sm outline-none truncate"
                                    />
                                    <button
                                        onClick={() => handleCopy(generatedLink)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r font-bold text-sm"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <a
                                    href={generatedQrUrl}
                                    download="qrcode.png"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Icons.Download /> <span>Download QR</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sandbox' && (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left: Configuration */}
                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Sandbox Configuration</h3>
                        <p className="text-slate-400 text-sm mb-6 border-b border-slate-700 pb-4">
                            To send and receive messages from the Sandbox to your Application, configure your endpoint URLs below.
                        </p>

                        <div className="space-y-8">
                            <div className="p-5 bg-[#f0f4f8] text-slate-800 border border-slate-300 rounded-lg shadow-inner">
                                <div className="mb-4">
                                    <h4 className="font-bold text-sm mb-2 text-slate-900">When a message comes in</h4>
                                    <div className="flex gap-0 items-center">
                                        <input
                                            value={incomingUrl}
                                            onChange={e => setIncomingUrl(e.target.value)}
                                            className="flex-1 bg-white border border-slate-300 border-r-0 rounded-l px-3 py-2 font-mono text-xs text-slate-600 truncate outline-none focus:bg-blue-50"
                                        />
                                        <div className="bg-slate-200 text-slate-600 px-3 py-2 text-xs font-bold border border-slate-300 border-l-0 border-r-0 uppercase">
                                            HTTP POST
                                        </div>
                                        <button onClick={handleSandboxSave} className="bg-red-600 text-white px-4 py-2 rounded-r font-bold text-xs hover:bg-red-700 uppercase">
                                            {isSaved ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-bold text-sm mb-2 text-slate-900">Status callback URL</h4>
                                    <div className="flex gap-0 items-center">
                                        <input
                                            value={statusCallbackUrl}
                                            onChange={e => setStatusCallbackUrl(e.target.value)}
                                            className="flex-1 bg-white border border-slate-300 border-r-0 rounded-l px-3 py-2 font-mono text-xs text-slate-600 truncate outline-none focus:bg-blue-50"
                                        />
                                        <div className="bg-slate-200 text-slate-600 px-3 py-2 text-xs font-bold border border-slate-300 border-l-0 border-r-0 uppercase">
                                            HTTP POST
                                        </div>
                                        <button onClick={handleSandboxSave} className="bg-red-600 text-white px-4 py-2 rounded-r font-bold text-xs hover:bg-red-700 uppercase">
                                            {isSaved ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-0">
                                    <h4 className="font-bold text-sm mb-2 text-slate-900">Fallback URL (Optional)</h4>
                                    <div className="flex gap-0 items-center">
                                        <input
                                            value={fallbackUrl}
                                            onChange={e => setFallbackUrl(e.target.value)}
                                            className="flex-1 bg-white border border-slate-300 border-r-0 rounded-l px-3 py-2 font-mono text-xs text-slate-600 truncate outline-none focus:bg-blue-50"
                                        />
                                        <div className="bg-slate-200 text-slate-600 px-3 py-2 text-xs font-bold border border-slate-300 border-l-0 border-r-0 uppercase">
                                            HTTP POST
                                        </div>
                                        <button onClick={handleSandboxSave} className="bg-red-600 text-white px-4 py-2 rounded-r font-bold text-xs hover:bg-red-700 uppercase">
                                            {isSaved ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-[#f0f4f8] text-slate-800 border border-slate-300 rounded-lg shadow-inner">
                                <h4 className="font-bold text-sm mb-3 text-slate-900">Sandbox Participants</h4>
                                <div className="flex items-start gap-6">
                                    <div className="w-24 h-24 bg-white p-1 rounded border border-slate-300 flex-shrink-0">
                                        <img src={sandboxQrUrl} alt="Join Sandbox QR" className="w-full h-full" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-600 text-xs mb-4">
                                            Invite your friends to your Sandbox. Use WhatsApp to scan the QR code or send a message from your device to:
                                        </p>
                                        <div className="flex items-center justify-between bg-white p-3 border border-slate-300 rounded mb-2">
                                            <span className="text-lg font-bold font-mono text-slate-800">+1 415 523 8886</span>
                                        </div>
                                        <div className="text-slate-600 text-xs mb-1">with code</div>
                                        <div className="flex items-center justify-between bg-white p-3 border border-slate-300 rounded">
                                            <span className="text-lg font-bold font-mono text-blue-600">{joinCode}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800">
                                    <strong>WhatsApp Opt-in Requirements</strong>
                                    <p className="mt-1">WhatsApp requires explicit user opt-ins. The sandbox join message acts as an opt-in for testing.</p>
                                </div>
                            </div>

                            {/* Code Snippet Section */}
                            <div className="p-5 bg-[#1e293b] border border-slate-700 rounded-lg text-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-sm text-white">Test your implementation</h4>
                                    <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                                        <button
                                            onClick={() => setSnippetType('text')}
                                            className={`px-3 py-1 text-[10px] rounded font-bold transition-all ${snippetType === 'text' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Text Message
                                        </button>
                                        <button
                                            onClick={() => setSnippetType('media')}
                                            className={`px-3 py-1 text-[10px] rounded font-bold transition-all ${snippetType === 'media' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Media Message
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">
                                    {snippetType === 'text' ? 'Example code to send a basic text message via Twilio Node.js SDK.' : 'Example code to send a media message (e.g. owl.png) via Twilio Node.js SDK.'}
                                </p>
                                <div className="bg-[#0f172a] p-4 rounded border border-slate-800 font-mono text-xs overflow-x-auto text-green-400 relative group max-h-64 overflow-y-auto custom-scrollbar">
                                    <pre>{snippetType === 'text' ? textSnippet : mediaSnippet}</pre>
                                    <button
                                        onClick={() => handleCopy(snippetType === 'text' ? textSnippet : mediaSnippet)}
                                        className="absolute top-2 right-2 bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Participants */}
                    <div className="w-80 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white text-sm">Sandbox Participants</h3>
                            <span className="text-xs text-slate-500">{sandboxParticipants.length} total</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/30 text-slate-500 text-[10px] uppercase">
                                    <tr>
                                        <th className="px-4 py-2">User ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {sandboxParticipants.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <div className="text-white text-xs font-mono">{p.phone}</div>
                                                <div className="text-[10px] text-green-400 font-bold uppercase mt-1 flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span> {p.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'production' && (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Production Configuration</h3>
                        <p className="text-slate-400 text-sm mb-6 border-b border-slate-700 pb-4">
                            Connect your live WhatsApp Business Account (WABA). This requires a verified Meta Business Manager.
                        </p>

                        <div className="space-y-8">
                            {/* Step 1: Credentials */}
                            <div className="p-5 bg-[#f0f4f8] text-slate-800 border border-slate-300 rounded-lg shadow-inner">
                                <h4 className="font-bold text-sm mb-4 text-slate-900 flex items-center">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                    Twilio Credentials
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Account SID</label>
                                        <input
                                            value={business.twilioAccountSid || ''}
                                            readOnly
                                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-600 text-xs font-mono"
                                            placeholder="Configure in Settings > Integrations"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Auth Token</label>
                                        <input
                                            type="password"
                                            value={business.twilioAuthToken || ''}
                                            readOnly
                                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-600 text-xs font-mono"
                                            placeholder="Configure in Settings > Integrations"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">
                                    Go to <span className="font-bold">Settings &gt; Integrations</span> to update these values.
                                </p>
                            </div>

                            {/* Step 2: Webhook Config */}
                            <div className="p-5 bg-[#f0f4f8] text-slate-800 border border-slate-300 rounded-lg shadow-inner">
                                <h4 className="font-bold text-sm mb-4 text-slate-900 flex items-center">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                    Configure Webhooks
                                </h4>
                                <p className="text-xs text-slate-600 mb-4">
                                    In your Twilio Console, go to <strong>Phone Numbers &gt; Manage &gt; Active Numbers</strong>, select your number, and scroll to the <strong>Messaging</strong> section.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">A Message Comes In (Webhook)</label>
                                        <div className="flex items-center">
                                            <input
                                                readOnly
                                                value={`https://api.chat2close.ai/v1/webhooks/whatsapp/${business.id}/incoming`}
                                                className="flex-1 bg-white border border-slate-300 rounded-l p-2 text-slate-600 text-xs font-mono"
                                            />
                                            <button
                                                onClick={() => handleCopy(`https://api.chat2close.ai/v1/webhooks/whatsapp/${business.id}/incoming`)}
                                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-r border border-l-0 border-slate-300 text-xs font-bold"
                                            >
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Status Callback URL</label>
                                        <div className="flex items-center">
                                            <input
                                                readOnly
                                                value={`https://api.chat2close.ai/v1/callbacks/status/${business.id}`}
                                                className="flex-1 bg-white border border-slate-300 rounded-l p-2 text-slate-600 text-xs font-mono"
                                            />
                                            <button
                                                onClick={() => handleCopy(`https://api.chat2close.ai/v1/callbacks/status/${business.id}`)}
                                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-r border border-l-0 border-slate-300 text-xs font-bold"
                                            >
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Checklist */}
                    <div className="w-80 bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-white font-bold text-sm mb-4">Go-Live Checklist</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${business.twilioAccountSid ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                    {business.twilioAccountSid && <Icons.Check className="w-3 h-3 text-white" />}
                                </div>
                                <p className="text-xs text-slate-300">Twilio Account Connected</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${business.metaVerificationStatus === 'verified' ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                    {business.metaVerificationStatus === 'verified' && <Icons.Check className="w-3 h-3 text-white" />}
                                </div>
                                <p className="text-xs text-slate-300">Meta Business Verification</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${business.twilioNumber ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                    {business.twilioNumber && <Icons.Check className="w-3 h-3 text-white" />}
                                </div>
                                <p className="text-xs text-slate-300">Phone Number Registered</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-4 h-4 rounded border border-slate-500 flex items-center justify-center">
                                </div>
                                <p className="text-xs text-slate-300">Webhooks Configured</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-4 h-4 rounded border border-slate-500 flex items-center justify-center">
                                </div>
                                <p className="text-xs text-slate-300">Payment Method Added</p>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <h4 className="text-blue-400 font-bold text-xs mb-2">Need Help?</h4>
                            <p className="text-[10px] text-slate-400 mb-3">
                                Our support team can help you verify your business and get approved for higher messaging limits.
                            </p>
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'senders' && (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    <div className="w-2/3 flex flex-col gap-6">
                        {/* Meta Verification Card */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex items-start justify-between shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 flex items-center">
                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded mr-2">META</span>
                                    Business Manager
                                </h3>
                                <p className="text-sm text-slate-400 max-w-md">
                                    Connect your Meta Business Manager account to scale your messaging limits and register more phone numbers.
                                </p>
                                <div className="mt-4 flex items-center space-x-4">
                                    <div className="flex items-center text-xs text-slate-500">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${business.metaVerificationStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        Status: <span className="text-white font-bold uppercase ml-1">{business.metaVerificationStatus || 'Unverified'}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <span className="mr-2">🆔</span> ID: <span className="text-white font-mono ml-1">{business.metaBusinessId || 'Not Connected'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleMetaVerify}
                                disabled={isVerifyingMeta || business.metaVerificationStatus === 'verified'}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all"
                            >
                                {isVerifyingMeta ? 'Verifying...' : business.metaVerificationStatus === 'verified' ? 'Verified ✓' : 'Connect Manager'}
                            </button>
                        </div>

                        {/* Sender List */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col flex-1 overflow-hidden">
                            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wide">WhatsApp Senders</h3>
                                <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium flex items-center">
                                    <Icons.Plus /> <span className="ml-1">Add Number</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {senders.map(sender => (
                                    <div key={sender.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between hover:border-slate-600 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                                <Icons.Phone />
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <h4 className="text-white font-bold text-sm mr-2">{sender.displayName}</h4>
                                                    <span className="text-[10px] text-slate-500 font-mono">{sender.phoneNumber}</span>
                                                </div>
                                                <div className="flex items-center mt-1 space-x-3">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sender.status === 'Connected' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                                                        {sender.status}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Limit: {sender.messagingLimit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quality Rating</span>
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-8 h-1.5 rounded-full ${sender.qualityRating === 'High' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                                <div className={`w-8 h-1.5 rounded-full ${sender.qualityRating === 'Medium' ? 'bg-yellow-500' : sender.qualityRating === 'High' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                                <div className={`w-8 h-1.5 rounded-full ${sender.qualityRating === 'Low' ? 'bg-red-500' : sender.qualityRating === 'Medium' || sender.qualityRating === 'High' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1">{sender.qualityRating}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center">
                            <span className="mr-2">⚠️</span> Limits & Compliance
                        </h3>
                        <div className="space-y-4 text-xs text-slate-400">
                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                <p className="font-bold text-slate-300 mb-1">Unverified Business Limit</p>
                                <p>Max 2 phone numbers allowed across all WABAs until Meta Business Verification is complete.</p>
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                <p className="font-bold text-slate-300 mb-1">Official Business Account (OBA)</p>
                                <p>Verified businesses can request a Green Checkmark (OBA) to increase messaging limits to 100k+ and register up to 1000 numbers.</p>
                                <button className="mt-2 text-blue-400 hover:text-blue-300 underline">Request OBA Access</button>
                            </div>
                            <div className="p-3 bg-slate-900 rounded border border-slate-700">
                                <p className="font-bold text-slate-300 mb-1">Display Name Rules</p>
                                <p>Display names must have a relationship with your business and cannot violate WhatsApp Commerce Policy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Connect;
