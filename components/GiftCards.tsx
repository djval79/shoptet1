
import React, { useState } from 'react';
import { BusinessProfile, GiftCard } from '../types';
import { Icons } from '../constants';
import { generateGiftCardMessage } from '../services/geminiService';

interface GiftCardsProps {
  business: BusinessProfile;
}

// Mock Data
const MOCK_GIFT_CARDS: GiftCard[] = [
    {
        id: 'gc_1',
        code: 'GIFT-8821',
        initialBalance: 50,
        currentBalance: 25,
        recipientName: 'Alice Walker',
        senderName: 'Bob Builder',
        status: 'active',
        createdAt: Date.now() - 86400000 * 10,
        designUrl: 'https://ui-avatars.com/api/?name=Gift+Card&background=0D8ABC&color=fff'
    },
    {
        id: 'gc_2',
        code: 'GIFT-9900',
        initialBalance: 100,
        currentBalance: 100,
        recipientName: 'Charlie Day',
        senderName: 'Store Credit',
        status: 'active',
        createdAt: Date.now() - 86400000 * 2,
        designUrl: 'https://ui-avatars.com/api/?name=Store+Credit&background=10b981&color=fff'
    }
];

const GiftCards: React.FC<GiftCardsProps> = ({ business }) => {
  const [cards, setCards] = useState<GiftCard[]>(MOCK_GIFT_CARDS);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const currency = business.currencySymbol || '$';

  // Form State
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [senderName, setSenderName] = useState(business.name);
  const [message, setMessage] = useState('');
  const [design, setDesign] = useState('default');

  const activeValue = cards.filter(c => c.status === 'active').reduce((acc, c) => acc + c.currentBalance, 0);
  const issuedCount = cards.length;

  const handleGenerateMessage = async () => {
      if (!recipientName || !amount) return;
      setIsGenerating(true);
      try {
          const msg = await generateGiftCardMessage(senderName, recipientName, `${currency}${amount}`, business.name);
          setMessage(msg);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleIssue = () => {
      if (!amount) return;
      
      const newCard: GiftCard = {
          id: `gc_${Date.now()}`,
          code: `GIFT-${Math.floor(1000 + Math.random() * 9000)}`,
          initialBalance: Number(amount),
          currentBalance: Number(amount),
          recipientName,
          recipientPhone,
          senderName,
          status: 'active',
          createdAt: Date.now(),
          designUrl: design === 'default' ? `https://ui-avatars.com/api/?name=Gift+Card` : design
      };
      
      setCards([newCard, ...cards]);
      setIsCreating(false);
      
      // Reset
      setAmount('');
      setRecipientName('');
      setRecipientPhone('');
      setMessage('');
      setSenderName(business.name);
      
      alert(`Gift card ${newCard.code} issued and sent to ${newCard.recipientPhone || 'recipient'}!`);
  };

  const handleVoid = (id: string) => {
      if (confirm("Void this gift card? It will no longer be usable.")) {
          setCards(prev => prev.map(c => c.id === id ? { ...c, status: 'expired' } : c));
      }
  };

  const handleResend = (card: GiftCard) => {
      alert(`Resending Gift Card ${card.code} to ${card.recipientName} via WhatsApp...`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gift Cards & Store Credit</h2>
          <p className="text-slate-400">Issue digital cards and track liabilities.</p>
        </div>
        {!isCreating && (
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
            >
                <span className="mr-2"><Icons.Plus /></span> Issue Card
            </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Outstanding Liability</p>
              <h3 className="text-3xl font-bold text-white">{currency}{activeValue.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">Unredeemed value</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Issued</p>
              <h3 className="text-3xl font-bold text-blue-400">{issuedCount}</h3>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg. Value</p>
              <h3 className="text-3xl font-bold text-green-400">{currency}{(activeValue / (issuedCount || 1)).toFixed(0)}</h3>
          </div>
      </div>

      {isCreating ? (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-bold text-white">Issue Digital Card</h3>
                  <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">Cancel</button>
              </div>

              <div className="flex gap-12">
                  {/* Form */}
                  <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Amount ({currency})</label>
                              <input 
                                  type="number"
                                  value={amount}
                                  onChange={e => setAmount(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-lg font-bold"
                                  placeholder="50.00"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">From (Sender)</label>
                              <input 
                                  value={senderName}
                                  onChange={e => setSenderName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Recipient Name</label>
                              <input 
                                  value={recipientName}
                                  onChange={e => setRecipientName(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                  placeholder="John Doe"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">WhatsApp Number</label>
                              <input 
                                  value={recipientPhone}
                                  onChange={e => setRecipientPhone(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                  placeholder="+1..."
                              />
                          </div>
                      </div>

                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <label className="block text-slate-400 text-xs font-bold uppercase">Message</label>
                              <button 
                                onClick={handleGenerateMessage}
                                disabled={!amount || !recipientName || isGenerating}
                                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center disabled:opacity-50"
                              >
                                  {isGenerating ? 'Writing...' : '✨ AI Write'}
                              </button>
                          </div>
                          <textarea 
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-24 resize-none"
                              placeholder="Personal note included with the gift card..."
                          />
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                          <button 
                            onClick={handleIssue}
                            disabled={!amount || !recipientName}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-bold shadow-lg"
                          >
                              Issue & Send to WhatsApp
                          </button>
                      </div>
                  </div>

                  {/* Preview */}
                  <div className="w-80 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700 p-6">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-4">Card Preview</p>
                      <div className="w-full aspect-[1.6] rounded-xl overflow-hidden relative shadow-2xl transform hover:scale-105 transition-transform duration-500">
                          <div className={`absolute inset-0 bg-gradient-to-br ${amount && Number(amount) >= 100 ? 'from-yellow-600 to-yellow-800' : 'from-blue-600 to-purple-600'}`}></div>
                          
                          {/* Pattern Overlay */}
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                          
                          <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                              <div className="flex justify-between items-start">
                                  <span className="font-bold tracking-widest text-sm opacity-80">{business.name.toUpperCase()}</span>
                                  <span className="font-mono text-xs opacity-60">GIFT CARD</span>
                              </div>
                              <div className="text-center">
                                  <span className="text-4xl font-bold drop-shadow-md">{currency}{amount || '0'}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                  <div className="text-xs font-mono opacity-80">**** ****</div>
                                  <div className="text-[10px] opacity-60">Valid 12m</div>
                              </div>
                          </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-4 text-center italic">
                          Sent to: {recipientName || 'Recipient'}
                      </p>
                  </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-bold text-white">Active Cards</h3>
                  <div className="flex space-x-2">
                      <input 
                        placeholder="Search code..." 
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-xs text-white outline-none focus:border-blue-500"
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-sm">
                          <tr>
                              <th className="p-4">Code</th>
                              <th className="p-4">Recipient</th>
                              <th className="p-4">Balance</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4">Created</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {cards.map(card => (
                              <tr key={card.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-mono text-blue-400 font-bold text-xs">{card.code}</td>
                                  <td className="p-4">
                                      <div className="text-white font-medium">{card.recipientName || 'Unknown'}</div>
                                      <div className="text-xs text-slate-500">From: {card.senderName}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className="text-white font-bold">{currency}{card.currentBalance}</span>
                                      <span className="text-slate-500 text-xs ml-1">/ {currency}{card.initialBalance}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold border ${
                                          card.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                                          card.status === 'redeemed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
                                          'bg-red-500/20 text-red-400 border-red-500/20'
                                      }`}>
                                          {card.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-400 text-xs">
                                      {new Date(card.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex justify-end space-x-2">
                                          <button 
                                            onClick={() => handleResend(card)}
                                            className="text-slate-400 hover:text-blue-400 p-1" 
                                            title="Resend to WhatsApp"
                                          >
                                              <Icons.Send />
                                          </button>
                                          {card.status === 'active' && (
                                              <button 
                                                onClick={() => handleVoid(card.id)}
                                                className="text-slate-400 hover:text-red-400 p-1" 
                                                title="Void Card"
                                              >
                                                  <Icons.Trash />
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default GiftCards;
