import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';
import { useUser } from '../contexts/UserContext';
import { useBusiness } from '../contexts/BusinessContext';
import { useData } from '../contexts/DataContext';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import CommandPalette from './CommandPalette';

interface LayoutProps {
    children: React.ReactNode;
    currentView: AppView;
    onNavigate: (view: AppView) => void;
    onOpenHelp?: () => void;
    onStartTour?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, onOpenHelp, onStartTour }) => {
    const { activeBusiness } = useBusiness();
    const { customers, orders, notifications, setNotifications } = useData();

    const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    // Detect orientation changes
    useEffect(() => {
        const checkOrientation = () => {
            const isLandscapeMode = window.innerWidth > window.innerHeight && window.innerWidth < 1024;
            setIsLandscape(isLandscapeMode);

            // Auto-close mobile menu in landscape mode
            if (isLandscapeMode) {
                setIsMobileMenuOpen(false);
            }
        };

        // Check on mount
        checkOrientation();

        // Listen for orientation changes
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    // Command Palette Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCmdPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
            <CommandPalette
                isOpen={isCmdPaletteOpen}
                onClose={() => setIsCmdPaletteOpen(false)}
                onNavigate={onNavigate}
                data={{ customers, orders, products: activeBusiness.products }}
            />

            <Sidebar
                currentView={currentView}
                onNavigate={onNavigate}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
                onOpenHelp={onOpenHelp}
                onStartTour={onStartTour}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
                {/* Mobile Header - Hidden in landscape */}
                <div className={`lg:hidden bg-[#0b1120] border-b border-slate-800 p-4 flex items-center justify-between transition-all ${isLandscape ? 'hidden' : ''}`}>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400 touch-manipulation"><Icons.Menu /></button>
                        <span className="font-bold text-white">{activeBusiness.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <NotificationCenter
                            notifications={notifications}
                            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                            onClearAll={() => setNotifications([])}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>

                {/* Floating Menu Button for Landscape Mode */}
                {isLandscape && (
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="fixed top-4 left-4 z-30 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all touch-manipulation"
                        aria-label="Open menu"
                    >
                        <Icons.Menu className="w-5 h-5" />
                    </button>
                )}

                {/* Desktop Top Bar */}
                <div className="hidden lg:flex h-16 border-b border-slate-800 bg-[#0f172a] items-center justify-between px-6">
                    <div className="flex items-center text-slate-400 text-sm">
                        <span className="mr-2 text-slate-500">/</span>
                        <span className="font-medium text-slate-200 capitalize">{currentView.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div
                            onClick={() => setIsCmdPaletteOpen(true)}
                            className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 cursor-pointer hover:border-slate-600 hover:text-slate-300 transition-all w-64"
                        >
                            <Icons.Search className="w-4 h-4" />
                            <span className="ml-2 flex-1">Search...</span>
                            <span className="bg-slate-700 px-1.5 rounded border border-slate-600 font-mono text-[10px]">⌘K</span>
                        </div>

                        <div className="h-6 w-px bg-slate-800 mx-2"></div>

                        {onOpenHelp && (
                            <button
                                onClick={onOpenHelp}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative group"
                                title="Help & Support (Cmd/Ctrl + ?)"
                            >
                                <Icons.LifeBuoy className="w-5 h-5" />
                                <span className="absolute -bottom-8 right-0 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Help (⌘?)
                                </span>
                            </button>
                        )}

                        <NotificationCenter
                            notifications={notifications}
                            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                            onClearAll={() => setNotifications([])}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-hidden relative">
                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${isLandscape ? 'p-3 lg:p-8' : 'p-4 lg:p-8'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
