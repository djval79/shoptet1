import React, { useState } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { Icons } from '../constants';
import { processPayout, initializePaystackTransaction, initializeFlutterwavePayment } from '../services/paymentService';

interface FinanceProps {
    business: BusinessProfile;
    transactions: Transaction[];
    onUpdateTransactions: (transactions: Transaction[]) => void;
}

const Finance: React.FC<FinanceProps> = ({ business, transactions, onUpdateTransactions }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayout = async () => {
        if (confirm('Are you sure you want to initiate a payout for the available balance?')) {
            setIsProcessing(true);
            try {
                const result = await processPayout(business.revenue, 'bank_transfer', { account: '1234567890' });
                if (result.success) {
                    alert(result.message);
                    // Add payout transaction
                    const newTx: Transaction = {
                        id: result.transactionId || 'new_tx',
                        type: 'payout',
                        amount: business.revenue,
                        status: 'pending',
                        date: Date.now(),
                        description: 'Manual Payout Request'
                    };
                    onUpdateTransactions([newTx, ...transactions]);
                } else {
                    alert('Payout failed: ' + result.message);
                }
            } catch (e) {
                alert('An error occurred processing the payout.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleAddFunds = async () => {
        const amountStr = prompt("Enter amount to add:");
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return;

        setIsProcessing(true);
        try {
            // Default to Paystack for demo, or choose based on config
            const result = await initializePaystackTransaction('demo@example.com', amount, business);
            if (result.success) {
                alert(`${result.message}\nRedirecting to: ${result.paymentUrl}`);
                // Simulate completion
                const newTx: Transaction = {
                    id: result.transactionId || 'new_tx',
                    type: 'payment',
                    amount: amount,
                    status: 'completed',
                    date: Date.now(),
                    description: 'Wallet Top-up'
                };
                onUpdateTransactions([newTx, ...transactions]);
            } else {
                alert('Top-up failed: ' + result.message);
            }
        } catch (e) {
            alert('An error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-full flex flex-col pb-6">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white">Finance & Payouts</h2>
                    <p className="text-slate-400">Manage your revenue, payouts, and transaction history.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center transition-colors">
                        <Icons.Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                    <button
                        onClick={handleAddFunds}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : '+ Add Funds'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                {/* Card 1: Available Balance */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">💰</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Available for Payout</p>
                    <h3 className="text-3xl font-bold text-white mb-4">{business.currencySymbol || '$'}{business.revenue.toLocaleString()}</h3>
                    <button
                        onClick={handlePayout}
                        disabled={business.revenue <= 0 || isProcessing}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Withdraw Funds'}
                    </button>
                </div>

                {/* Card 2: Pending */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <p className="text-slate-400 text-sm font-medium mb-1">Pending Clearance</p>
                    <h3 className="text-3xl font-bold text-white mb-4">{business.currencySymbol || '$'}1,240.00</h3>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500">Estimated arrival: tomorrow</p>
                </div>

                {/* Card 3: Total Revenue */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue (All Time)</p>
                    <h3 className="text-3xl font-bold text-white mb-4">{business.currencySymbol || '$'}45,231.89</h3>
                    <div className="flex items-center text-green-400 text-sm font-bold">
                        <span className="mr-1">↑ 12%</span>
                        <span className="text-slate-500 font-normal">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col min-h-0">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">Recent Transactions</h3>
                    <div className="flex gap-2">
                        <input
                            placeholder="Search transactions..."
                            className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                                <th className="p-4 font-medium">Transaction ID</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium text-right">Amount</th>
                                <th className="p-4 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 text-sm">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 text-slate-300 font-mono text-xs">{tx.id}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize
                                            ${tx.type === 'payment' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                                                tx.type === 'payout' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                                                    'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-white font-medium">{tx.description}</td>
                                    <td className={`p-4 text-right font-mono font-bold ${tx.type === 'payout' || tx.type === 'fee' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'payout' || tx.type === 'fee' ? '-' : '+'}{business.currencySymbol || '$'}{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Finance;
