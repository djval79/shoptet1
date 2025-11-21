import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface TourStep {
    id: string;
    title: string;
    description: string;
    targetSelector?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: string;
}

interface OnboardingTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: '👋 Welcome to Shoptet!',
        description: 'Your AI-powered WhatsApp Business platform. Let\'s take a quick tour to get you started.',
        position: 'center'
    },
    {
        id: 'dashboard',
        title: '📊 Dashboard Overview',
        description: 'Monitor your revenue, active conversations, and AI agent performance at a glance.',
        position: 'center'
    },
    {
        id: 'sidebar',
        title: '🧭 Navigation',
        description: 'Access all features from the sidebar: CRM, Inbox, Analytics, Settings, and more.',
        position: 'right'
    },
    {
        id: 'business-setup',
        title: '🏢 Business Profile',
        description: 'Set up your business details, products, and AI sales strategy. This is where the magic begins!',
        position: 'center',
        action: 'Click "Settings" to configure your business'
    },
    {
        id: 'chat-simulator',
        title: '💬 Test Your AI Agent',
        description: 'Use the Chat Simulator to test conversations before going live. Perfect for training your AI!',
        position: 'center',
        action: 'Try the simulator from the sidebar'
    },
    {
        id: 'crm',
        title: '👥 Customer Management',
        description: 'Track all your customers, conversations, and sales in one place with the built-in CRM.',
        position: 'center'
    },
    {
        id: 'analytics',
        title: '📈 Analytics & Insights',
        description: 'Monitor performance metrics, conversion rates, and revenue trends to optimize your strategy.',
        position: 'center'
    },
    {
        id: 'help',
        title: '❓ Need Help?',
        description: 'Access the Help Center anytime by clicking the help icon or pressing Cmd/Ctrl + ?',
        position: 'center'
    },
    {
        id: 'complete',
        title: '🎉 You\'re All Set!',
        description: 'You\'re ready to start automating your WhatsApp sales. Remember, you can restart this tour anytime from the Help menu.',
        position: 'center'
    }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = TOUR_STEPS[currentStep];
    const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

    useEffect(() => {
        // Prevent body scroll when tour is active
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => {
            localStorage.setItem('shoptet_tour_completed', 'true');
            onComplete();
        }, 300);
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(() => {
            localStorage.setItem('shoptet_tour_skipped', 'true');
            onSkip();
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-in fade-in duration-300" />

            {/* Tour Card */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-700 relative overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                                    <span className="text-blue-300 text-sm font-medium">
                                        Step {currentStep + 1} of {TOUR_STEPS.length}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Skip Tour
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="mb-8 min-h-[200px] flex flex-col justify-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
                                {step.title}
                            </h2>
                            <p className="text-lg text-slate-300 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-100">
                                {step.description}
                            </p>

                            {step.action && (
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-in slide-in-from-bottom-4 duration-500 delay-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="text-blue-400 mt-0.5">
                                            <Icons.Zap />
                                        </div>
                                        <div>
                                            <p className="text-blue-300 font-medium text-sm">Quick Action</p>
                                            <p className="text-blue-200/80 text-sm mt-1">{step.action}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                            <button
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                className="flex items-center space-x-2 px-6 py-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                <Icons.ChevronLeft />
                                <span>Previous</span>
                            </button>

                            <div className="flex space-x-2">
                                {TOUR_STEPS.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentStep(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep
                                                ? 'bg-blue-500 w-8'
                                                : index < currentStep
                                                    ? 'bg-blue-500/50'
                                                    : 'bg-slate-600'
                                            }`}
                                        aria-label={`Go to step ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg transition-all"
                            >
                                <span>{currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OnboardingTour;
