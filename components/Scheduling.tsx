
import React, { useState } from 'react';
import { BusinessProfile, Shift, TeamMember } from '../types';
import { Icons, MOCK_TEAM } from '../constants';
import { generateStaffSchedule } from '../services/geminiService';

interface SchedulingProps {
  business: BusinessProfile;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Scheduling: React.FC<SchedulingProps> = ({ business }) => {
  // Initial Shifts (Mock)
  const [shifts, setShifts] = useState<Shift[]>([
      { id: 'sh_1', employeeId: MOCK_TEAM[1].id, employeeName: MOCK_TEAM[1].name, role: 'Sales', startTime: new Date().setHours(9,0,0,0), endTime: new Date().setHours(17,0,0,0), color: '#3b82f6', status: 'published' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Create Shift Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newShiftEmp, setNewShiftEmp] = useState(MOCK_TEAM[0].id);
  const [newShiftDay, setNewShiftDay] = useState(0); // 0 = Monday
  const [newShiftStart, setNewShiftStart] = useState('09:00');
  const [newShiftEnd, setNewShiftEnd] = useState('17:00');

  // Get next Monday for calculation
  const getNextMonday = () => {
      const d = new Date();
      d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
      d.setHours(0,0,0,0);
      return d;
  };

  const baseDate = getNextMonday();

  const handleAutoSchedule = async () => {
      setIsGenerating(true);
      try {
          const hours = `${business.businessHours?.opensAt || '09:00'} - ${business.businessHours?.closesAt || '17:00'}`;
          const result = await generateStaffSchedule(MOCK_TEAM, hours);
          
          const newShifts: Shift[] = result.shifts.map((s: any, i: number) => {
              const member = MOCK_TEAM.find(m => m.id === s.employeeId) || MOCK_TEAM[0];
              return {
                  id: `shift_gen_${Date.now()}_${i}`,
                  employeeId: s.employeeId,
                  employeeName: member.name,
                  role: s.role || 'Staff',
                  startTime: new Date(s.startTime).getTime(),
                  endTime: new Date(s.endTime).getTime(),
                  color: member.role === 'admin' ? '#a855f7' : '#3b82f6',
                  status: 'draft'
              };
          });
          
          setShifts(newShifts);
      } catch (e) {
          console.error(e);
          alert("AI Scheduling failed. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCreateShift = () => {
      const member = MOCK_TEAM.find(m => m.id === newShiftEmp);
      if (!member) return;

      const start = new Date(baseDate);
      start.setDate(baseDate.getDate() + newShiftDay);
      const [sh, sm] = newShiftStart.split(':');
      start.setHours(parseInt(sh), parseInt(sm));

      const end = new Date(baseDate);
      end.setDate(baseDate.getDate() + newShiftDay);
      const [eh, em] = newShiftEnd.split(':');
      end.setHours(parseInt(eh), parseInt(em));

      const newShift: Shift = {
          id: `shift_${Date.now()}`,
          employeeId: member.id,
          employeeName: member.name,
          role: member.role || 'Staff',
          startTime: start.getTime(),
          endTime: end.getTime(),
          color: '#10b981',
          status: 'draft'
      };
      
      setShifts([...shifts, newShift]);
      setIsCreating(false);
  };

  const deleteShift = (id: string) => {
      setShifts(shifts.filter(s => s.id !== id));
  };

  const publishShifts = () => {
      setShifts(shifts.map(s => ({ ...s, status: 'published' })));
      alert(`Roster published! ${shifts.length} shifts sent to employees via WhatsApp.`);
  };

  const totalHours = shifts.reduce((acc, s) => acc + (s.endTime - s.startTime) / 3600000, 0);
  const estimatedCost = totalHours * 15; // Mock $15/hr

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Rostering</h2>
          <p className="text-slate-400">AI-powered shift scheduling and team notification.</p>
        </div>
        <div className="flex space-x-3">
             <div className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-300 flex flex-col items-end justify-center">
                 <span className="font-bold text-white">{totalHours.toFixed(1)} Hrs</span>
                 <span className="text-[10px]">Est. ${estimatedCost.toFixed(0)}</span>
             </div>
             <button 
                onClick={handleAutoSchedule}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center disabled:opacity-50"
             >
                 {isGenerating ? 'Thinking...' : <><span className="mr-2">✨</span> AI Auto-Fill</>}
             </button>
             <button 
                onClick={publishShifts}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
             >
                 <span className="mr-2"><Icons.Send /></span> Publish
             </button>
        </div>
      </div>

      {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-96 shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-white font-bold mb-4">Add Shift</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-slate-400 text-xs mb-1">Employee</label>
                          <select 
                            value={newShiftEmp}
                            onChange={e => setNewShiftEmp(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                          >
                              {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-slate-400 text-xs mb-1">Day</label>
                          <select 
                            value={newShiftDay}
                            onChange={e => setNewShiftDay(parseInt(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                          >
                              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                      </div>
                      <div className="flex gap-2">
                          <div className="flex-1">
                              <label className="block text-slate-400 text-xs mb-1">Start</label>
                              <input type="time" value={newShiftStart} onChange={e => setNewShiftStart(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                          </div>
                          <div className="flex-1">
                              <label className="block text-slate-400 text-xs mb-1">End</label>
                              <input type="time" value={newShiftEnd} onChange={e => setNewShiftEnd(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                          </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-3 text-sm">Cancel</button>
                          <button onClick={handleCreateShift} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Save</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white">Week of {baseDate.toLocaleDateString()}</h3>
              <button onClick={() => setIsCreating(true)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded flex items-center">
                  <Icons.Plus /> Add Shift
              </button>
          </div>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar">
              <div className="flex min-w-[1000px] h-full divide-x divide-slate-700/50">
                  {DAYS.map((day, i) => {
                      // Helper to check if shift falls on this day index relative to baseDate
                      // Simplification: Assuming generated shifts are correctly dated for the week
                      // In a real app, we'd compare full dates. Here we mock it by Day of Week.
                      const dayShifts = shifts.filter(s => new Date(s.startTime).getDay() === (i + 1) % 7); 

                      return (
                          <div key={day} className="flex-1 flex flex-col bg-slate-900/20">
                              <div className="p-3 text-center border-b border-slate-700/50 bg-slate-800/50">
                                  <span className="text-slate-400 text-xs font-bold uppercase">{day}</span>
                              </div>
                              <div className="p-2 flex-1 space-y-2">
                                  {dayShifts.map(shift => (
                                      <div 
                                        key={shift.id} 
                                        className="p-3 rounded-lg border shadow-sm relative group hover:scale-105 transition-transform"
                                        style={{ backgroundColor: `${shift.color}20`, borderColor: `${shift.color}40` }}
                                      >
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="text-white font-bold text-xs truncate">{shift.employeeName}</span>
                                              {shift.status === 'draft' && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>}
                                          </div>
                                          <p className="text-[10px] text-slate-300 mb-1">{shift.role}</p>
                                          <div className="text-[10px] font-mono text-slate-400 bg-black/20 rounded px-1 py-0.5 inline-block">
                                              {new Date(shift.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                          </div>
                                          <button 
                                            onClick={() => deleteShift(shift.id)}
                                            className="absolute top-1 right-1 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-900/20 rounded p-1"
                                          >
                                              <Icons.Trash />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Scheduling;
