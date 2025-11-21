
import React, { useState, useEffect } from 'react';
import { BusinessProfile, ApiKey, Webhook, MessageLog, WebhookEventLog } from '../types';
import { MOCK_API_KEYS, Icons } from '../constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface DeveloperProps {
    business: BusinessProfile;
    logs: MessageLog[];
    webhookLogs: WebhookEventLog[];
    onClearLogs: () => void;
    onSeedData?: () => void;
    webhooks?: Webhook[];
    onUpdateWebhooks?: (webhooks: Webhook[]) => void;
}

const Developer: React.FC<DeveloperProps> = ({ business, logs, webhookLogs, onClearLogs, onSeedData, webhooks = [], onUpdateWebhooks }) => {
    const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'inspector' | 'logs' | 'status' | 'docs' | 'deploy' | 'seed'>('keys');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);

    // Webhook Form
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);
    const [whUrl, setWhUrl] = useState('');
    const [whEvents, setWhEvents] = useState<string[]>(['order.created']);

    const [copied, setCopied] = useState('');

    // Seed State
    const [isSeeding, setIsSeeding] = useState(false);

    // Deploy State
    const [platform, setPlatform] = useState<'node' | 'vercel'>('node');

    // Status State (Simulated Latency)
    const [latencyData, setLatencyData] = useState<{ time: string, latency: number }[]>([]);

    useEffect(() => {
        if (activeTab === 'status') {
            const interval = setInterval(() => {
                setLatencyData(prev => {
                    const now = new Date();
                    const newItem = {
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        latency: 100 + Math.random() * 200 // 100-300ms mock latency
                    };
                    const newData = [...prev, newItem];
                    if (newData.length > 20) newData.shift();
                    return newData;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const handleCreateKey = () => {
        const newKey: ApiKey = {
            id: `key_${Date.now()}`,
            name: `API Key ${apiKeys.length + 1}`,
            prefix: `pk_live_${Math.random().toString(36).substring(2, 10)}...`,
            created: Date.now(),
            lastUsed: 0,
            status: 'active'
        };
        setApiKeys([newKey, ...apiKeys]);
    };

    const handleAddWebhook = () => {
        if (!whUrl) return;
        const newHook: Webhook = {
            id: `wh_${Date.now()}`,
            url: whUrl,
            events: whEvents as any,
            status: 'active'
        };
        if (onUpdateWebhooks) onUpdateWebhooks([...webhooks, newHook]);
        setIsAddingWebhook(false);
        setWhUrl('');
        setWhEvents(['order.created']);
    };

    const handleDeleteWebhook = (id: string) => {
        if (onUpdateWebhooks) onUpdateWebhooks(webhooks.filter(w => w.id !== id));
    };

    const toggleWebhookEvent = (evt: string) => {
        if (whEvents.includes(evt)) {
            setWhEvents(whEvents.filter(e => e !== evt));
        } else {
            setWhEvents([...whEvents, evt]);
        }
    };

    const handleSeedData = () => {
        if (confirm("This will generate 50 fake orders, 20 tickets, and fill your logs. Continue?")) {
            setIsSeeding(true);
            if (onSeedData) {
                onSeedData();
                setTimeout(() => {
                    setIsSeeding(false);
                }, 1000);
            } else {
                setTimeout(() => {
                    setIsSeeding(false);
                    alert("Seeding function not connected.");
                }, 1000);
            }
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

    const getStatusColor = (status: MessageLog['status']) => {
        switch (status) {
            case 'queued': return 'bg-slate-600 text-slate-300';
            case 'sent': return 'bg-blue-500/20 text-blue-400';
            case 'delivered': return 'bg-purple-500/20 text-purple-400';
            case 'read': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    // Dynamic Code Generators
    const generateServerCode = () => {
        const productsJson = JSON.stringify(business.products.map(p => ({ id: p.id, name: p.name, price: p.price, description: p.description })), null, 2);
        const policies = business.policies.replace(/\n/g, ' ');

        return `
/**
 * Chat2Close Auto-Generated Server for ${business.name}
 * Platform: Node.js / Express
 */
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Config
const PORT = process.env.PORT || 3000;
const AI_KEY = process.env.GEMINI_API_KEY;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// Initialize AI
const ai = new GoogleGenAI({ apiKey: AI_KEY });
const model = 'gemini-2.5-flash';

// Business Data
const PRODUCTS = ${productsJson};
const POLICIES = "${policies}";

// In-memory session store (Use Redis for production)
const sessions = {}; 

app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From;
  
  console.log(\`Received from \${from}: \${incomingMsg}\`);

  // Retrieve history
  if (!sessions[from]) sessions[from] = [];
  const history = sessions[from];

  // System Prompt
  const systemInstruction = \`You are an AI agent for ${business.name}. 
  Policies: \${POLICIES}. 
  Products: \${JSON.stringify(PRODUCTS)}. 
  Goal: Sell products and answer questions. Keep it short.\`;

  try {
    // Call Gemini
    const result = await ai.models.generateContent({
      model: model,
      contents: [...history, { role: 'user', parts: [{ text: incomingMsg }] }],
      config: { systemInstruction }
    });
    
    const aiResponse = result.text;
    
    // Update History
    sessions[from].push({ role: 'user', parts: [{ text: incomingMsg }] });
    sessions[from].push({ role: 'model', parts: [{ text: aiResponse }] });

    // Send Reply via Twilio
    const client = twilio(TWILIO_SID, TWILIO_TOKEN);
    await client.messages.create({
      from: 'whatsapp:${business.twilioNumber.replace('+', '')}',
      to: from,
      body: aiResponse
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
      `.trim();
    };

    const generateEnv = () => {
        return `
PORT=3000
GEMINI_API_KEY=${process.env.API_KEY || 'YOUR_GEMINI_KEY_HERE'}
TWILIO_ACCOUNT_SID=${business.twilioAccountSid || 'YOUR_TWILIO_SID'}
TWILIO_AUTH_TOKEN=${business.twilioAuthToken || 'YOUR_TWILIO_TOKEN'}
      `.trim();
    };

    const generatePackageJson = () => {
        return JSON.stringify({
            name: business.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '') + '-bot',
            version: "1.0.0",
            main: "server.js",
            dependencies: {
                "express": "^4.18.2",
                "body-parser": "^1.20.2",
                "twilio": "^4.19.0",
                "@google/genai": "^1.30.0"
            },
            scripts: {
                "start": "node server.js"
            }
        }, null, 2);
    };

    const successRate = webhookLogs.length > 0
        ? Math.round((webhookLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length / webhookLogs.length) * 100)
        : 100;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Developer Console</h2>
                    <p className="text-slate-400">Manage API access, webhooks, and deployment.</p>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto max-w-full no-scrollbar">
                    <button onClick={() => setActiveTab('keys')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'keys' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Keys</button>
                    <button onClick={() => setActiveTab('webhooks')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'webhooks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Webhooks</button>
                    <button onClick={() => setActiveTab('inspector')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'inspector' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Inspector</button>
                    <button onClick={() => setActiveTab('logs')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Logs</button>
                    <button onClick={() => setActiveTab('status')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'status' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Status</button>
                    <button onClick={() => setActiveTab('docs')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Docs</button>
                    <button onClick={() => setActiveTab('deploy')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'deploy' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-slate-400 hover:text-white'}`}>🚀 Deploy</button>
                    <button onClick={() => setActiveTab('seed')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'seed' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white'}`}>💾 Seed Data</button>
                </div>
            </div>

            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">

                {activeTab === 'keys' && (
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">API Keys</h3>
                            <button onClick={handleCreateKey} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Generate Key</button>
                        </div>
                        <div className="space-y-2">
                            {apiKeys.map(k => (
                                <div key={k.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                                    <div>
                                        <div className="font-bold text-white text-sm">{k.name}</div>
                                        <div className="font-mono text-slate-500 text-xs">{k.prefix}</div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded uppercase ${k.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{k.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'webhooks' && (
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Outbound Webhooks</h3>
                                <p className="text-xs text-slate-400">Notify external systems when events happen in Chat2Close.</p>
                            </div>
                            <button onClick={() => setIsAddingWebhook(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center"><Icons.Plus /> <span className="ml-1">Add Endpoint</span></button>
                        </div>

                        {isAddingWebhook && (
                            <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2">
                                <h4 className="font-bold text-white text-sm mb-3">Configure Endpoint</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Endpoint URL</label>
                                        <input
                                            value={whUrl}
                                            onChange={e => setWhUrl(e.target.value)}
                                            placeholder="https://api.your-erp.com/webhook"
                                            className="w-full bg-slate-800 border border-slate-500 rounded p-2 text-white text-sm outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Subscribe to Events</label>
                                        <div className="flex gap-2">
                                            {['order.created', 'ticket.created', 'message.received'].map(evt => (
                                                <button
                                                    key={evt}
                                                    onClick={() => toggleWebhookEvent(evt)}
                                                    className={`text-xs px-2 py-1 rounded border ${whEvents.includes(evt) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                                                >
                                                    {evt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button onClick={() => setIsAddingWebhook(false)} className="text-slate-400 hover:text-white text-sm px-3">Cancel</button>
                                        <button onClick={handleAddWebhook} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold">Save Hook</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {webhooks.map(hook => (
                                <div key={hook.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-mono text-sm">{hook.url}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${hook.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{hook.status}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {hook.events.map(e => <span key={e} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 rounded border border-slate-700">{e}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-600 px-3 py-1.5 rounded" title="Send Test Payload">
                                            Test
                                        </button>
                                        <button onClick={() => handleDeleteWebhook(hook.id)} className="text-slate-500 hover:text-red-400 p-2">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {webhooks.length === 0 && !isAddingWebhook && (
                                <div className="text-center py-12 text-slate-500 text-sm italic">
                                    No outbound webhooks configured.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="flex h-full">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {logs.map(log => (
                                <div key={log.id} className="bg-slate-900 p-3 rounded border border-slate-700 text-sm hover:border-blue-500 cursor-pointer group">
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-bold ${log.direction === 'inbound' ? 'text-green-400' : 'text-blue-400'}`}>{log.direction.toUpperCase()}</span>
                                        <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-slate-300 truncate mb-2">{log.body}</div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${getStatusColor(log.status)}`}>{log.status}</span>
                                        <span className="font-mono text-slate-500 text-xs">SID: {log.sid}</span>
                                    </div>
                                    {/* Visual Trace */}
                                    <div className="mt-3 pt-2 border-t border-slate-800 hidden group-hover:flex items-center justify-between px-2">
                                        <div className={`w-2 h-2 rounded-full ${log.status === 'queued' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                        <div className={`h-0.5 flex-1 mx-1 ${['sent', 'delivered', 'read'].includes(log.status) ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                        <div className={`w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-blue-500' : ['delivered', 'read'].includes(log.status) ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                                        <div className={`h-0.5 flex-1 mx-1 ${['delivered', 'read'].includes(log.status) ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                        <div className={`w-2 h-2 rounded-full ${log.status === 'delivered' ? 'bg-blue-500' : ['read'].includes(log.status) ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                                        <div className={`h-0.5 flex-1 mx-1 ${log.status === 'read' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                        <div className={`w-2 h-2 rounded-full ${log.status === 'read' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-center py-12 text-slate-500">No logs available.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'inspector' && (
                    <div className="flex h-full flex-col">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                            <h3 className="font-bold text-white">Live Webhook Inspector</h3>
                            <button onClick={onClearLogs} className="text-xs text-slate-400 hover:text-white">Clear All</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                            {webhookLogs.map(log => (
                                <div key={log.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors group">
                                    <div className="p-3 cursor-pointer" onClick={() => { }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 rounded ${log.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{log.method}</span>
                                                <span className="text-xs font-mono text-slate-300 truncate max-w-md">{log.url}</span>
                                            </div>
                                            <span className={`text-xs font-bold ${log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-400' : 'text-red-400'}`}>{log.statusCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`text-[10px] uppercase font-bold ${log.type === 'outbound_webhook' ? 'text-yellow-400' : 'text-slate-500'}`}>{log.type.replace('_', ' ')}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 text-[10px] font-mono text-slate-400 overflow-x-auto hidden group-hover:block border-t border-slate-800">
                                        {JSON.stringify(log.payload, null, 2)}
                                    </div>
                                </div>
                            ))}
                            {webhookLogs.length === 0 && <div className="p-12 text-center text-slate-500 italic">Waiting for events... Use simulator to trigger webhooks.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'status' && (
                    <div className="p-6 flex-1 overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-6">System Status & Health</h3>

                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold">API Uptime</p>
                                <h4 className="text-xl font-bold text-green-400">99.98%</h4>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold">Avg Latency</p>
                                <h4 className="text-xl font-bold text-blue-400">142ms</h4>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold">Webhook Success</p>
                                <h4 className={`text-xl font-bold ${successRate > 95 ? 'text-green-400' : 'text-yellow-400'}`}>{successRate}%</h4>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold">Active Threads</p>
                                <h4 className="text-xl font-bold text-purple-400">42</h4>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 h-64 mb-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Real-time API Latency (ms)</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={latencyData}>
                                    <defs>
                                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} interval={4} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-white font-medium">Twilio Gateway</span>
                                </div>
                                <span className="text-xs text-green-400">Operational</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-white font-medium">Gemini AI Engine</span>
                                </div>
                                <span className="text-xs text-green-400">Operational</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-white font-medium">Database Shards</span>
                                </div>
                                <span className="text-xs text-green-400">Operational</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'docs' && (
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-64 bg-slate-900 border-r border-slate-700 p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Contents</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li className="text-white font-medium cursor-pointer hover:text-blue-400">Getting Started</li>
                                <li className="cursor-pointer hover:text-blue-400">Twilio Configuration</li>
                                <li className="cursor-pointer hover:text-blue-400">AI System Prompting</li>
                                <li className="cursor-pointer hover:text-blue-400">Webhooks & Events</li>
                                <li className="cursor-pointer hover:text-blue-400">Rate Limits</li>
                            </ul>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <h1 className="text-2xl font-bold text-white mb-4">Getting Started</h1>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Welcome to the Chat2Close Developer API. This platform allows you to programmatically manage your WhatsApp AI agents,
                                sync inventory, and listen to conversation events in real-time.
                            </p>

                            <h3 className="text-lg font-bold text-white mb-2">Authentication</h3>
                            <p className="text-slate-400 mb-4 text-sm">
                                All API requests require a valid API Key sent in the header:
                            </p>
                            <div className="bg-black p-4 rounded border border-slate-700 font-mono text-xs text-green-400 mb-8">
                                Authorization: Bearer pk_live_...
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Webhook Events</h3>
                            <p className="text-slate-400 mb-4 text-sm">
                                Configure your webhook URL in the "Webhooks" tab to receive the following events:
                            </p>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 mb-8">
                                <li><code className="bg-slate-900 px-1 rounded">message.received</code> - When a customer sends a message.</li>
                                <li><code className="bg-slate-900 px-1 rounded">order.created</code> - When the AI successfully closes a sale.</li>
                                <li><code className="bg-slate-900 px-1 rounded">ticket.created</code> - When a support ticket is raised.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'deploy' && (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white mb-2">Export Server Code</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Download a production-ready backend pre-configured with your business logic, products, and policies.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPlatform('node')}
                                    className={`px-4 py-2 rounded-lg border font-bold text-sm flex items-center ${platform === 'node' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                                >
                                    Node.js / Express
                                </button>
                                <button
                                    onClick={() => setPlatform('vercel')}
                                    className={`px-4 py-2 rounded-lg border font-bold text-sm flex items-center ${platform === 'vercel' ? 'bg-white text-black border-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                                >
                                    Next.js / Vercel
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
                            {/* Server File */}
                            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[500px]">
                                <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                                    <span className="text-xs font-mono text-yellow-400">server.js</span>
                                    <button onClick={() => handleCopy(generateServerCode())} className="text-xs text-blue-400 hover:text-white">
                                        {copied.includes('express') ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre className="flex-1 p-4 text-[10px] font-mono text-slate-300 overflow-auto custom-scrollbar whitespace-pre-wrap">
                                    {generateServerCode()}
                                </pre>
                            </div>

                            {/* Config Files */}
                            <div className="flex flex-col gap-6 h-[500px]">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col flex-1">
                                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-400">.env</span>
                                        <button onClick={() => handleCopy(generateEnv())} className="text-xs text-blue-400 hover:text-white">Copy</button>
                                    </div>
                                    <pre className="flex-1 p-4 text-[10px] font-mono text-green-400 overflow-auto custom-scrollbar">
                                        {generateEnv()}
                                    </pre>
                                </div>

                                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col flex-1">
                                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                                        <span className="text-xs font-mono text-red-400">package.json</span>
                                        <button onClick={() => handleCopy(generatePackageJson())} className="text-xs text-blue-400 hover:text-white">Copy</button>
                                    </div>
                                    <pre className="flex-1 p-4 text-[10px] font-mono text-slate-300 overflow-auto custom-scrollbar">
                                        {generatePackageJson()}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 flex justify-end">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center">
                                <Icons.Download /> <span className="ml-2">Download Project ZIP</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'seed' && (
                    <div className="p-8 flex flex-col items-center justify-center h-full">
                        <div className="bg-purple-900/20 p-6 rounded-full mb-6 text-5xl">
                            💾
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Demo Data Generator</h3>
                        <p className="text-slate-400 max-w-md text-center mb-8">
                            Instantly populate your dashboard with realistic Orders, Customers, Tickets, and Chat Logs. Useful for demos and testing.
                        </p>

                        <button
                            onClick={handleSeedData}
                            disabled={isSeeding}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-purple-900/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                        >
                            {isSeeding ? 'Seeding Database...' : 'Generate Demo Data'}
                        </button>

                        <p className="text-xs text-slate-500 mt-4">
                            * Adds 50 orders, 20 tickets, 100 logs. Does not delete existing data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Developer;
