
import React, { useState } from 'react';
import { Appointment } from '../types';
import { MOCK_APPOINTMENTS, Icons } from '../constants';

interface CalendarProps {
    appointments?: Appointment[];
    onUpdateAppointments?: (appointments: Appointment[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ appointments = MOCK_APPOINTMENTS, onUpdateAppointments }) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');

  // Group appointments by date
  const grouped = appointments.reduce((acc, appt) => {
      const date = new Date(appt.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(appt);
      return acc;
  }, {} as Record<string, Appointment[]>);

  const cancelBooking = (id: string) => {
      if (confirm('Cancel this booking?')) {
          if (onUpdateAppointments) {
              onUpdateAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
          }
      }
  };

  const handleCreate = () => {
      if (!customerName || !serviceName || !date || !time) return;
      
      const startTime = new Date(`${date}T${time}`).getTime();
      
      const newAppt: Appointment = {
          id: `appt_${Date.now()}`,
          customerId: `guest_${Date.now()}`, // Mock ID for manual entry
          customerName,
          serviceName,
          startTime,
          duration: parseInt(duration),
          status: 'confirmed',
          notes: 'Manual booking'
      };
      
      if (onUpdateAppointments) {
          onUpdateAppointments([...appointments, newAppt]);
      }
      setIsCreating(false);
      setCustomerName('');
      setServiceName('');
      setDate('');
      setTime('');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <p className="text-slate-400">Manage service bookings and consultations.</p>
        </div>
        <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg flex items-center"
        >
            <span className="mr-2"><Icons.Plus /></span> New Booking
        </button>
      </div>
      
      {isCreating && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6 shadow-2xl animate-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-white mb-4">Create Appointment</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-slate-400 text-xs mb-1">Customer Name</label>
                      <input 
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                        placeholder="Jane Doe"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-400 text-xs mb-1">Service</label>
                      <input 
                        value={serviceName}
                        onChange={e => setServiceName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                        placeholder="Consultation"
                      />
                  </div>
                  <div>
                      <label className="block text-slate-400 text-xs mb-1">Date</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                      />
                  </div>
                  <div className="flex gap-2">
                      <div className="flex-1">
                          <label className="block text-slate-400 text-xs mb-1">Time</label>
                          <input 
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                          />
                      </div>
                      <div className="w-24">
                          <label className="block text-slate-400 text-xs mb-1">Duration (m)</label>
                          <input 
                            type="number"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                          />
                      </div>
                  </div>
              </div>
              <div className="flex justify-end gap-2">
                  <button onClick={() => setIsCreating(false)} className="px-3 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                  <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold">Save</button>
              </div>
          </div>
      )}

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex space-x-4">
               <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                   <span className="block text-2xl font-bold text-white">{appointments.filter(a => a.status === 'confirmed').length}</span>
                   <span className="text-xs text-slate-400 uppercase font-bold">Confirmed</span>
               </div>
               <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                   <span className="block text-2xl font-bold text-yellow-400">{appointments.filter(a => a.status === 'pending').length}</span>
                   <span className="text-xs text-slate-400 uppercase font-bold">Pending</span>
               </div>
               <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                   <span className="block text-2xl font-bold text-red-400">{appointments.filter(a => a.status === 'cancelled').length}</span>
                   <span className="text-xs text-slate-400 uppercase font-bold">Cancelled</span>
               </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {Object.keys(grouped).length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                      No upcoming appointments.
                  </div>
              )}
              
              {Object.entries(grouped).map(([date, appts]) => (
                  <div key={date}>
                      <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4 sticky top-0 bg-slate-800 py-2 z-10">{date}</h3>
                      <div className="space-y-3">
                          {(appts as Appointment[]).map(appt => (
                              <div key={appt.id} className={`flex items-center p-4 rounded-xl border transition-all ${appt.status === 'cancelled' ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-700 hover:border-blue-500/50'}`}>
                                  <div className="flex flex-col items-center mr-6 min-w-[60px]">
                                      <span className="text-white font-bold text-lg">{new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      <span className="text-xs text-slate-500">{appt.duration} min</span>
                                  </div>
                                  
                                  <div className="flex-1">
                                      <div className="flex justify-between mb-1">
                                          <h4 className="text-white font-bold">{appt.serviceName}</h4>
                                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                              appt.status === 'confirmed' ? 'bg-green-900/30 text-green-400' : 
                                              appt.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : 
                                              'bg-red-900/30 text-red-400'
                                          }`}>
                                              {appt.status}
                                          </span>
                                      </div>
                                      <div className="flex items-center text-sm text-slate-400">
                                          <span className="flex items-center mr-4"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> {appt.customerName}</span>
                                          {appt.notes && <span className="italic text-slate-500 text-xs truncate max-w-xs">Note: {appt.notes}</span>}
                                      </div>
                                  </div>

                                  <div className="ml-4 flex space-x-2">
                                      {appt.status !== 'cancelled' && (
                                          <button 
                                            onClick={() => cancelBooking(appt.id)}
                                            className="p-2 hover:bg-red-900/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors" title="Cancel Booking"
                                          >
                                              <Icons.Trash />
                                          </button>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Calendar;
