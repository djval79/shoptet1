
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
            email: email || 'demo@twilioflow.ai',
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"></div>
      
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/20">
                ⚡
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TwilioFlow AI</h1>
            <p className="text-slate-400">Enterprise WhatsApp Automation Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-400 text-sm mb-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="name@company.com"
                />
            </div>
            <div>
                <label className="block text-slate-400 text-sm mb-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 flex justify-center items-center"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
        </form>

        <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Quick Login</span>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleDemo('owner')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
                <span>👑</span>
                <span>Owner Demo</span>
            </button>
            <button 
                onClick={() => handleDemo('agent')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
                <span>🎧</span>
                <span>Agent Demo</span>
            </button>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
            >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
