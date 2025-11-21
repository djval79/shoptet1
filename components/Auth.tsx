
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const mockUser: User = {
                id: email || 'demo_user',
                email: email || 'demo@chat2close.ai',
                name: email ? email.split('@')[0] : 'Demo User',
                role: 'owner',
                plan: 'trial'
            };
            onLogin(mockUser);
            setIsLoading(false);
        }, 1000);
    };

    const handleDemo = (role: 'owner' | 'agent' = 'owner') => {
        setIsLoading(true);
        setTimeout(() => {
            onLogin({
                id: role === 'owner' ? 'demo_owner' : 'demo_agent',
                email: role === 'owner' ? 'owner@example.com' : 'agent@example.com',
                name: role === 'owner' ? 'Business Owner' : 'Sales Agent',
                role: role,
                plan: 'growth'
            });
        }, 800);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-animated"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="particle absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
                <div className="particle absolute bottom-20 right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: '1s' }}></div>
                <div className="particle absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Content */}
            <div className="glass-dark p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-scale-in border-gradient">
                <div className="text-center mb-8">
                    {/* Animated Logo */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-lg shadow-blue-500/30 hover-scale">
                            ⚡
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 text-gradient">Chat2Close AI</h1>
                    <p className="text-slate-300">Enterprise WhatsApp Automation Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="animate-in" style={{ animationDelay: '0.1s' }}>
                        <label className="block text-slate-300 text-sm mb-2 font-medium">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div className="animate-in" style={{ animationDelay: '0.2s' }}>
                        <label className="block text-slate-300 text-sm mb-2 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-gradient text-white font-bold py-3.5 rounded-xl shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center animate-in"
                        style={{ animationDelay: '0.3s' }}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Authenticating...</span>
                            </div>
                        ) : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-8 relative animate-in" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-slate-900/80 text-slate-400 font-medium">Quick Demo Access</span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 animate-in" style={{ animationDelay: '0.5s' }}>
                    <button
                        onClick={() => handleDemo('owner')}
                        className="glass border border-slate-700/50 text-white font-medium py-3.5 rounded-xl hover-lift hover-glow transition-all flex items-center justify-center space-x-2 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">👑</span>
                        <span>Owner Demo</span>
                    </button>
                    <button
                        onClick={() => handleDemo('agent')}
                        className="glass border border-slate-700/50 text-white font-medium py-3.5 rounded-xl hover-lift hover-glow transition-all flex items-center justify-center space-x-2 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🎧</span>
                        <span>Agent Demo</span>
                    </button>
                </div>

                <div className="mt-6 text-center animate-in" style={{ animationDelay: '0.6s' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-white text-sm transition-colors hover:scale-105 inline-block"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-purple-500/20 to-transparent blur-3xl"></div>
        </div>
    );
};

export default Auth;
