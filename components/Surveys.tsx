
import React, { useState } from 'react';
import { BusinessProfile, Survey, SurveyResponse, SurveyQuestion } from '../types';
import { Icons } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SurveysProps {
  business: BusinessProfile;
}

const MOCK_SURVEYS: Survey[] = [
    {
        id: 'sur_1',
        title: 'Post-Purchase NPS',
        trigger: 'order_delivered',
        active: true,
        responseCount: 124,
        avgScore: 8.5,
        questions: [
            { id: 'q1', text: 'How likely are you to recommend us to a friend?', type: 'nps' },
            { id: 'q2', text: 'What did you like most?', type: 'text' }
        ]
    },
    {
        id: 'sur_2',
        title: 'Support Satisfaction',
        trigger: 'ticket_resolved',
        active: true,
        responseCount: 45,
        avgScore: 4.2,
        questions: [
            { id: 'q1', text: 'Rate your support experience', type: 'rating' }
        ]
    }
];

const MOCK_RESPONSES: SurveyResponse[] = [
    { id: 'res_1', surveyId: 'sur_1', customerId: 'c1', customerName: 'Alice Walker', answers: { 'q1': 10, 'q2': 'Great speed!' }, timestamp: Date.now() - 10000, score: 10 },
    { id: 'res_2', surveyId: 'sur_1', customerId: 'c2', customerName: 'Bob Builder', answers: { 'q1': 8, 'q2': 'Good packaging' }, timestamp: Date.now() - 50000, score: 8 },
    { id: 'res_3', surveyId: 'sur_1', customerId: 'c3', customerName: 'Charlie Day', answers: { 'q1': 4, 'q2': 'Late delivery' }, timestamp: Date.now() - 90000, score: 4 }
];

const Surveys: React.FC<SurveysProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'builder' | 'responses'>('dashboard');
  const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS);
  const [responses, setResponses] = useState<SurveyResponse[]>(MOCK_RESPONSES);
  
  // Builder State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState<Survey['trigger']>('manual');
  const [newQuestions, setNewQuestions] = useState<SurveyQuestion[]>([
      { id: 'q_1', text: '', type: 'nps' }
  ]);

  // NPS Calculation
  const npsResponses = responses.filter(r => r.score !== undefined && surveys.find(s => s.id === r.surveyId)?.questions[0].type === 'nps');
  const promoters = npsResponses.filter(r => (r.score || 0) >= 9).length;
  const detractors = npsResponses.filter(r => (r.score || 0) <= 6).length;
  const npsScore = npsResponses.length > 0 ? Math.round(((promoters - detractors) / npsResponses.length) * 100) : 0;

  const sentimentData = [
      { name: 'Promoters (9-10)', value: promoters, color: '#4ade80' },
      { name: 'Passives (7-8)', value: npsResponses.length - promoters - detractors, color: '#facc15' },
      { name: 'Detractors (0-6)', value: detractors, color: '#f87171' }
  ];

  const handleAddQuestion = () => {
      setNewQuestions([...newQuestions, { id: `q_${Date.now()}`, text: '', type: 'text' }]);
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
      const updated = [...newQuestions];
      updated[index] = { ...updated[index], [field]: value };
      setNewQuestions(updated);
  };

  const removeQuestion = (index: number) => {
      setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  const handleSaveSurvey = () => {
      if (!newTitle || newQuestions.length === 0) return;
      const newSurvey: Survey = {
          id: `sur_${Date.now()}`,
          title: newTitle,
          trigger: newTrigger,
          questions: newQuestions,
          active: true,
          responseCount: 0
      };
      setSurveys([...surveys, newSurvey]);
      setIsCreating(false);
      setNewTitle('');
      setNewQuestions([{ id: 'q_1', text: '', type: 'nps' }]);
  };

  const toggleActive = (id: string) => {
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Surveys & Feedback</h2>
          <p className="text-slate-400">Automate NPS and CSAT collection via WhatsApp.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'builder' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Surveys
            </button>
            <button 
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'responses' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Responses
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'dashboard' && (
              <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                          <h3 className="text-slate-400 text-sm font-bold uppercase mb-4 z-10">Net Promoter Score (NPS)</h3>
                          <div className="relative z-10">
                              <span className={`text-6xl font-black ${npsScore > 0 ? 'text-green-400' : npsScore < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                  {npsScore > 0 ? '+' : ''}{npsScore}
                              </span>
                          </div>
                          <div className="mt-4 flex space-x-4 text-xs font-medium z-10">
                              <span className="text-green-400">{promoters} Promoters</span>
                              <span className="text-yellow-400">{npsResponses.length - promoters - detractors} Passives</span>
                              <span className="text-red-400">{detractors} Detractors</span>
                          </div>
                          
                          {/* Background Glow */}
                          <div className={`absolute inset-0 opacity-10 blur-3xl ${npsScore > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                          <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Sentiment Distribution</h3>
                          <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                      >
                                          {sentimentData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                      </Pie>
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                      />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  </div>

                  <h3 className="text-white font-bold mb-4">Recent Feedback</h3>
                  <div className="space-y-3">
                      {responses.slice(0, 5).map(r => (
                          <div key={r.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex items-start">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-4 ${
                                  (r.score || 0) >= 9 ? 'bg-green-500' : (r.score || 0) <= 6 ? 'bg-red-500' : 'bg-yellow-500'
                              }`}>
                                  {r.score}
                              </div>
                              <div>
                                  <div className="flex items-center mb-1">
                                      <span className="text-white font-bold text-sm mr-2">{r.customerName}</span>
                                      <span className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-slate-300 text-sm italic">"{Object.values(r.answers).find(a => typeof a === 'string') || 'No comment'}"</p>
                                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Survey: {surveys.find(s => s.id === r.surveyId)?.title}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'builder' && (
              <div className="p-6 h-full flex flex-col">
                  {isCreating ? (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-y-auto custom-scrollbar flex-1">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-bold text-white">Create New Survey</h3>
                              <div className="flex gap-2">
                                  <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                                  <button onClick={handleSaveSurvey} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold">Save Survey</button>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-6">
                              <div>
                                  <label className="block text-slate-400 text-xs font-bold mb-2">Survey Title</label>
                                  <input 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                    placeholder="e.g. Delivery Feedback"
                                  />
                              </div>
                              <div>
                                  <label className="block text-slate-400 text-xs font-bold mb-2">Trigger Event</label>
                                  <select 
                                    value={newTrigger}
                                    onChange={e => setNewTrigger(e.target.value as any)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                                  >
                                      <option value="manual">Manual Broadcast</option>
                                      <option value="order_delivered">Order Delivered</option>
                                      <option value="ticket_resolved">Ticket Resolved</option>
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-4 mb-6">
                              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                  <h4 className="text-white font-bold text-sm">Questions Flow</h4>
                                  <button onClick={handleAddQuestion} className="text-xs text-blue-400 font-bold">+ Add Question</button>
                              </div>
                              
                              {newQuestions.map((q, i) => (
                                  <div key={q.id} className="bg-slate-800 p-4 rounded border border-slate-600 flex gap-4 items-start">
                                      <div className="bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold mt-1">{i + 1}</div>
                                      <div className="flex-1 space-y-3">
                                          <input 
                                            value={q.text}
                                            onChange={e => updateQuestion(i, 'text', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none"
                                            placeholder="Question text..."
                                          />
                                          <select 
                                            value={q.type}
                                            onChange={e => updateQuestion(i, 'type', e.target.value)}
                                            className="bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs outline-none"
                                          >
                                              <option value="nps">NPS (0-10 Scale)</option>
                                              <option value="rating">Rating (1-5 Stars)</option>
                                              <option value="yes_no">Yes / No</option>
                                              <option value="text">Open Text</option>
                                          </select>
                                      </div>
                                      <button onClick={() => removeQuestion(i)} className="text-slate-500 hover:text-red-400">
                                          <Icons.Trash />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col h-full">
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="font-bold text-white">Active Surveys</h3>
                               <button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center">
                                   <Icons.Plus /> <span className="ml-1">New Survey</span>
                               </button>
                           </div>
                           <div className="grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pb-4">
                               {surveys.map(survey => (
                                   <div key={survey.id} className="bg-slate-900 border border-slate-700 p-5 rounded-xl hover:border-slate-600 transition-colors">
                                       <div className="flex justify-between items-start mb-4">
                                           <div>
                                               <h4 className="text-white font-bold">{survey.title}</h4>
                                               <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 mt-1 inline-block">
                                                   Trigger: {survey.trigger.replace('_', ' ')}
                                               </span>
                                           </div>
                                           <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={survey.active} 
                                                    onChange={() => toggleActive(survey.id)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                           </label>
                                       </div>
                                       
                                       <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                                           <div>
                                               <p className="text-xs text-slate-400 uppercase font-bold mb-1">Responses</p>
                                               <p className="text-2xl font-bold text-white">{survey.responseCount}</p>
                                           </div>
                                           {survey.avgScore && (
                                               <div className="text-right">
                                                   <p className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Score</p>
                                                   <p className="text-2xl font-bold text-blue-400">{survey.avgScore}</p>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'responses' && (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                          <tr>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Survey</th>
                              <th className="p-4">Score</th>
                              <th className="p-4">Comments</th>
                              <th className="p-4 text-right">Date</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                          {responses.map(r => (
                              <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="p-4 font-medium text-white">{r.customerName}</td>
                                  <td className="p-4 text-slate-300">{surveys.find(s => s.id === r.surveyId)?.title}</td>
                                  <td className="p-4">
                                      {r.score !== undefined ? (
                                          <span className={`font-bold ${r.score >= 9 ? 'text-green-400' : r.score <= 6 ? 'text-red-400' : 'text-yellow-400'}`}>
                                              {r.score}
                                          </span>
                                      ) : '--'}
                                  </td>
                                  <td className="p-4 text-slate-400 italic truncate max-w-xs">
                                      "{Object.values(r.answers).find(a => typeof a === 'string') || ''}"
                                  </td>
                                  <td className="p-4 text-right text-slate-500 text-xs">
                                      {new Date(r.timestamp).toLocaleDateString()}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default Surveys;
