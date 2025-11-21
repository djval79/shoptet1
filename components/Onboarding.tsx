
import React, { useState } from 'react';
import { BusinessProfile, Product } from '../types';
import { generateOnboardingDetails } from '../services/geminiService';
import { Icons, MOCK_SENDERS } from '../constants';

interface OnboardingProps {
  onComplete: (business: BusinessProfile) => void;
  onCancel: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [desc, setDesc] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [policies, setPolicies] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [strategy, setStrategy] = useState<'aggressive' | 'consultative' | 'friendly'>('friendly');
  const [products, setProducts] = useState<Product[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Localization
  const [language, setLanguage] = useState('English');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Twilio Credentials
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  
  // Temp product inputs
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImg, setPImg] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pNegotiable, setPNegotiable] = useState(false);
  const [pMinPrice, setPMinPrice] = useState('');

  const handleAiGenerate = async () => {
    if (!name || !industry) return;
    setIsGenerating(true);
    try {
        const data = await generateOnboardingDetails(name, industry);
        if (data.description) setDesc(data.description);
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.policies) setPolicies(data.policies);
        if (data.knowledgeBase) setKnowledgeBase(data.knowledgeBase);
        if (data.products) {
            const newProducts = data.products.map((p: any) => ({
                ...p,
                id: `prod_${Date.now()}_${Math.random()}`,
                image: `https://source.unsplash.com/400x300/?${encodeURIComponent(p.name)}`,
                inStock: true,
                negotiable: false,
                isService: false,
                category: p.category || 'General'
            }));
            setProducts(newProducts);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAddProduct = () => {
      if (!pName || !pPrice) return;
      const newProduct: Product = {
          id: `prod_${Date.now()}`,
          name: pName,
          price: parseFloat(pPrice),
          description: pDesc,
          image: pImg || `https://source.unsplash.com/400x300/?${encodeURIComponent(pName)}`,
          inStock: true,
          negotiable: pNegotiable,
          minPrice: pNegotiable ? parseFloat(pMinPrice) : undefined,
          category: pCategory || 'General'
      };
      setProducts([...products, newProduct]);
      setPName('');
      setPPrice('');
      setPDesc('');
      setPImg('');
      setPCategory('');
      setPNegotiable(false);
      setPMinPrice('');
  };

  const handleSubmit = () => {
      const newBusinessId = `biz_${Date.now()}`;
      const newBusiness: BusinessProfile = {
          id: newBusinessId,
          name,
          industry,
          description: desc,
          welcomeMessage,
          products,
          salesStrategy: strategy,
          policies,
          knowledgeBase,
          twilioNumber: '+14155238886', // Official Twilio Sandbox Number
          twilioAccountSid: twilioSid,
          twilioAuthToken: twilioToken,
          language,
          currencySymbol,
          businessHours: { enabled: true, timezone: 'UTC', opensAt: '09:00', closesAt: '17:00', closedDays: [] },
          deliveryRadius: 10,
          lowDataMode: false,
          smsFallbackEnabled: false,
          revenue: 0,
          activeChats: 0,
          integrations: { stripe: false, shopify: false, slack: false, hubspot: false, salesforce: false, googleSheets: false },
          templates: [
             { id: 'tpl_default_1', name: 'session_reopen', category: 'UTILITY', language: 'en_US', body: 'Hi {{1}}, are you still interested in {{2}}? Reply YES to continue.', status: 'approved', createdAt: Date.now() }
          ],
          promotions: [],
          trainingExamples: [],
          flows: [],
          landingPage: { enabled: false, title: name, bio: '', theme: 'brand', featuredProductIds: [], socialLinks: [], views: 0, clicks: 0 },
          senders: [MOCK_SENDERS[0]], 
          metaVerificationStatus: 'unverified',
          iceBreakers: ['What are your opening hours?', 'Show me the menu', 'Do you offer delivery?', 'Speak to an agent'],
          widgetSettings: {
              enabled: true,
              color: '#25D366',
              position: 'right',
              ctaText: 'Chat with us',
              greeting: `Hi there! 👋 Welcome to ${name}. How can I help you?`,
              icon: 'whatsapp',
              delay: 2
          },
          sandboxConfig: {
              incomingUrl: `https://api.twilioflow.ai/v1/webhooks/whatsapp/${newBusinessId}/incoming`,
              statusCallbackUrl: `https://api.twilioflow.ai/v1/callbacks/status/${newBusinessId}`,
              fallbackUrl: ''
          },
          aiConfig: {
              model: 'gemini-2.5-flash',
              temperature: 0.7,
              customPrompt: `You are a helpful AI sales agent for {{business_name}}.
Industry: {{industry}}.
Description: {{description}}.
Policies: {{policies}}.
Knowledge Base: {{knowledge_base}}.

Reply to the user naturally. 
IMPORTANT: If a product has variants, ask the user to specify.
If the order is finalized, include [ORDER_CONFIRMED] in your response.
If they ask for a human, include [CALL_HANDOVER].
Keep responses short and suitable for WhatsApp.`,
              enabledTools: {
                  fileSearch: true,
                  codeInterpreter: false
              }
          }
      };
      onComplete(newBusiness);
  };

  return (
    <div className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="p-8 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-white">Setup New Business</h2>
              <p className="text-slate-400 mt-1">Configure your AI Sales Agent in 4 steps.</p>
          </div>
          <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
              ))}
          </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {step === 1 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8">
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Business Name</label>
                      <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-lg outline-none focus:border-blue-500"
                        placeholder="e.g. CyberPunk Coffee"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Industry</label>
                      <input 
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-lg outline-none focus:border-blue-500"
                        placeholder="e.g. Retail, Food & Beverage"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                       <div>
                           <label className="block text-slate-300 text-sm font-bold mb-2">Language</label>
                           <select 
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500"
                           >
                               <option value="English">English</option>
                               <option value="Spanish">Spanish</option>
                               <option value="Portuguese">Portuguese</option>
                               <option value="French">French</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-slate-300 text-sm font-bold mb-2">Currency</label>
                           <select 
                                value={currencySymbol}
                                onChange={e => setCurrencySymbol(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500"
                           >
                               <option value="$">$ (USD)</option>
                               <option value="€">€ (EUR)</option>
                               <option value="£">£ (GBP)</option>
                               <option value="R$">R$ (BRL)</option>
                           </select>
                       </div>
                  </div>
                  
                  <div className="pt-4">
                      <button 
                        onClick={handleAiGenerate}
                        disabled={!name || !industry || isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-lg font-bold shadow-lg flex justify-center items-center disabled:opacity-50 transition-all"
                      >
                          {isGenerating ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                Generating Profile...
                              </>
                          ) : (
                              <>
                                <span className="mr-2 text-xl">✨</span> Auto-Fill Details with AI
                              </>
                          )}
                      </button>
                  </div>
              </div>
          )}

          {step === 2 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8">
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Business Description</label>
                      <textarea 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500 h-24"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Welcome Message</label>
                      <textarea 
                        value={welcomeMessage}
                        onChange={e => setWelcomeMessage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500 h-24"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Sales Strategy</label>
                      <div className="grid grid-cols-3 gap-4">
                          {['friendly', 'consultative', 'aggressive'].map(s => (
                              <button
                                key={s}
                                onClick={() => setStrategy(s as any)}
                                className={`py-3 rounded-lg border capitalize font-medium transition-colors ${strategy === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                              >
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-slate-300 text-sm font-bold mb-2">Store Policies</label>
                      <textarea 
                        value={policies}
                        onChange={e => setPolicies(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500 h-24"
                        placeholder="e.g. No refunds after 30 days"
                      />
                  </div>
              </div>
          )}

          {step === 3 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8">
                  <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl">
                      <h3 className="text-blue-300 font-bold mb-2 flex items-center"><Icons.Settings /> <span className="ml-2">Twilio Configuration</span></h3>
                      <p className="text-blue-200/70 text-sm mb-6">
                          Enter your Twilio API credentials to connect to the WhatsApp Business API.
                          For testing, we will use the <strong>Generic Sandbox</strong>.
                      </p>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Account SID</label>
                              <input 
                                value={twilioSid}
                                onChange={e => setTwilioSid(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white font-mono text-sm"
                                placeholder="AC..."
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Auth Token</label>
                              <input 
                                type="password"
                                value={twilioToken}
                                onChange={e => setTwilioToken(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white font-mono text-sm"
                                placeholder="32 character token"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Sandbox Number</label>
                              <input 
                                disabled
                                value="+1 415 523 8886"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-500 font-mono text-sm cursor-not-allowed"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {step === 4 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-8">
                  <h3 className="text-xl font-bold text-white mb-4">Initial Product Catalog</h3>
                  
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <input 
                             value={pName}
                             onChange={e => setPName(e.target.value)}
                             placeholder="Product Name"
                             className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                          />
                          <input 
                             value={pPrice}
                             onChange={e => setPPrice(e.target.value)}
                             placeholder="Price"
                             type="number"
                             className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                          />
                      </div>
                      <button onClick={handleAddProduct} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-sm">
                          + Add Product
                      </button>
                  </div>

                  <div className="space-y-2">
                      {products.map(p => (
                          <div key={p.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                              <div className="flex items-center">
                                  <div className="w-10 h-10 bg-slate-700 rounded mr-3 overflow-hidden">
                                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <div className="text-white font-bold text-sm">{p.name}</div>
                                      <div className="text-slate-400 text-xs">{currencySymbol}{p.price}</div>
                                  </div>
                              </div>
                              <button onClick={() => setProducts(products.filter(pr => pr.id !== p.id))} className="text-red-400 hover:text-white">
                                  <Icons.Trash />
                              </button>
                          </div>
                      ))}
                      {products.length === 0 && <p className="text-slate-500 text-center text-sm">No products added yet.</p>}
                  </div>
              </div>
          )}

      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-900 border-t border-slate-700 flex justify-between">
          <button 
            onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
            className="px-6 py-3 text-slate-400 hover:text-white font-medium"
          >
              {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={step === 4 ? handleSubmit : () => setStep(s => s + 1)}
            disabled={step === 1 && (!name || !industry)}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
          >
              {step === 4 ? 'Launch Platform 🚀' : 'Continue'}
          </button>
      </div>
    </div>
  );
};

export default Onboarding;
