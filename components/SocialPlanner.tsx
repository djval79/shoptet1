
import React, { useState } from 'react';
import { BusinessProfile, SocialPost, MediaAsset } from '../types';
import { Icons } from '../constants';
import { generateSocialCaption } from '../services/geminiService';

interface SocialPlannerProps {
  business: BusinessProfile;
}

const MOCK_POSTS: SocialPost[] = [
    {
        id: 'post_1',
        platform: 'instagram',
        content: 'Start your morning right with our new Neon Espresso! ☕✨ #coffee #morning #vibes',
        scheduledTime: Date.now() - 86400000,
        status: 'published',
        stats: { likes: 124, comments: 12, shares: 5 },
        mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'post_2',
        platform: 'facebook',
        content: 'Flash Sale! Get 20% off all pastries this weekend only.',
        scheduledTime: Date.now() + 86400000,
        status: 'scheduled',
        mediaUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80'
    }
];

const SocialPlanner: React.FC<SocialPlannerProps> = ({ business }) => {
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [isCreating, setIsCreating] = useState(false);
  
  // Editor State
  const [platform, setPlatform] = useState<SocialPost['platform']>('instagram');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  
  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
      if (!aiTopic) return;
      setIsGenerating(true);
      try {
          const result = await generateSocialCaption(business, aiTopic, platform);
          setContent(`${result.caption}\n\n${result.hashtags.join(' ')}`);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSave = () => {
      if (!content) return;
      
      const newPost: SocialPost = {
          id: `post_${Date.now()}`,
          platform,
          content,
          mediaUrl,
          scheduledTime: scheduleDate ? new Date(scheduleDate).getTime() : Date.now(),
          status: scheduleDate ? 'scheduled' : 'draft',
          stats: { likes: 0, comments: 0, shares: 0 }
      };
      
      setPosts([newPost, ...posts]);
      setIsCreating(false);
      setContent('');
      setMediaUrl('');
      setScheduleDate('');
      setAiTopic('');
  };

  const getPlatformIcon = (p: string) => {
      switch(p) {
          case 'instagram': return <span className="text-pink-500">📸</span>;
          case 'facebook': return <span className="text-blue-600">📘</span>;
          case 'twitter': return <span className="text-blue-400">🐦</span>;
          case 'linkedin': return <span className="text-blue-700">💼</span>;
          case 'tiktok': return <span className="text-black bg-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">🎵</span>;
          default: return <span>🌐</span>;
      }
  };

  const getPlatformColor = (p: string) => {
       switch(p) {
          case 'instagram': return 'bg-pink-500';
          case 'facebook': return 'bg-blue-600';
          case 'twitter': return 'bg-blue-400';
          case 'linkedin': return 'bg-blue-700';
          case 'tiktok': return 'bg-black';
          default: return 'bg-slate-500';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Social Media Planner</h2>
          <p className="text-slate-400">Schedule organic content across all your channels.</p>
        </div>
        {!isCreating && (
            <div className="flex space-x-3">
                <div className="bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button 
                        onClick={() => setView('list')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        List
                    </button>
                    <button 
                        onClick={() => setView('calendar')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Calendar
                    </button>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
                >
                    <span className="mr-2"><Icons.Plus /></span> New Post
                </button>
            </div>
        )}
      </div>

      {isCreating ? (
          <div className="flex flex-1 gap-8 overflow-hidden">
              {/* Editor */}
              <div className="w-1/2 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">Compose Post</h3>
                      <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">Cancel</button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Platform</label>
                          <div className="flex gap-2">
                              {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map(p => (
                                  <button 
                                    key={p}
                                    onClick={() => setPlatform(p as any)}
                                    className={`flex-1 py-2 rounded border text-xs font-bold capitalize ${platform === p ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                  >
                                      {p}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                          <label className="block text-slate-400 text-sm font-bold mb-2">AI Caption Writer</label>
                          <div className="flex gap-2">
                              <input 
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                placeholder="e.g. New summer menu launch"
                                className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                              />
                              <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !aiTopic}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold text-xs disabled:opacity-50"
                              >
                                  {isGenerating ? '...' : '✨ Magic Write'}
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Caption</label>
                          <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-32 text-sm"
                            placeholder="Write your caption here..."
                          />
                          <div className="text-right text-xs text-slate-500 mt-1">{content.length} chars</div>
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Media URL</label>
                          <input 
                            value={mediaUrl}
                            onChange={e => setMediaUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-sm"
                            placeholder="https://..."
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Schedule (Optional)</label>
                          <input 
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-sm"
                          />
                      </div>

                      <div className="pt-4 border-t border-slate-700 flex justify-end">
                          <button 
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                          >
                              {scheduleDate ? 'Schedule Post' : 'Save Draft'}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Preview */}
              <div className="flex-1 bg-[#f0f2f5] rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                   <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase">Preview</div>
                   
                   <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-[380px] overflow-hidden">
                       <div className="p-3 flex items-center justify-between">
                           <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white text-xs ${getPlatformColor(platform)}`}>
                                    {business.name.charAt(0)}
                                </div>
                                <h4 className="font-bold text-sm text-gray-900">{business.name}</h4>
                           </div>
                           <span className="text-gray-400 text-lg">...</span>
                       </div>
                       
                       <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                           {mediaUrl ? (
                               <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
                           ) : (
                               <div className="text-gray-400"><Icons.Image /></div>
                           )}
                       </div>

                       <div className="p-3">
                           <div className="flex gap-4 mb-2 text-xl">
                               <span>❤️</span> <span>💬</span> <span>✈️</span>
                           </div>
                           <div className="text-sm text-gray-900">
                               <span className="font-bold mr-2">{business.name}</span>
                               <span className="whitespace-pre-line">{content || "Caption..."}</span>
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
              {view === 'list' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.map(post => (
                          <div key={post.id} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                              <div className="h-40 bg-black relative">
                                  {post.mediaUrl && <img src={post.mediaUrl} alt="" className="w-full h-full object-cover opacity-80" />}
                                  <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md text-lg">
                                      {getPlatformIcon(post.platform)}
                                  </div>
                                  <div className="absolute bottom-3 left-3">
                                       <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
                                           post.status === 'published' ? 'bg-green-500 text-white' : 
                                           post.status === 'scheduled' ? 'bg-blue-500 text-white' : 
                                           'bg-slate-500 text-white'
                                       }`}>
                                           {post.status}
                                       </span>
                                  </div>
                              </div>
                              <div className="p-4">
                                  <p className="text-slate-300 text-sm line-clamp-3 mb-4 h-16">{post.content}</p>
                                  
                                  {post.status === 'published' && post.stats && (
                                      <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                                          <span>❤️ {post.stats.likes}</span>
                                          <span>💬 {post.stats.comments}</span>
                                          <span>↗️ {post.stats.shares}</span>
                                      </div>
                                  )}
                                  {post.status === 'scheduled' && (
                                      <div className="text-xs text-blue-400 pt-4 border-t border-slate-800">
                                          Scheduled for {new Date(post.scheduledTime).toLocaleString()}
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12 text-slate-500">
                      <div className="text-4xl mb-4 opacity-30">📅</div>
                      <p>Calendar view coming soon.</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default SocialPlanner;
