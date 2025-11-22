
import React, { useState } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { Icons } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinanceProps {
    business: BusinessProfile;
    transactions: Transaction[];
    onUpdateTransactions: (transactions: Transaction[]) => void;
}

const Finance: React.FC<FinanceProps> = ({ business, transactions, onUpdateTransactions }) => {
    const [isPayoutLoading, setIsPayoutLoading] = useState(false);
    const currency = business.currencySymbol || '$';

    // Calculated Balances
    const availableBalance = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingBalance = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

    // Chart Data
    const data = [
        { name: 'Day 1', income: 400 },
        { name: 'Day 2', income: 300 },
        { name: 'Day 3', income: 550 },
        { name: 'Day 4', income: 450 },
        { name: 'Day 5', income: 700 },
        { name: 'Day 6', income: 600 },
        { name: 'Today', income: availableBalance > 0 ? availableBalance : 200 }
    ];

    const handlePayout = () => {
        if (availableBalance <= 0) return;
        setIsPayoutLoading(true);
        setTimeout(() => {
            const payout: Transaction = {
                id: `txn_po_${Date.now()}`,
                type: 'payout',
                amount: -availableBalance,
                status: 'completed',
                date: Date.now(),
                description: `Payout to Bank ****${Math.floor(Math.random() * 9000) + 1000}`
            };
            onUpdateTransactions([payout, ...transactions]);
            setIsPayoutLoading(false);
            alert(`Successfully transferred ${currency}${availableBalance.toFixed(2)} to your bank account.`);
        }, 2000);
    };

    const handleDownloadInvoice = (id: string) => {
        alert(`Downloading invoice for transaction ${id}... (Simulated)`);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}>
            {txn.status}
        </span>
                              </td >
    <td className="p-4 text-right">
        <button
            onClick={() => handleDownloadInvoice(txn.id)}
            className="text-slate-500 hover:text-blue-400 transition-colors p-1" title="Download Invoice"
        >
            <Icons.Download />
        </button>
    </td>
                          </tr >
                      ))}
                  </tbody >
              </table >
          </div >
      </div >
    </div >
  );
};

export default Finance;
