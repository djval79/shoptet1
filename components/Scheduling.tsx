import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Icons } from '../constants';
import { generateStaffSchedule } from '../services/geminiService';
import { MOCK_TEAM } from '../constants';

interface SchedulingProps {
    business: BusinessProfile;
}

interface Shift {
    id: string;
    employeeId: string;
    employeeName: string;
    role: string;
    day: string;
    startTime: string;
    endTime: string;
    color: string;
}

const Scheduling: React.FC<SchedulingProps> = ({ business }) => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState('Nov 20 - Nov 26, 2023');

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleAutoSchedule = async () => {
        setIsGenerating(true);
        try {
            // Simulate AI generation delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock AI result
            const newShifts: Shift[] = [
                { id: 's1', employeeId: 'tm_1', employeeName: 'Sarah Connor', role: 'Manager', day: 'Mon', startTime: '08:00', endTime: '16:00', color: 'bg-blue-500' },
                { id: 's2', employeeId: 'tm_2', employeeName: 'John Wick', role: 'Security', day: 'Mon', startTime: '12:00', endTime: '20:00', color: 'bg-purple-500' },
                { id: 's3', employeeId: 'tm_1', employeeName: 'Sarah Connor', role: 'Manager', day: 'Tue', startTime: '08:00', endTime: '16:00', color: 'bg-blue-500' },
                { id: 's4', employeeId: 'tm_2', employeeName: 'John Wick', role: 'Security', day: 'Wed', startTime: '10:00', endTime: '18:00', color: 'bg-purple-500' },
                { id: 's5', employeeId: 'tm_1', employeeName: 'Sarah Connor', role: 'Manager', day: 'Thu', startTime: '09:00', endTime: '17:00', color: 'bg-blue-500' },
                { id: 's6', employeeId: 'tm_2', employeeName: 'John Wick', role: 'Security', day: 'Fri', startTime: '14:00', endTime: '22:00', color: 'bg-purple-500' },
            ];
            setShifts(newShifts);
        } catch (error) {
            console.error("Failed to generate schedule", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const publishShifts = () => {
        alert("Roster published to all staff via WhatsApp!");
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Staff Rostering</h2>
                    <p className="text-slate-400 text-sm">AI-powered shift scheduling and team notification.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-[#1e293b] rounded-lg p-1 border border-slate-700">
                        <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Icons.ChevronLeft /></button>
                        <span className="px-4 text-sm font-medium text-slate-200">{selectedWeek}</span>
                        <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Icons.ChevronRight /></button>
                    </div>
                    <button
                        onClick={handleAutoSchedule}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-purple-900/20 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Icons.Loader className="animate-spin w-4 h-4" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Icons.Wand className="w-4 h-4" />
                                <span>AI Auto-Fill</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={publishShifts}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-green-900/20 transition-all flex items-center space-x-2"
                    >
                        <Icons.Send className="w-4 h-4" />
                        <span>Publish</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden flex flex-col shadow-lg">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/50">
                    {days.map(day => (
                        <div key={day} className="p-4 text-center border-r border-slate-700 last:border-r-0">
                            <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="flex-1 grid grid-cols-7">
                    {days.map(day => (
                        <div key={day} className="border-r border-slate-700/50 last:border-r-0 p-2 relative group min-h-[200px]">
                            {/* Add Shift Button (Hover) */}
                            <button className="absolute inset-0 w-full h-full bg-slate-800/0 group-hover:bg-slate-800/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-0">
                                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                                    <Icons.Plus />
                                </div>
                            </button>

                            {/* Shifts */}
                            <div className="relative z-10 space-y-2">
                                {shifts.filter(s => s.day === day).map(shift => (
                                    <div key={shift.id} className={`${shift.color} bg-opacity-20 border-l-4 ${shift.color.replace('bg-', 'border-')} p-2 rounded-r-lg cursor-pointer hover:brightness-110 transition-all`}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-white">{shift.employeeName}</span>
                                            <span className="text-[10px] text-slate-300 bg-black/20 px-1 rounded">{shift.startTime}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 mt-1">{shift.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-4 gap-6 mt-6">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Hours</p>
                        <p className="text-xl font-bold text-white">142h</p>
                    </div>
                    <Icons.Clock className="text-slate-500" />
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Est. Cost</p>
                        <p className="text-xl font-bold text-white">$3,450</p>
                    </div>
                    <Icons.DollarSign className="text-slate-500" />
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Staff Count</p>
                        <p className="text-xl font-bold text-white">12</p>
                    </div>
                    <Icons.Users className="text-slate-500" />
                </div>
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Coverage</p>
                        <p className="text-xl font-bold text-green-400">98%</p>
                    </div>
                    <Icons.Check className="text-green-500" />
                </div>
            </div>
        </div>
    );
};

export default Scheduling;
