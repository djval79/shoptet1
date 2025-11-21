
import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, Driver, Order } from '../types';
import { MOCK_DRIVERS, Icons } from '../constants';
import { optimizeDeliveryRoute } from '../services/geminiService';

interface LogisticsProps {
  business: BusinessProfile;
  orders: Order[];
  onAssign: (orderId: string, driverId: string) => void;
}

const Logistics: React.FC<LogisticsProps> = ({ business, orders, onAssign }) => {
  // Initialize drivers with random positions on map (0-100 scale)
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS.map(d => ({
      ...d,
      location: { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 },
      heading: 0
  })));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const animationRef = useRef<number>(0);

  // Filter orders that need delivery (processing/shipped but not assigned)
  const pendingOrders = orders.filter(o => (o.status === 'processing' || o.status === 'shipped') && !o.assignedDriverId);
  
  // Animation Loop for Driver Movement
  useEffect(() => {
      const updatePositions = () => {
          setDrivers(prevDrivers => {
              return prevDrivers.map(d => {
                  if (d.status === 'busy' && d.destination) {
                      // Move towards destination
                      const dx = d.destination.x - (d.location?.x || 0);
                      const dy = d.destination.y - (d.location?.y || 0);
                      const distance = Math.sqrt(dx*dx + dy*dy);
                      
                      if (distance < 0.5) {
                          // Arrived, pick new random destination to simulate "Next Stop"
                          return { 
                              ...d, 
                              location: d.destination,
                              destination: { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 } 
                          };
                      } else {
                          // Move a small step
                          const speed = 0.15; 
                          const moveX = (dx / distance) * speed;
                          const moveY = (dy / distance) * speed;
                          
                          // Calculate Heading (Angle)
                          const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

                          return {
                              ...d,
                              location: { x: (d.location?.x || 0) + moveX, y: (d.location?.y || 0) + moveY },
                              heading: angle
                          };
                      }
                  }
                  return d;
              });
          });
          animationRef.current = requestAnimationFrame(updatePositions);
      };
      
      animationRef.current = requestAnimationFrame(updatePositions);
      return () => {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
  }, []);

  const handleOptimize = async () => {
      if (pendingOrders.length === 0) return;
      setIsOptimizing(true);
      try {
          const result = await optimizeDeliveryRoute(pendingOrders, drivers);
          
          // Apply assignments
          result.assignments.forEach((assign: any) => {
              onAssign(assign.orderId, assign.driverId);
              
              // Update local driver state for visual feedback
              setDrivers(prev => prev.map(d => {
                  if (d.id === assign.driverId) {
                      // Pick a random destination to start moving
                      return { 
                          ...d, 
                          activeOrders: d.activeOrders + 1, 
                          status: 'busy',
                          destination: { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }
                      };
                  }
                  return d;
              }));
          });
          
      } catch (e) {
          console.error(e);
      } finally {
          setIsOptimizing(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Logistics & Delivery</h2>
          <p className="text-slate-400">Real-time fleet tracking and AI route optimization.</p>
        </div>
        <button 
            onClick={handleOptimize}
            disabled={isOptimizing || pendingOrders.length === 0}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2 rounded-lg font-medium shadow-lg flex items-center disabled:opacity-50 transition-all"
        >
            {isOptimizing ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Optimizing Routes...
                </>
            ) : (
                <>
                    <span className="mr-2"><Icons.Map /></span> Auto-Assign Routes (AI)
                </>
            )}
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left Panel: Dispatch Board */}
          <div className="w-80 flex flex-col gap-4">
              {/* Unassigned Orders */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-1/2">
                  <div className="p-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                      <h4 className="font-bold text-white text-xs uppercase">Pending Dispatch</h4>
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 rounded-full font-bold">{pendingOrders.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                      {pendingOrders.length === 0 && <div className="text-center text-slate-500 text-xs mt-4">All orders assigned.</div>}
                      {pendingOrders.map(o => (
                          <div key={o.id} className="bg-slate-900 p-3 rounded border border-slate-700/50">
                              <div className="flex justify-between mb-1">
                                  <span className="text-white font-medium text-sm">Order #{o.id.slice(-4)}</span>
                                  <span className="text-xs text-slate-500">{new Date(o.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-xs text-slate-400 truncate">{o.customerName}</p>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Active Drivers */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden h-1/2">
                  <div className="p-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                      <h4 className="font-bold text-white text-xs uppercase">Active Fleet</h4>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 rounded-full font-bold">{drivers.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                       {drivers.map(d => (
                           <div key={d.id} className="bg-slate-900 p-3 rounded border border-slate-700/50 flex items-center justify-between">
                               <div className="flex items-center">
                                   <div className={`w-2 h-2 rounded-full mr-2 ${d.status === 'idle' ? 'bg-green-500' : d.status === 'busy' ? 'bg-yellow-500' : 'bg-slate-500'}`}></div>
                                   <div>
                                       <p className="text-white text-sm font-medium">{d.name}</p>
                                       <p className="text-[10px] text-slate-400">{d.activeOrders} active deliveries</p>
                                   </div>
                               </div>
                               <div className="text-slate-500">
                                   <Icons.Truck />
                               </div>
                           </div>
                       ))}
                  </div>
              </div>
          </div>

          {/* Right Panel: Map Visualization */}
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden group">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-[#1e293b] opacity-50 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-122.4194,37.7749,12,0/800x600?access_token=mock')] bg-cover bg-center"></div>
              
              {/* Grid lines for "tech" feel */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

              {/* Simulated Pins */}
              <div className="absolute inset-0 pointer-events-none">
                  {/* Driver Pins */}
                  {drivers.filter(d => d.status !== 'offline').map((d, i) => (
                      <div 
                        key={d.id} 
                        className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-linear"
                        style={{ top: `${d.location?.y || 50}%`, left: `${d.location?.x || 50}%` }}
                      >
                          {/* Pulsing destination line if moving */}
                          {d.destination && (
                              <svg className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20" style={{ transform: `rotate(${Math.atan2(d.destination.y - (d.location?.y||0), d.destination.x - (d.location?.x||0)) * 180 / Math.PI}deg)` }}>
                                  <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="cyan" strokeWidth="2" strokeDasharray="4 4" />
                              </svg>
                          )}

                          <div className="relative">
                              <div 
                                className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white z-10 transition-transform duration-500"
                                style={{ transform: `rotate(${d.heading || 0}deg)` }}
                              >
                                  <Icons.Truck />
                              </div>
                              {/* Pulse Effect */}
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                          </div>
                          
                          <div className="bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded mt-1 backdrop-blur-sm whitespace-nowrap border border-slate-700 shadow-md">
                              {d.name} • <span className="text-green-400">2 min away</span>
                          </div>
                      </div>
                  ))}

                  {/* Pending Order Pins (Static for now, targets for drivers) */}
                  {pendingOrders.map((o, i) => (
                      <div 
                        key={o.id} 
                        className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${20 + (i * 10)}%`, left: `${60 - (i * 5)}%` }}
                      >
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-lg z-0 animate-pulse"></div>
                      </div>
                  ))}
              </div>

              {/* Overlay UI */}
              <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-2xl">
                  <h5 className="text-white font-bold text-xs uppercase mb-2">Live Tracking</h5>
                  <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full border border-white mr-2"></div>
                          <span className="text-xs text-slate-300">Fleet</span>
                      </div>
                      <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white mr-2"></div>
                          <span className="text-xs text-slate-300">Pending</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Logistics;
