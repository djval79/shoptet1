
import React, { useState } from 'react';
import { BusinessProfile, Automation, RoutingRule } from '../types';
import { MOCK_AUTOMATIONS, Icons, MOCK_TEAM } from '../constants';
import { generateAutomationWorkflow } from '../services/geminiService';

interface AutomationsProps {
    business: BusinessProfile;
}

const Automations: React.FC<AutomationsProps> = ({ business }) => {
    const [activeTab, setActiveTab] = useState<'workflows' | 'routing'>('workflows');
    const [flows, setFlows] = useState<Automation[]>(MOCK_AUTOMATIONS);
    const [rules, setRules] = useState<RoutingRule[]>(business.routingRules || []);
    const [selectedFlowId, setSelectedFlowId] = useState<string>(MOCK_AUTOMATIONS[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiGoal, setAiGoal] = useState('');

    // Routing Rule Form
    const [isAddingRule, setIsAddingRule] = useState(false);
    const [newRule, setNewRule] = useState<Partial<RoutingRule>>({
        condition: 'contains_keyword',
        value: '',
        action: 'assign_agent',
        target: '',
        active: true
    });

    const selectedFlow = flows.find(f => f.id === selectedFlowId) || flows[0];

    const handleGenerate = async () => {
        if (!aiGoal.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateAutomationWorkflow(business, aiGoal);

            const newFlow: Automation = {
                id: `auto_${Date.now()}`,
                name: aiGoal.length > 20 ? aiGoal.substring(0, 20) + '...' : aiGoal,
                trigger: 'new_customer', // Default for AI
                active: false,
                stats: { runs: 0, converted: 0 },
                steps: result.steps.map((s: any, i: number) => ({
                    id: `step_${Date.now()}_${i}`,
                    type: s.type,
                    content: s.content
                }))
            };

            setFlows(prev => [...prev, newFlow]);
            setSelectedFlowId(newFlow.id);
            setAiGoal('');
        } catch (e) {
            console.error("Workflow Gen Failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleActive = (id: string) => {
        setFlows(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
    };

    const handleAddRule = () => {
        if (!newRule.value || !newRule.target) return;

        const rule: RoutingRule = {
            id: `rule_${Date.now()}`,
            name: `Rule ${rules.length + 1}`,
            condition: newRule.condition!,
            value: newRule.value,
            action: newRule.action!,
            target: newRule.target,
            active: true
        };

        setRules([...rules, rule]);
        setIsAddingRule(false);
        setNewRule({ condition: 'contains_keyword', value: '', action: 'assign_agent', target: '', active: true });

        // In a real app, we'd call onUpdateBusiness here to persist
        business.routingRules = [...(business.routingRules || []), rule];
    };

    const deleteRule = (id: string) => {
        const updated = rules.filter(r => r.id !== id);
        setRules(updated);
        business.routingRules = updated;
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Automation Studio</h2>
                    <p className="text-slate-400">Manage marketing workflows and intelligent chat routing.</p>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'workflows' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2">⚡</span> Workflows
                    </button>
                    <button
                        onClick={() => setActiveTab('routing')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'routing' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <span className="mr-2">🔀</span> Inbox Routing
                    </button>
                </div>
            </div>

            {activeTab === 'workflows' && (
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wide">My Workflows</h3>
                        </div>
                        <div className="p-3 border-b border-slate-700 bg-slate-800">
                            <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-lg border border-slate-600">
                                <input
                                    value={aiGoal}
                                    onChange={e => setAiGoal(e.target.value)}
                                    placeholder="e.g. 'Win back old customers'"
                                    className="flex-1 bg-transparent text-xs text-white outline-none px-2"
                                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !aiGoal}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center disabled:opacity-50"
                                >
                                    {isGenerating ? '...' : 'AI Build'}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {flows.map(flow => (
                                <div
                                    key={flow.id}
                                    onClick={() => setSelectedFlowId(flow.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedFlowId === flow.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-transparent hover:bg-slate-700/50'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-white font-medium text-sm">{flow.name}</span>
                                        <div onClick={(e) => { e.stopPropagation(); toggleActive(flow.id); }} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${flow.active ? 'bg-green-500' : 'bg-slate-600'}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${flow.active ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>Trigger: {flow.trigger.replace('_', ' ')}</span>
                                        <span>{flow.stats.runs} runs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl relative overflow-hidden flex flex-col">
                        {/* Editor Header */}
                        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center z-10">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                    <Icons.Workflow />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedFlow.name}</h3>
                                    <p className="text-xs text-slate-400">Trigger: <span className="text-blue-300 font-mono">{selectedFlow.trigger}</span></p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="text-slate-400 hover:text-red-400 p-2"><Icons.Trash /></button>
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Save Workflow</button>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">
                            <div className="max-w-xl mx-auto relative">
                                {/* Trigger Node */}
                                <div className="flex justify-center mb-8 relative z-10">
                                    <div className="bg-slate-700 text-white px-6 py-3 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-900/20 font-bold text-sm flex items-center">
                                        ⚡ WHEN: {selectedFlow.trigger.toUpperCase().replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                <div className="absolute left-1/2 top-8 bottom-0 w-0.5 bg-slate-600 -translate-x-1/2 z-0"></div>

                                {/* Steps */}
                                <div className="space-y-8 relative z-10">
                                    {selectedFlow.steps.map((step, idx) => (
                                        <div key={step.id} className="flex items-center justify-center animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 w-80 shadow-xl relative group hover:border-blue-500/50 transition-colors">

                                                {/* Icon Badge */}
                                                <div className={`absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-[#0f172a] flex items-center justify-center ${step.type === 'message' ? 'bg-green-500' :
                                                        step.type === 'delay' ? 'bg-yellow-500' : 'bg-purple-500'
                                                    }`}>
                                                    {step.type === 'message' && <span className="text-white text-xs"><Icons.MessageSquare /></span>}
                                                    {step.type === 'delay' && <span className="text-white text-xs"><Icons.Clock /></span>}
                                                    {step.type === 'tag' && <span className="text-white text-xs"><Icons.Tag /></span>}
                                                </div>

                                                <div className="text-xs font-bold uppercase text-slate-500 mb-1">{step.type}</div>
                                                {step.type === 'message' ? (
                                                    <div className="bg-[#202c33] p-2 rounded text-sm text-white border-l-4 border-green-500 text-xs">
                                                        {step.content}
                                                    </div>
                                                ) : (
                                                    <div className="text-white font-mono text-sm">{step.content}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Step Placeholder */}
                                    <div className="flex justify-center pt-4">
                                        <button className="bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 text-slate-400 px-4 py-2 rounded-full text-xs flex items-center transition-colors">
                                            <Icons.Plus /> <span className="ml-2">Add Step</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'routing' && (
                <div className="flex flex-col h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">Smart Routing Rules</h3>
                            <p className="text-xs text-slate-400">Automatically assign chats or tag customers based on incoming messages.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingRule(true)}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center"
                        >
                            <Icons.Plus /> <span className="ml-2">New Rule</span>
                        </button>
                    </div>

                    {isAddingRule && (
                        <div className="p-6 bg-slate-700/30 border-b border-slate-700 animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">If Condition</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newRule.condition}
                                            onChange={e => setNewRule({ ...newRule, condition: e.target.value as any })}
                                            className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                                        >
                                            <option value="contains_keyword">Message contains keyword</option>
                                            <option value="is_vip">Customer is VIP</option>
                                            <option value="is_new">Customer is New</option>
                                        </select>
                                        {newRule.condition === 'contains_keyword' && (
                                            <input
                                                value={newRule.value}
                                                onChange={e => setNewRule({ ...newRule, value: e.target.value })}
                                                placeholder="e.g. refund"
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="text-slate-500 font-bold">THEN</div>

                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Perform Action</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newRule.action}
                                            onChange={e => setNewRule({ ...newRule, action: e.target.value as any })}
                                            className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                                        >
                                            <option value="assign_agent">Assign to Agent</option>
                                            <option value="add_tag">Add Tag</option>
                                            <option value="set_priority">Set Priority</option>
                                        </select>
                                        {newRule.action === 'assign_agent' ? (
                                            <select
                                                value={newRule.target}
                                                onChange={e => setNewRule({ ...newRule, target: e.target.value })}
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                                            >
                                                <option value="">Select Agent...</option>
                                                {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                value={newRule.target}
                                                onChange={e => setNewRule({ ...newRule, target: e.target.value })}
                                                placeholder={newRule.action === 'add_tag' ? "e.g. Urgent" : "high/low"}
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm outline-none"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsAddingRule(false)} className="text-slate-400 hover:text-white text-sm px-3">Cancel</button>
                                <button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold text-sm">Save Rule</button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {rules.map(rule => (
                            <div key={rule.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-center justify-between group hover:border-purple-500/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-800 p-2 rounded text-purple-400 font-mono text-xs border border-slate-600">
                                        IF {rule.condition.replace('_', ' ')} {rule.condition === 'contains_keyword' && <span className="text-white font-bold">"{rule.value}"</span>}
                                    </div>
                                    <span className="text-slate-500 text-xs font-bold">→</span>
                                    <div className="bg-slate-800 p-2 rounded text-green-400 font-mono text-xs border border-slate-600">
                                        {rule.action.replace('_', ' ')}: <span className="text-white font-bold">{rule.action === 'assign_agent' ? MOCK_TEAM.find(m => m.id === rule.target)?.name || rule.target : rule.target}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteRule(rule.id)} className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icons.Trash />
                                </button>
                            </div>
                        ))}
                        {rules.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <div className="text-4xl mb-2 opacity-20">🔀</div>
                                <p>No routing rules defined.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Automations;
