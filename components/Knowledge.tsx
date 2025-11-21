

import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile, KnowledgeDoc, FAQ } from '../types';
import { Icons } from '../constants';

interface KnowledgeProps {
  business: BusinessProfile;
  onUpdate: (updated: BusinessProfile) => void;
}

const Knowledge: React.FC<KnowledgeProps> = ({ business, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'faq'>('docs');
  const [isTraining, setIsTraining] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeLogs, setScrapeLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Doc Form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<KnowledgeDoc['type']>('text');
  const [docContent, setDocContent] = useState('');

  // FAQ Form
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [scrapeLogs]);

  const handleAddDoc = () => {
      if (!docName || !docContent) return;
      
      if (docType === 'url') {
          handleScrape(docContent);
          return;
      }

      // Simulate upload/training
      setIsTraining(true);
      let p = 0;
      const interval = setInterval(() => {
          p += 10;
          setUploadProgress(p);
          if (p >= 100) {
              clearInterval(interval);
              finishDocAdd();
          }
      }, 200);
  };

  const handleScrape = (url: string) => {
      setIsScraping(true);
      setScrapeLogs([`> Initializing crawler for ${url}...`]);
      
      const steps = [
          { msg: "> Connecting to host...", delay: 800 },
          { msg: "> HTTP 200 OK. Analyzing DOM structure...", delay: 1600 },
          { msg: `> Found 4 sub-pages: /about, /menu, /contact, /faq`, delay: 2400 },
          { msg: "> Extracting text content... [██████░░░░] 60%", delay: 3200 },
          { msg: "> Cleaning HTML tags and scripts...", delay: 4000 },
          { msg: "> Vectorizing content for AI memory...", delay: 5000 },
          { msg: "> Success! Content indexed.", delay: 6000 }
      ];

      steps.forEach(step => {
          setTimeout(() => {
              setScrapeLogs(prev => [...prev, step.msg]);
          }, step.delay);
      });

      setTimeout(() => {
          setIsScraping(false);
          // Simulate scraped content
          const simulatedContent = `Scraped content from ${url}:\n\nWelcome to ${business.name}. We specialize in ${business.industry}. \n\nOur Menu:\n- Special Item ($10)\n- Deluxe Combo ($15)\n\nContact us at support@${url.replace('https://', '').split('/')[0]}`;
          setDocContent(simulatedContent);
          finishDocAdd(simulatedContent);
      }, 6500);
  };

  const finishDocAdd = (finalContent?: string) => {
      const newDoc: KnowledgeDoc = {
          id: `doc_${Date.now()}`,
          name: docName,
          type: docType,
          content: finalContent || docContent,
          status: 'indexed',
          updatedAt: Date.now(),
          size: docType === 'text' ? `${Math.round((finalContent || docContent).length / 1024 * 10) / 10} KB` : '1.2 MB'
      };

      onUpdate({
          ...business,
          documents: [...(business.documents || []), newDoc]
      });

      // Reset
      setIsTraining(false);
      setUploadProgress(0);
      setDocName('');
      setDocContent('');
      setScrapeLogs([]);
  };

  const handleAddFaq = () => {
      if (!faqQ || !faqA) return;
      const newFaq: FAQ = {
          id: `faq_${Date.now()}`,
          question: faqQ,
          answer: faqA,
          active: true
      };
      onUpdate({
          ...business,
          faqs: [...(business.faqs || []), newFaq]
      });
      setFaqQ('');
      setFaqA('');
  };

  const deleteDoc = (id: string) => {
      onUpdate({
          ...business,
          documents: (business.documents || []).filter(d => d.id !== id)
      });
  };

  const deleteFaq = (id: string) => {
      onUpdate({
          ...business,
          faqs: (business.faqs || []).filter(f => f.id !== id)
      });
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Knowledge Hub</h2>
          <p className="text-slate-400">Train your AI agent with business documents and specific rules.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Data Sources
            </button>
            <button 
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'faq' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Q&A Overrides
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* Input Column */}
          <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col overflow-y-auto">
              {activeTab === 'docs' ? (
                  <>
                    <h3 className="text-lg font-bold text-white mb-4">Add New Source</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Source Name</label>
                            <input 
                                value={docName}
                                onChange={e => setDocName(e.target.value)}
                                placeholder="e.g. Official Website"
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Source Type</label>
                            <div className="flex space-x-2">
                                {['text', 'url', 'file'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setDocType(t as any)}
                                        className={`flex-1 py-2 rounded border text-sm capitalize ${docType === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {docType === 'url' ? (
                             <div>
                                 <label className="block text-slate-400 text-sm mb-2">Website Link</label>
                                 <input 
                                     value={docContent}
                                     onChange={e => setDocContent(e.target.value)}
                                     className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono text-sm"
                                     placeholder="https://cyberpunk.coffee"
                                 />
                                 {isScraping ? (
                                     <div className="mt-4 bg-black/50 rounded-lg p-3 font-mono text-[10px] text-green-400 h-32 overflow-y-auto border border-slate-700 shadow-inner">
                                         {scrapeLogs.map((log, i) => (
                                             <div key={i}>{log}</div>
                                         ))}
                                         <div ref={logsEndRef} />
                                     </div>
                                 ) : (
                                     <p className="text-xs text-slate-500 mt-2">
                                         The AI will crawl your site (up to 5 pages) to extract products, hours, and FAQs.
                                     </p>
                                 )}
                             </div>
                        ) : (
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">
                                    {docType === 'file' ? 'File Content (Simulated)' : 'Text Content'}
                                </label>
                                <textarea 
                                    value={docContent}
                                    onChange={e => setDocContent(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 font-mono text-sm h-48"
                                    placeholder={'Paste text here...'}
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleAddDoc}
                            disabled={isTraining || isScraping || !docName || !docContent}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all"
                        >
                            {isScraping ? 'Crawling Site...' : isTraining ? `Indexing... ${uploadProgress}%` : docType === 'url' ? 'Scrape & Train' : 'Upload & Train'}
                        </button>
                        {isTraining && (
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-200" style={{width: `${uploadProgress}%`}}></div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-xs text-blue-300">
                        <p className="font-bold mb-1">💡 Pro Tip:</p>
                        Documents uploaded here are embedded into the AI's vector memory. Use this for long policies, menus, or technical manuals.
                    </div>
                  </>
              ) : (
                  <>
                    <h3 className="text-lg font-bold text-white mb-4">Add FAQ Override</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Question Trigger</label>
                            <input 
                                value={faqQ}
                                onChange={e => setFaqQ(e.target.value)}
                                placeholder="e.g. What is the wifi password?"
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Exact Answer</label>
                            <textarea 
                                value={faqA}
                                onChange={e => setFaqA(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-32"
                                placeholder="The exact text the bot should reply with."
                            />
                        </div>
                        <button 
                            onClick={handleAddFaq}
                            disabled={!faqQ || !faqA}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all"
                        >
                            Save Rule
                        </button>
                    </div>
                     <div className="mt-6 bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg text-xs text-purple-300">
                        <p className="font-bold mb-1">⚡ Override Logic:</p>
                        FAQ matches take priority over AI generation. Use this for specific facts like addresses, codes, or prices that must not be hallucinated.
                    </div>
                  </>
              )}
          </div>

          {/* List Column */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      {activeTab === 'docs' ? 'Indexed Knowledge Base' : 'Active FAQ Rules'}
                  </h3>
                  <span className="text-slate-500 text-xs">
                      {activeTab === 'docs' ? (business.documents?.length || 0) : (business.faqs?.length || 0)} items
                  </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {activeTab === 'docs' ? (
                      (business.documents || []).map(doc => (
                          <div key={doc.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-start group hover:border-slate-600 transition-colors">
                              <div className="bg-slate-800 p-3 rounded text-slate-300 mr-4">
                                  {doc.type === 'text' && <Icons.FileText />}
                                  {doc.type === 'url' && <Icons.Share />}
                                  {doc.type === 'file' && <Icons.File />}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between">
                                      <h4 className="text-white font-medium">{doc.name}</h4>
                                      <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-500/30 uppercase">{doc.status}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.content}</p>
                                  <div className="flex items-center mt-2 text-[10px] text-slate-600 space-x-3">
                                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span>{doc.size || '1 KB'}</span>
                                      <span>•</span>
                                      <span className="uppercase">{doc.type}</span>
                                  </div>
                              </div>
                              <button onClick={() => deleteDoc(doc.id)} className="text-slate-500 hover:text-red-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Icons.Trash />
                              </button>
                          </div>
                      ))
                  ) : (
                      (business.faqs || []).map(faq => (
                          <div key={faq.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-start group hover:border-slate-600 transition-colors">
                               <div className="bg-purple-900/20 p-2 rounded-full text-purple-400 mr-4 text-xs font-bold mt-1">Q</div>
                               <div className="flex-1">
                                   <h4 className="text-white font-medium text-sm mb-1">{faq.question}</h4>
                                   <div className="bg-slate-800 p-2 rounded text-xs text-slate-300 font-mono">
                                       {faq.answer}
                                   </div>
                               </div>
                               <button onClick={() => deleteFaq(faq.id)} className="text-slate-500 hover:text-red-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Icons.Trash />
                              </button>
                          </div>
                      ))
                  )}

                  {((activeTab === 'docs' && (!business.documents || business.documents.length === 0)) || 
                    (activeTab === 'faq' && (!business.faqs || business.faqs.length === 0))) && (
                        <div className="text-center py-12 text-slate-500">
                            <div className="text-4xl mb-2 opacity-20">📭</div>
                            <p>No items found.</p>
                        </div>
                    )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Knowledge;
