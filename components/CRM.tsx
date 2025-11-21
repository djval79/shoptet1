
import React, { useState } from 'react';
import { Customer, Order, Ticket, Campaign } from '../types';
import { Icons } from '../constants';
import { analyzeLead } from '../services/geminiService';

interface CRMProps {
    customers: Customer[];
    orders?: Order[];
    tickets?: Ticket[];
    campaigns?: Campaign[];
    onUpdateCustomers: (customers: Customer[]) => void;
}

const CRM: React.FC<CRMProps> = ({ customers, orders = [], tickets = [], campaigns = [], onUpdateCustomers }) => {
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string>('all');

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Detail View
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);

    // New Customer Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newTags, setNewTags] = useState('');

    // Drag and Drop State
    const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);

    // Derived Data
    const allTags = Array.from(new Set(customers.flatMap(c => c.tags || [])));

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
        const matchesStatus = viewMode === 'board' ? true : (statusFilter === 'all' || c.status === statusFilter); // In board, we show all cols
        const matchesTag = tagFilter === 'all' || (c.tags && c.tags.includes(tagFilter));
        return matchesSearch && matchesStatus && matchesTag;
    });

    const handleAnalyze = async (customer: Customer) => {
        if (!customer.mockTranscript) return;

        setAnalyzingId(customer.id);
        try {
            const result = await analyzeLead(customer.mockTranscript);

            const updated = customers.map(c => {
                if (c.id === customer.id) {
                    return {
                        ...c,
                        leadScore: result.leadScore,
                        aiSummary: result.summary
                    };
                }
                return c;
            });
            onUpdateCustomers(updated);
        } catch (e) {
            console.error("Lead analysis failed", e);
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedIds.size} customers?`)) {
            onUpdateCustomers(customers.filter(c => !selectedIds.has(c.id)));
            setSelectedIds(new Set());
        }
    };

    const handleBulkTag = () => {
        const tag = prompt("Enter tag to add to selected customers:");
        if (tag) {
            const updated = customers.map(c => {
                if (selectedIds.has(c.id)) {
                    return { ...c, tags: [...(c.tags || []), tag] };
                }
                return c;
            });
            onUpdateCustomers(updated);
            setSelectedIds(new Set());
        }
    };

    const handleBulkMessage = () => {
        alert(`Simulated: Sending broadcast template to ${selectedIds.size} customers.`);
        setSelectedIds(new Set());
    };

    const handleExportCSV = () => {
        if (customers.length === 0) return;

        const headers = ['Name', 'Phone', 'Status', 'Opt-In', 'Spend', 'Store Credit', 'Lead Score', 'Tags', 'Summary', 'Source'];
        const rows = customers.map(c => [
            c.name,
            c.phone,
            c.status,
            c.optInStatus,
            c.totalSpend,
            c.storeCredit || 0,
            c.leadScore || '',
            (c.tags || []).join(';'),
            c.aiSummary || '',
            c.source || 'organic'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newPhone) return;

        const newCustomer: Customer = {
            id: `c_${Date.now()}`,
            name: newName,
            phone: newPhone,
            status: 'lead',
            totalSpend: 0,
            lastActive: Date.now(),
            history: [],
            aiPaused: false,
            optInStatus: 'pending',
            tags: newTags.split(',').map(t => t.trim()).filter(t => t),
            source: 'organic',
            storeCredit: 0
        };

        onUpdateCustomers([newCustomer, ...customers]);
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        setNewTags('');
    };

    const handleUpdateCredit = (amount: string) => {
        if (!selectedCustomer) return;
        const val = parseFloat(amount);
        if (isNaN(val)) return;
        const updated = { ...selectedCustomer, storeCredit: val };
        setSelectedCustomer(updated);
        onUpdateCustomers(customers.map(c => c.id === updated.id ? updated : c));
    };

    const handleDragStart = (e: React.DragEvent, customerId: string) => {
        setDraggedCustomerId(customerId);
        e.dataTransfer.effectAllowed = "move";
        // Minimal ghost image
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = "0.5";
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedCustomerId(null);
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = "1";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, status: Customer['status']) => {
        e.preventDefault();
        if (draggedCustomerId) {
            const updated = customers.map(c =>
                c.id === draggedCustomerId ? { ...c, status: status } : c
            );
            onUpdateCustomers(updated);
        }
        setDraggedCustomerId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'lead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'negotiating': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'churned': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-700 text-slate-300 border-slate-600';
        }
    };

    const getSourceIcon = (source?: string) => {
        switch (source) {
            case 'instagram_ad': return <span className="text-pink-400" title="Instagram Ad">📷</span>;
            case 'facebook_ad': return <span className="text-blue-400" title="Facebook Ad">📘</span>;
            case 'qr_code': return <span className="text-white" title="QR Code">🏁</span>;
            case 'referral': return <span className="text-green-400" title="Referral">🤝</span>;
            case 'website_widget': return <span className="text-purple-400" title="Web Widget">🌐</span>;
            default: return <span className="text-slate-500" title="Organic">🌱</span>;
        }
    };

    // Timeline Generation
    const getTimeline = (customer: Customer) => {
        const events: { type: 'order' | 'ticket' | 'chat' | 'campaign', data: any, timestamp: number }[] = [];

        // 1. Orders
        orders.filter(o => o.customerId === customer.id).forEach(o => {
            events.push({ type: 'order', data: o, timestamp: o.timestamp });
        });

        // 2. Tickets
        tickets.filter(t => t.customerId === customer.id).forEach(t => {
            events.push({ type: 'ticket', data: t, timestamp: t.createdAt });
        });

        // 3. Chat Sessions (Group nearby messages)
        if (customer.history.length > 0) {
            // For demo, just add the last message as a "Recent Chat" event if exists
            const lastMsg = customer.history[customer.history.length - 1];
            events.push({ type: 'chat', data: lastMsg, timestamp: lastMsg.timestamp });
        }

        return events.sort((a, b) => b.timestamp - a.timestamp);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">CRM & Sales Funnel</h2>
                    <p className="text-slate-400">Manage customer relationships and pipeline.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-slate-800 rounded-lg p-1 border border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="flex items-center"><span className="mr-2 text-xs"><Icons.List /></span> List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="flex items-center"><span className="mr-2 text-xs"><Icons.Grid /></span> Board</span>
                        </button>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center"
                    >
                        <span className="mr-2"><Icons.Download /></span> Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center"
                    >
                        <span className="mr-2"><Icons.Plus /></span> Add Contact
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex items-center space-x-4">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Icons.Search /></span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search name or phone..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                </div>
                {viewMode === 'list' && (
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="lead">Lead</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="closed">Closed</option>
                        <option value="churned">Churned</option>
                    </select>
                )}
                <select
                    value={tagFilter}
                    onChange={e => setTagFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500"
                >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && viewMode === 'list' && (
                <div className="absolute top-20 left-0 right-0 z-20 bg-blue-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-in slide-in-from-top-2">
                    <div className="flex items-center font-bold">
                        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs mr-3">{selectedIds.size}</span>
                        Customers Selected
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={handleBulkTag} className="bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded text-sm font-medium border border-blue-500">
                            + Add Tag
                        </button>
                        <button onClick={handleBulkMessage} className="bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded text-sm font-medium border border-blue-500">
                            <span className="mr-2">💬</span> Broadcast Template
                        </button>
                        <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-sm font-medium shadow-sm">
                            Delete
                        </button>
                        <button onClick={() => setSelectedIds(new Set())} className="text-blue-200 hover:text-white px-2 text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Add New Contact</h3>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-1">Full Name</label>
                                <input
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-1">Phone Number</label>
                                <input
                                    required
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
                                    placeholder="+1 555 123 4567"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-1">Tags (comma separated)</label>
                                <input
                                    value={newTags}
                                    onChange={e => setNewTags(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
                                    placeholder="VIP, 2024-Lead"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Save Contact</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-6 overflow-hidden">

                {viewMode === 'list' && (
                    <div className={`bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm flex flex-col transition-all duration-300 flex-1`}>
                        <div className="overflow-x-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#0f172a] text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 w-10 border-b border-slate-800">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-600 bg-slate-800 checked:bg-blue-600"
                                                checked={selectedIds.size > 0 && selectedIds.size === filteredCustomers.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 border-b border-slate-800">Customer</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Status</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Tags</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Source</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Total Spend</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Lead Score</th>
                                        <th className="px-6 py-4 text-right border-b border-slate-800">AI Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-sm">
                                    {filteredCustomers.map((c) => (
                                        <tr
                                            key={c.id}
                                            className={`group hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-blue-900/10' : ''}`}
                                            onClick={() => setSelectedCustomer(c)}
                                        >
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(c.id)}
                                                    onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                                                    className="rounded border-slate-600 bg-slate-800 checked:bg-blue-600"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mr-3 text-xs border border-slate-600">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{c.name}</div>
                                                        <div className="text-xs text-slate-500">{c.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${c.status === 'lead' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    c.status === 'negotiating' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        c.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            'bg-slate-700/50 text-slate-400 border border-slate-600'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(c.tags || []).slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {(c.tags || []).length > 2 && <span className="text-[10px] text-slate-500">+{c.tags!.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                                    {getSourceIcon(c.source)} <span className="capitalize">{c.source?.replace('_', ' ') || 'Organic'}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white font-mono text-xs">
                                                ${c.totalSpend.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.leadScore !== undefined ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-1.5 rounded-full ${c.leadScore > 70 ? 'bg-emerald-500' : c.leadScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${c.leadScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-slate-400 font-mono text-xs">{c.leadScore}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">--</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleAnalyze(c)}
                                                    disabled={!!analyzingId || !c.mockTranscript}
                                                    className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded transition-colors disabled:opacity-50"
                                                    title="Run AI Analysis"
                                                >
                                                    <Icons.Zap className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCustomers.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    No customers found matching filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'board' && (
                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
                        <div className="flex h-full gap-4 min-w-[1000px]">
                            {['lead', 'negotiating', 'closed', 'churned'].map(status => {
                                const columnCustomers = filteredCustomers.filter(c => c.status === status);
                                const columnValue = columnCustomers.reduce((sum, c) => sum + c.totalSpend, 0);

                                let colColor = 'bg-slate-700';
                                let colText = 'text-slate-300';
                                if (status === 'lead') { colColor = 'bg-blue-500'; colText = 'text-blue-400'; }
                                if (status === 'negotiating') { colColor = 'bg-yellow-500'; colText = 'text-yellow-400'; }
                                if (status === 'closed') { colColor = 'bg-green-500'; colText = 'text-green-400'; }
                                if (status === 'churned') { colColor = 'bg-red-500'; colText = 'text-red-400'; }

                                return (
                                    <div
                                        key={status}
                                        className="flex-1 flex flex-col bg-slate-900/30 rounded-xl border border-slate-700"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, status as Customer['status'])}
                                    >
                                        <div className={`p-4 border-b border-slate-700 rounded-t-xl bg-slate-800`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`font-bold uppercase text-xs tracking-wider ${colText}`}>{status}</h3>
                                                <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{columnCustomers.length}</span>
                                            </div>
                                            <p className="text-white font-mono text-sm font-bold">${columnValue.toLocaleString()}</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                            {columnCustomers.map(c => (
                                                <div
                                                    key={c.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, c.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => setSelectedCustomer(c)}
                                                    className={`bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all group ${selectedCustomer?.id === c.id ? 'ring-2 ring-blue-500' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-[10px] text-white font-bold mr-2">
                                                                {c.name.charAt(0)}
                                                            </div>
                                                            <span className="text-white text-sm font-medium truncate max-w-[120px]">{c.name}</span>
                                                        </div>
                                                        {c.leadScore && (
                                                            <span className={`text-[10px] font-bold ${c.leadScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                                {c.leadScore}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                        <span>${c.totalSpend.toLocaleString()}</span>
                                                        <span>{new Date(c.lastActive).toLocaleDateString()}</span>
                                                    </div>
                                                    {c.tags && c.tags.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {c.tags.slice(0, 2).map(t => (
                                                                <span key={t} className="text-[8px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center text-[9px] text-slate-400">
                                                        {getSourceIcon(c.source)} <span className="ml-1 capitalize">{c.source?.replace('_', ' ') || 'Organic'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Customer Detail Slide-Over */}
                {selectedCustomer && (
                    <div className="w-full md:w-1/2 lg:w-1/3 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right-4 overflow-hidden absolute right-0 top-0 bottom-0 z-30 h-full">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl text-white font-bold border-4 border-slate-800 shadow-lg">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                                    <p className="text-slate-400 text-sm">{selectedCustomer.phone}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(selectedCustomer.status)}`}>
                                            {selectedCustomer.status}
                                        </span>
                                        {selectedCustomer.optInStatus === 'opted_in' && <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-bold">Opted-In</span>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white"><Icons.X /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <p className="text-slate-400 text-xs uppercase font-bold">Lifetime Value</p>
                                    <p className="text-white text-xl font-mono font-bold mt-1">${selectedCustomer.totalSpend.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <p className="text-slate-400 text-xs uppercase font-bold">Lead Score</p>
                                    <p className={`text-xl font-mono font-bold mt-1 ${(selectedCustomer.leadScore || 0) > 70 ? 'text-green-400' : 'text-yellow-400'
                                        }`}>{selectedCustomer.leadScore || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Unified Timeline */}
                            <div>
                                <h4 className="text-white text-sm font-bold mb-4 flex items-center">
                                    <Icons.Activity /> <span className="ml-2">Activity Timeline</span>
                                </h4>
                                <div className="relative pl-4 border-l border-slate-700 space-y-6">
                                    {getTimeline(selectedCustomer).length === 0 && (
                                        <p className="text-xs text-slate-500 italic">No activity yet.</p>
                                    )}
                                    {getTimeline(selectedCustomer).map((event, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-800 ${event.type === 'order' ? 'bg-green-500' :
                                                event.type === 'ticket' ? 'bg-yellow-500' :
                                                    event.type === 'chat' ? 'bg-blue-500' : 'bg-purple-500'
                                                }`}></div>

                                            <div className="text-xs text-slate-400 mb-1">{new Date(event.timestamp).toLocaleString()}</div>

                                            {event.type === 'order' && (
                                                <div className="bg-slate-900/50 p-3 rounded border border-green-500/20">
                                                    <div className="flex justify-between text-green-400 font-bold text-sm mb-1">
                                                        <span>Order #{event.data.id.slice(-4)}</span>
                                                        <span>${event.data.total}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{event.data.items.length} items ({event.data.status})</p>
                                                </div>
                                            )}

                                            {event.type === 'ticket' && (
                                                <div className="bg-slate-900/50 p-3 rounded border border-yellow-500/20">
                                                    <div className="flex justify-between text-yellow-400 font-bold text-sm mb-1">
                                                        <span>Ticket #{event.data.id}</span>
                                                        <span className="uppercase text-[10px]">{event.data.status}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 italic">"{event.data.subject}"</p>
                                                </div>
                                            )}

                                            {event.type === 'chat' && (
                                                <div className="bg-slate-900/50 p-3 rounded border border-blue-500/20">
                                                    <p className="text-blue-400 font-bold text-xs mb-1">Recent Message</p>
                                                    <p className="text-xs text-slate-400 italic line-clamp-2">"{event.data.text || 'Media/Attachment'}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Store Credit Box */}
                            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/30">
                                <p className="text-green-400 text-xs uppercase font-bold mb-1">Store Credit Balance</p>
                                <div className="flex justify-between items-center">
                                    <input
                                        type="number"
                                        value={selectedCustomer.storeCredit || 0}
                                        onChange={(e) => handleUpdateCredit(e.target.value)}
                                        className="bg-transparent text-2xl font-bold text-white font-mono w-24 outline-none border-b border-dashed border-green-500/50 focus:border-green-400"
                                    />
                                    <span className="text-[10px] text-slate-400">Editable</span>
                                </div>
                                <p className="text-[10px] text-green-300/70 mt-1">AI will mention this balance to the user.</p>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                <p className="text-slate-400 text-xs uppercase font-bold">Acquisition Source</p>
                                <div className="flex items-center text-sm font-medium text-white capitalize">
                                    <span className="mr-2 text-lg">{getSourceIcon(selectedCustomer.source)}</span>
                                    {selectedCustomer.source?.replace('_', ' ') || 'Organic'}
                                </div>
                            </div>

                            {/* AI Summary */}
                            {selectedCustomer.aiSummary && (
                                <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <span className="text-xs font-bold text-purple-300 uppercase">AI Summary</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed italic">"{selectedCustomer.aiSummary}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CRM;
