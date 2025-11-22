
import React, { useState } from 'react';
import { BusinessProfile, Template, TemplateButton } from '../types';
import { MOCK_TEMPLATES, Icons } from '../constants';
import { generateTemplate } from '../services/geminiService';

interface TemplatesProps {
    business: BusinessProfile;
}

const Templates: React.FC<TemplatesProps> = ({ business }) => {
    const [templates, setTemplates] = useState<Template[]>(business.templates || MOCK_TEMPLATES);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [tName, setTName] = useState('');
    const [tCategory, setTCategory] = useState<Template['category']>('MARKETING');
    const [tBody, setTBody] = useState('');
    const [tFooter, setTFooter] = useState('');
    const [tHeaderType, setTHeaderType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'NONE'>('NONE');
    const [tHeaderText, setTHeaderText] = useState('');
    const [tButtons, setTButtons] = useState<TemplateButton[]>([]);

    // AI
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        try {
            const result = await generateTemplate(business, aiTopic, tCategory);
            setTBody(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const addButton = (type: TemplateButton['type']) => {
        if (tButtons.length >= 3) return;
        setTButtons([...tButtons, { type, text: type === 'QUICK_REPLY' ? 'Yes' : 'Visit Website', value: '' }]);
    };

    const updateButton = (index: number, field: keyof TemplateButton, value: string) => {
        const newBtns = [...tButtons];
        newBtns[index] = { ...newBtns[index], [field]: value };
        setTButtons(newBtns);
    };

    const removeButton = (index: number) => {
        setTButtons(tButtons.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!tName || !tBody) return;
        const newTemplate: Template = {
            id: `tmp_${Date.now()}`,
            name: tName.toLowerCase().replace(/\s+/g, '_'),
            category: tCategory,
            language: business.language || 'en_US',
            body: tBody,
            footer: tFooter,
            header: tHeaderType !== 'NONE' ? { type: tHeaderType as any, content: tHeaderText } : undefined,
            buttons: tButtons.length > 0 ? tButtons : undefined,
            status: 'pending',
            createdAt: Date.now()
        };
        const updated = [newTemplate, ...templates];
        setTemplates(updated);
        business.templates = updated; // Update ref
        setIsCreating(false);

        // Reset
        setTName('');
        setTBody('');
        setTFooter('');
        setTHeaderType('NONE');
        setTButtons([]);
        setAiTopic('');

        // Simulate Approval
        setTimeout(() => {
            setTemplates(prev => prev.map(t =>
                t.id === newTemplate.id ? { ...t, status: Math.random() > 0.1 ? 'approved' : 'rejected' } : t
            ));
        }, 4000);
    };

    const renderPreview = (text: string) => {
        return text
            .replace(/{{1}}/g, 'John')
            .replace(/{{2}}/g, 'Order #123')
            .replace(/{{3}}/g, '20%');
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Message Templates</h2>
                    <p className="text-slate-400">Create rich media templates for marketing and support.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
                    >
                        <span className="mr-2"><Icons.Plus /></span> New Template
                    </button>
                )}
            </div>

            {isCreating ? (
                <div className="flex gap-6 flex-1 overflow-hidden pb-4">
                    {/* Editor */}
                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Template Editor</h3>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">Cancel</button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Template Name</label>
                                    <input
                                        value={tName}
                                        onChange={e => setTName(e.target.value)}
                                        placeholder="e.g. summer_sale_2025"
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Category</label>
                                    <select
                                        value={tCategory}
                                        onChange={e => setTCategory(e.target.value as any)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility</option>
                                        <option value="AUTHENTICATION">Authentication</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                                <label className="block text-slate-400 text-sm mb-2">Header (Optional)</label>
                                <div className="flex space-x-2 mb-3">
                                    {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setTHeaderType(h as any)}
                                            className={`text-[10px] px-3 py-1.5 rounded font-bold transition-all ${tHeaderType === h ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                                {tHeaderType === 'TEXT' && (
                                    <input
                                        value={tHeaderText}
                                        onChange={e => setTHeaderText(e.target.value)}
                                        placeholder="Header Text (e.g. Welcome)"
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                    />
                                )}
                                {tHeaderType !== 'NONE' && tHeaderType !== 'TEXT' && (
                                    <div className="w-full h-32 bg-slate-800 border border-dashed border-slate-600 rounded flex items-center justify-center text-slate-500 text-xs">
                                        Media will be uploaded when sending.
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-slate-400 text-sm">Body Text</label>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!aiTopic && !tBody}
                                        className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center"
                                    >
                                        {isGenerating ? '...' : '✨ AI Writer'}
                                    </button>
                                </div>
                                <textarea
                                    value={tBody}
                                    onChange={e => setTBody(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 min-h-[120px] font-mono text-sm"
                                    placeholder="Hi {{1}}, check out our new collection!"
                                />
                                <input
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="AI Prompt: e.g. 'Flash sale for loyal customers'"
                                    className="w-full mt-2 bg-slate-900/50 border border-slate-700 rounded p-2 text-slate-400 text-xs outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Footer (Optional)</label>
                                <input
                                    value={tFooter}
                                    onChange={e => setTFooter(e.target.value)}
                                    placeholder="e.g. Reply STOP to unsubscribe"
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-sm"
                                />
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-slate-400 text-sm">Buttons (Optional)</label>
                                    <div className="flex space-x-2">
                                        <button onClick={() => addButton('QUICK_REPLY')} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">+ Quick Reply</button>
                                        <button onClick={() => addButton('URL')} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">+ URL</button>
                                        <button onClick={() => addButton('PHONE_NUMBER')} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">+ Phone</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {tButtons.map((btn, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-slate-800 p-2 rounded">
                                            <span className="text-[10px] text-slate-500 uppercase w-20">{btn.type.replace('_', ' ')}</span>
                                            <input
                                                value={btn.text}
                                                onChange={e => updateButton(i, 'text', e.target.value)}
                                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none"
                                                placeholder="Button Text"
                                            />
                                            {btn.type !== 'QUICK_REPLY' && (
                                                <input
                                                    value={btn.value}
                                                    onChange={e => updateButton(i, 'value', e.target.value)}
                                                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none"
                                                    placeholder={btn.type === 'URL' ? 'https://...' : '+1...'}
                                                />
                                            )}
                                            <button onClick={() => removeButton(i)} className="text-slate-500 hover:text-red-400">✕</button>
                                        </div>
                                    ))}
                                    {tButtons.length === 0 && <div className="text-slate-500 text-xs italic text-center py-2">No buttons added</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={!tName || !tBody}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg"
                            >
                                Submit for Approval
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="w-[320px] bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl p-4 relative flex flex-col">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                        <div className="flex-1 bg-[#efeae2] rounded-[32px] overflow-hidden relative flex flex-col">
                            <div className="bg-[#075e54] h-16 flex items-end pb-2 px-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                                    <div className="text-white text-sm font-bold">{business.name}</div>
                                </div>
                            </div>
                            <div className="flex-1 p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain">
                                <div className="bg-white rounded-lg shadow-sm max-w-[90%] rounded-tl-none overflow-hidden">
                                    {/* Header */}
                                    {tHeaderType === 'IMAGE' && <div className="h-32 bg-slate-300 flex items-center justify-center text-slate-500"><Icons.Image /></div>}
                                    {tHeaderType === 'VIDEO' && <div className="h-32 bg-slate-300 flex items-center justify-center text-slate-500"><Icons.Play /></div>}
                                    {tHeaderType === 'DOCUMENT' && <div className="h-16 bg-slate-100 flex items-center justify-center text-slate-500 border-b border-slate-200"><Icons.FileText /> DOCUMENT.PDF</div>}
                                    {tHeaderType === 'TEXT' && <div className="px-3 pt-2 font-bold text-black text-sm">{tHeaderText}</div>}

                                    {/* Body */}
                                    <div className="p-2 px-3 text-sm text-black leading-relaxed">
                                        {tBody ? renderPreview(tBody) : <span className="text-gray-400 italic">Preview...</span>}
                                    </div>

                                    {/* Footer */}
                                    {tFooter && <div className="px-3 pb-2 text-[10px] text-gray-500">{tFooter}</div>}

                                    {/* Buttons */}
                                    {tButtons.length > 0 && (
                                        <div className="border-t border-slate-100">
                                            {tButtons.map((btn, i) => (
                                                <div key={i} className="py-2.5 text-center text-[#00a884] font-bold text-sm border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 flex items-center justify-center">
                                                    {btn.type === 'URL' && <span className="mr-1">↗</span>}
                                                    {btn.type === 'PHONE_NUMBER' && <span className="mr-1">📞</span>}
                                                    {btn.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-500 text-left mt-1 ml-2">12:00 PM</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
                    {templates.map(t => (
                        <div key={t.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-mono text-white font-bold text-sm truncate pr-2" title={t.name}>{t.name}</h4>
                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${t.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        t.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {t.status}
                                </span>
                            </div>

                            <div className="flex space-x-2 mb-4">
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{t.category}</span>
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{t.language}</span>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-slate-300 text-xs mb-4 relative">
                                {t.header && <div className="mb-2 pb-2 border-b border-slate-700/50 font-bold text-slate-400 text-[10px] uppercase">Header: {t.header.type}</div>}
                                <p className="line-clamp-3 font-mono">{t.body}</p>
                                {t.footer && <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500">{t.footer}</div>}
                            </div>

                            {t.buttons && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {t.buttons.map((b, i) => (
                                        <span key={i} className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-500/20 flex items-center">
                                            {b.type === 'URL' ? '🔗' : b.type === 'PHONE_NUMBER' ? '📞' : '↩'} {b.text}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                                <span className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                                <button className="text-slate-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icons.Trash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Templates;
