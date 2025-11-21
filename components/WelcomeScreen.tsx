import React, { useState } from 'react';
import { Icons } from '../constants';

interface WelcomeScreenProps {
    onStartTour: () => void;
    onCreateBusiness: () => void;
    onSkip: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartTour, onCreateBusiness, onSkip }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleAction = (action: () => void) => {
        setIsExiting(true);
        setTimeout(() => {
            localStorage.setItem('shoptet_welcome_seen', 'true');
            action();
        }, 300);
    };

    return (
        <div className={`fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 ${isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-500'}`}>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl w-full">

                {/* Logo & Title */}
                <div className="text-center mb-12 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/20">
                        <Icons.Zap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome to Shoptet
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Your AI-powered WhatsApp Business platform. Automate sales, engage customers, and grow your business with intelligent conversations.
                    </p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icons.MessageSquare />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">AI Sales Agent</h3>
                        <p className="text-slate-400 text-sm">
                            Powered by Google Gemini to handle customer conversations 24/7
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icons.BarChart />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Analytics & Insights</h3>
                        <p className="text-slate-400 text-sm">
                            Track revenue, conversions, and customer behavior in real-time
                        </p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-green-500/50 transition-all group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icons.Zap />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Easy Integration</h3>
                        <p className="text-slate-400 text-sm">
                            Connect with Twilio WhatsApp API in minutes, no coding required
                        </p>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-300">

                    {/* Start Tour */}
                    <button
                        onClick={() => handleAction(onStartTour)}
                        className="group relative bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Icons.Play />
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">
                            <Icons.Compass />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Start Tour</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Take a guided tour to learn all the features and get up to speed quickly
                        </p>
                        <div className="mt-4 flex items-center text-white text-sm font-medium">
                            <span>Begin journey</span>
                            <Icons.ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Create Business */}
                    <button
                        onClick={() => handleAction(onCreateBusiness)}
                        className="group relative bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-2xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Icons.Zap />
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white mb-4">
                            <Icons.Briefcase />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Create Business</h3>
                        <p className="text-purple-100 text-sm leading-relaxed">
                            Jump right in and set up your business profile, products, and AI agent
                        </p>
                        <div className="mt-4 flex items-center text-white text-sm font-medium">
                            <span>Get started</span>
                            <Icons.ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Explore Demo */}
                    <button
                        onClick={() => handleAction(onSkip)}
                        className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-slate-600 rounded-2xl p-8 text-left transition-all hover:scale-105"
                    >
                        <div className="absolute top-4 right-4 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Icons.Eye />
                        </div>
                        <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                            <Icons.Layers />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Explore Demo</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Browse the platform with sample data to see what's possible
                        </p>
                        <div className="mt-4 flex items-center text-slate-300 text-sm font-medium">
                            <span>View demo</span>
                            <Icons.ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>

                {/* Skip Link */}
                <div className="text-center animate-in fade-in duration-700 delay-500">
                    <button
                        onClick={() => handleAction(onSkip)}
                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Skip and explore on my own →
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="mt-12 text-center text-slate-500 text-sm animate-in fade-in duration-700 delay-700">
                    <p>Need help? Press <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 mx-1">Cmd/Ctrl + ?</kbd> anytime to access the help center</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
