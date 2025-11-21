import React, { useState } from 'react';
import { BusinessProfile, Review } from '../types';
import { MOCK_REVIEWS, Icons } from '../constants';
import { generateReviewReply } from '../services/geminiService';

interface ReviewsProps {
  business: BusinessProfile;
}

const Reviews: React.FC<ReviewsProps> = ({ business }) => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  const handleGenerate = async (review: Review) => {
      setIsGenerating(true);
      try {
          const text = await generateReviewReply(review, business);
          setDraftReply(text);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSend = (id: string) => {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'replied' } : r));
      setReplyingTo(null);
      setDraftReply('');
  };

  const renderStars = (rating: number) => {
      return (
          <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className={i <= rating ? "text-yellow-400" : "text-slate-600"}>★</span>
              ))}
          </div>
      );
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Reputation Management</h2>
          <p className="text-slate-400">Track and respond to customer feedback.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Average Rating</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{avgRating}</h3>
              </div>
              <div className="text-yellow-400 text-4xl">★</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Total Reviews</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{reviews.length}</h3>
              </div>
              <div className="bg-slate-700 p-3 rounded-full text-slate-300"><Icons.MessageSquare /></div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Pending Replies</p>
                  <h3 className="text-3xl font-bold text-yellow-400 mt-1">{reviews.filter(r => r.status === 'pending').length}</h3>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300 underline">Request Reviews</button>
          </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="font-bold text-white">Recent Reviews</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {reviews.map(review => (
                  <div key={review.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 transition-all hover:border-slate-600">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                  {review.customerName.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="text-white font-bold">{review.customerName}</h4>
                                  <div className="flex items-center space-x-2">
                                      {renderStars(review.rating)}
                                      <span className="text-slate-500 text-xs">• {new Date(review.timestamp).toLocaleDateString()}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center space-x-2">
                               {review.status === 'pending' ? (
                                   <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-yellow-500/20">Pending Reply</span>
                               ) : (
                                   <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-500/20">Replied</span>
                               )}
                          </div>
                      </div>

                      <div className="mb-4">
                          <p className="text-slate-300 text-sm italic">"{review.text}"</p>
                          <div className="mt-2 inline-flex items-center bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">
                              <span className="mr-1">🛍️</span> Bought: <span className="text-slate-300 ml-1">{review.productName}</span>
                          </div>
                      </div>

                      {replyingTo === review.id ? (
                          <div className="bg-[#0b1120] p-4 rounded-lg border border-slate-700 animate-in fade-in">
                              <div className="flex justify-between mb-2">
                                  <span className="text-xs text-slate-400 font-bold uppercase">Drafting Reply...</span>
                                  <button onClick={() => setReplyingTo(null)} className="text-xs text-slate-500 hover:text-white">Cancel</button>
                              </div>
                              <textarea 
                                value={draftReply}
                                onChange={(e) => setDraftReply(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm outline-none focus:border-blue-500 h-24"
                                placeholder="Write your response..."
                              />
                              <div className="mt-3 flex justify-between items-center">
                                  <button 
                                    onClick={() => handleGenerate(review)}
                                    disabled={isGenerating}
                                    className="text-purple-400 hover:text-purple-300 text-xs font-bold flex items-center"
                                  >
                                      {isGenerating ? 'AI Writing...' : '✨ Auto-Generate'}
                                  </button>
                                  <button 
                                    onClick={() => handleSend(review.id)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold"
                                  >
                                      Send Reply
                                  </button>
                              </div>
                          </div>
                      ) : (
                          review.status === 'pending' && (
                              <button 
                                onClick={() => { setReplyingTo(review.id); setDraftReply(''); }}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                              >
                                  <Icons.MessageSquare /> <span className="ml-2">Reply to Customer</span>
                              </button>
                          )
                      )}
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Reviews;