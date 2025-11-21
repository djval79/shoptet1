
import React, { useState, useEffect, useRef } from 'react';
import { SystemNotification, AppView } from '../types';
import { Icons } from '../constants';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (view: AppView) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkRead, onClearAll, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: SystemNotification['type']) => {
      switch (type) {
          case 'success': return <span className="text-green-400">✓</span>;
          case 'warning': return <span className="text-yellow-400">⚠</span>;
          case 'error': return <span className="text-red-400">!</span>;
          default: return <span className="text-blue-400">i</span>;
      }
  };

  const handleClick = (notif: SystemNotification) => {
      if (!notif.read) onMarkRead(notif.id);
      if (notif.link) {
          onNavigate(notif.link);
          setIsOpen(false);
      }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors relative"
      >
        <Icons.Bell />
        {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
            </div>
        )}
      </button>

      {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur">
                  <h4 className="text-white font-bold text-sm">Notifications</h4>
                  {notifications.length > 0 && (
                      <button 
                        onClick={onClearAll}
                        className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"
                      >
                          Clear All
                      </button>
                  )}
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                          <span className="text-2xl block mb-2 opacity-30">🔕</span>
                          <p className="text-slate-500 text-xs">No new notifications</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-800">
                          {notifications.map(n => (
                              <div 
                                key={n.id}
                                onClick={() => handleClick(n)}
                                className={`p-3 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start relative ${n.read ? 'opacity-60' : 'opacity-100'}`}
                              >
                                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mr-3 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-white text-sm font-medium flex items-center gap-2">
                                              {getIcon(n.type)} {n.title}
                                          </span>
                                          <span className="text-[10px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      </div>
                                      <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default NotificationCenter;
