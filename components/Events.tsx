
import React, { useState } from 'react';
import { BusinessProfile, Event, EventTicket } from '../types';
import { Icons } from '../constants';
import { generateEventDetails } from '../services/geminiService';

interface EventsProps {
  business: BusinessProfile;
}

const MOCK_EVENTS: Event[] = [
    {
        id: 'evt_1',
        name: 'Summer Launch Party',
        description: 'Join us for the exclusive reveal of our summer collection. Drinks, music, and networking.',
        startDate: Date.now() + 86400000 * 14,
        locationType: 'physical',
        location: 'Downtown Loft, 123 Main St',
        capacity: 100,
        sold: 45,
        price: 25,
        status: 'published'
    },
    {
        id: 'evt_2',
        name: 'Coffee Brewing Masterclass',
        description: 'Learn how to brew the perfect cup at home with our head barista.',
        startDate: Date.now() + 86400000 * 7,
        locationType: 'online',
        location: 'https://zoom.us/j/123456789',
        capacity: 500,
        sold: 120,
        price: 10,
        status: 'published'
    }
];

const Events: React.FC<EventsProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'create'>('upcoming');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  
  // Form
  const [isGenerating, setIsGenerating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'online' | 'physical'>('physical');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('50');
  const [newPrice, setNewPrice] = useState('0');
  const [newDesc, setNewDesc] = useState('');

  const currency = business.currencySymbol || '$';

  const handleGenerate = async () => {
      if (!newName) return;
      setIsGenerating(true);
      try {
          const result = await generateEventDetails(newName, newType);
          setNewDesc(result.description + '\n\nAgenda:\n' + result.agenda);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCreate = () => {
      if (!newName || !newDate) return;
      const startDate = new Date(`${newDate}T${newTime || '12:00'}`).getTime();
      
      const newEvent: Event = {
          id: `evt_${Date.now()}`,
          name: newName,
          description: newDesc,
          startDate,
          locationType: newType,
          location: newLocation,
          capacity: Number(newCapacity),
          sold: 0,
          price: Number(newPrice),
          status: 'published'
      };
      
      setEvents([...events, newEvent]);
      setActiveTab('upcoming');
      
      // Reset
      setNewName('');
      setNewDate('');
      setNewLocation('');
      setNewDesc('');
  };

  const simulateTicketSale = (event: Event) => {
      const newTicket: EventTicket = {
          id: `tkt_${Date.now()}`,
          eventId: event.id,
          customerId: `cust_${Date.now()}`,
          customerName: 'Guest User',
          status: 'confirmed',
          purchaseDate: Date.now()
      };
      setTickets([...tickets, newTicket]);
      
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, sold: e.sold + 1 } : e));
      alert("Ticket sold! Confirmation sent via WhatsApp.");
  };

  const sendReminders = (event: Event) => {
      alert(`Reminders sent to ${event.sold} attendees for "${event.name}"`);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Events & Ticketing</h2>
          <p className="text-slate-400">Host webinars and events with automated WhatsApp ticketing.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Upcoming
            </button>
            <button 
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'past' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Past
            </button>
            <button 
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                + Create
            </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
          
          {activeTab === 'create' && (
              <div className="p-8 max-w-3xl mx-auto w-full overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-bold text-white mb-6">Create New Event</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="col-span-2">
                          <label className="block text-slate-400 text-sm mb-2">Event Name</label>
                          <div className="flex gap-2">
                              <input 
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Annual Gala"
                                className="flex-1 bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-purple-500"
                              />
                              <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !newName}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold text-xs disabled:opacity-50 flex items-center"
                              >
                                  {isGenerating ? '...' : '✨ AI'}
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Date</label>
                          <input 
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Time</label>
                          <input 
                            type="time"
                            value={newTime}
                            onChange={e => setNewTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Type</label>
                          <select 
                            value={newType}
                            onChange={e => setNewType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          >
                              <option value="physical">Physical Location</option>
                              <option value="online">Online / Webinar</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-slate-400 text-sm mb-2">{newType === 'physical' ? 'Venue Address' : 'Link URL'}</label>
                          <input 
                            value={newLocation}
                            onChange={e => setNewLocation(e.target.value)}
                            placeholder={newType === 'physical' ? "123 Main St" : "https://zoom.us/..."}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>

                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Capacity</label>
                          <input 
                            type="number"
                            value={newCapacity}
                            onChange={e => setNewCapacity(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-sm mb-2">Ticket Price ({currency})</label>
                          <input 
                            type="number"
                            value={newPrice}
                            onChange={e => setNewPrice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                            placeholder="0 for free"
                          />
                      </div>

                      <div className="col-span-2">
                          <label className="block text-slate-400 text-sm mb-2">Description</label>
                          <textarea 
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 h-32"
                          />
                      </div>
                  </div>

                  <div className="flex justify-end gap-3">
                      <button onClick={() => setActiveTab('upcoming')} className="text-slate-400 hover:text-white px-4">Cancel</button>
                      <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg">Publish Event</button>
                  </div>
              </div>
          )}

          {(activeTab === 'upcoming' || activeTab === 'past') && (
              <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {events.filter(e => activeTab === 'upcoming' ? e.startDate > Date.now() : e.startDate <= Date.now()).map(event => (
                      <div key={event.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                                  <p className="text-slate-400 text-sm flex items-center">
                                      <span className="mr-2">{new Date(event.startDate).toLocaleDateString()}</span>
                                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700 capitalize">{event.locationType}</span>
                                  </p>
                              </div>
                              <div className="text-right">
                                  <span className="text-2xl font-bold text-green-400">{event.price > 0 ? `${currency}${event.price}` : 'Free'}</span>
                              </div>
                          </div>

                          <p className="text-slate-300 text-sm mb-6 line-clamp-2">{event.description}</p>

                          <div className="mt-auto">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>Tickets Sold</span>
                                  <span>{event.sold} / {event.capacity}</span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                  <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${(event.sold / event.capacity) * 100}%`}}></div>
                              </div>

                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => simulateTicketSale(event)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm font-bold border border-slate-600"
                                  >
                                      Sell Ticket
                                  </button>
                                  <button 
                                    onClick={() => sendReminders(event)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm font-bold border border-slate-600"
                                  >
                                      Blast Reminder
                                  </button>
                                  <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded border border-slate-600">
                                      <Icons.Menu />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
                  {events.length === 0 && <div className="col-span-full text-center py-12 text-slate-500">No events found.</div>}
              </div>
          )}

      </div>
    </div>
  );
};

export default Events;
