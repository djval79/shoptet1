import React, { useEffect, useState } from 'react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-full duration-300
                        ${toast.type === 'success' ? 'bg-slate-900 border-green-500/50 text-green-400' :
                            toast.type === 'error' ? 'bg-slate-900 border-red-500/50 text-red-400' :
                                'bg-slate-900 border-blue-500/50 text-blue-400'}`}
                >
                    <span className="text-xl">
                        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}
                    </span>
                    <p className="text-sm font-medium text-white">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="ml-auto text-slate-500 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

// Simple event bus for triggering toasts from anywhere
type ToastListener = (toast: ToastMessage) => void;
const listeners: ToastListener[] = [];

export const toast = {
    success: (message: string) => emit({ id: Date.now().toString(), type: 'success', message }),
    error: (message: string) => emit({ id: Date.now().toString(), type: 'error', message }),
    info: (message: string) => emit({ id: Date.now().toString(), type: 'info', message }),
    subscribe: (listener: ToastListener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    }
};

const emit = (toast: ToastMessage) => {
    listeners.forEach(l => l(toast));
};
