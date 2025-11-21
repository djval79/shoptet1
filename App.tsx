import React, { useState, useEffect } from 'react';
import { AppView, Order, Transaction } from './types';
import { Icons } from './constants';

// Contexts
import { UserProvider, useUser } from './contexts/UserContext';
import { BusinessProvider, useBusiness } from './contexts/BusinessContext';
import { DataProvider, useData } from './contexts/DataContext';

// Components
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import Orders from './components/Orders';
import CRM from './components/CRM';
import Inventory from './components/Inventory';
import Campaigns from './components/Campaigns';
import Automations from './components/Automations';
import Settings from './components/Settings';
import ChatSimulator from './components/ChatSimulator';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Billing from './components/Billing';
import Connect from './components/Connect';
import Integrations from './components/Integrations';
import Team from './components/Team';
import Templates from './components/Templates';
import Knowledge from './components/Knowledge';
import Developer from './components/Developer';
import Tickets from './components/Tickets';
import Reviews from './components/Reviews';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import CommandPalette from './components/CommandPalette';
import Layout from './components/Layout';
import Experiments from './components/Experiments';
import NotificationCenter from './components/NotificationCenter';
import Finance from './components/Finance';
import Tasks from './components/Tasks';
import Logistics from './components/Logistics';
import Legal from './components/Legal';
import MediaLibrary from './components/MediaLibrary';
import Agency from './components/Agency';
import Referrals from './components/Referrals';
import Promotions from './components/Promotions';
import Flows from './components/Flows';
import LandingBuilder from './components/LandingBuilder';
import Ads from './components/Ads';
import Dialer from './components/Dialer';
import IVR from './components/IVR';
import Loyalty from './components/Loyalty';
import Invoices from './components/Invoices';
import Procurement from './components/Procurement';
import POS from './components/POS';
import Surveys from './components/Surveys';
import Subscriptions from './components/Subscriptions';
import SocialPlanner from './components/SocialPlanner';
import Affiliates from './components/Affiliates';
import Returns from './components/Returns';
import Events from './components/Events';
import Scheduling from './components/Scheduling';
import Quotes from './components/Quotes';
import Contracts from './components/Contracts';
import GiftCards from './components/GiftCards';
import Expenses from './components/Expenses';
import OnboardingTour from './components/OnboardingTour';
import HelpCenter from './components/HelpCenter';
import WelcomeScreen from './components/WelcomeScreen';
import TermsModal from './components/TermsModal';
import { Analytics } from "@vercel/analytics/react";

const AppContent: React.FC = () => {
    console.log('AppContent rendering');
    const { user, login, logout, agencySettings, setAgencySettings } = useUser();
    const { businesses, activeBusinessId, setActiveBusinessId, activeBusiness, updateBusiness, addBusiness } = useBusiness();
    const {
        customers, setCustomers,
        orders, setOrders,
        transactions, setTransactions,
        tickets, setTickets,
        tasks, setTasks,
        campaigns, setCampaigns,
        appointments, setAppointments,
        logs, setLogs,
        webhookLogs, setWebhookLogs,
        notifications, setNotifications,
        webhooks, setWebhooks,
        addNotification
    } = useData();

    // Navigation State
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

    // Onboarding State
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Check if user is first-time visitor
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('shoptet_welcome_seen');
        const hasAcceptedTerms = localStorage.getItem('chat2close_terms_accepted');

        if (!hasAcceptedTerms && user) {
            setShowTerms(true);
        } else {
            setTermsAccepted(true);
            if (!hasSeenWelcome && user) {
                setShowWelcome(true);
            }
        }
    }, [user]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + ? to toggle help
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                setShowHelp(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // URL Routing Sync
    useEffect(() => {
        // Handle initial load from URL
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam && Object.values(AppView).includes(viewParam as AppView)) {
            setCurrentView(viewParam as AppView);
        }

        // Handle browser back/forward
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            if (view && Object.values(AppView).includes(view as AppView)) {
                setCurrentView(view as AppView);
            } else {
                setCurrentView(AppView.DASHBOARD);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Update URL when view changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') !== currentView) {
            const newUrl = `${window.location.pathname}?view=${currentView}`;
            window.history.pushState({ view: currentView }, '', newUrl);
        }
    }, [currentView]);

    const handleOrderPlaced = (items: any[], total: number, customerId?: string) => {
        const newOrder: Order = {
            id: `ord_${Date.now()}`,
            customerId: customerId || 'guest',
            customerName: customers.find(c => c.id === customerId)?.name || 'Guest',
            items,
            total,
            status: 'new',
            timestamp: Date.now()
        };
        setOrders(prev => [newOrder, ...prev]);

        // Add Revenue Transaction
        const newTxn: Transaction = {
            id: `txn_${Date.now()}`,
            type: 'payment',
            amount: total,
            status: 'completed',
            date: Date.now(),
            description: `Order #${newOrder.id}`
        };
        setTransactions(prev => [newTxn, ...prev]);

        // Update Business Revenue
        const updatedBiz = { ...activeBusiness, revenue: activeBusiness.revenue + total };
        updateBusiness(updatedBiz);

        addNotification('New Order', `Order #${newOrder.id} for $${total} received.`, 'success', AppView.ORDERS);
    };

    const handleAddBusiness = (newBusiness: any) => {
        addBusiness(newBusiness);
        setCurrentView(AppView.DASHBOARD);
        addNotification('Business Created', `${newBusiness.name} is now active.`, 'success');
    };

    const handleAcceptTerms = () => {
        localStorage.setItem('chat2close_terms_accepted', 'true');
        setTermsAccepted(true);
        setShowTerms(false);

        // Show welcome screen after accepting terms
        const hasSeenWelcome = localStorage.getItem('shoptet_welcome_seen');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
        }
    };

    const handleDeclineTerms = () => {
        // Redirect away or logout
        logout();
    };

    if (!user) {
        return <Auth onLogin={(u) => { login(u); if (u.role === 'owner' && u.name === 'Agency Admin') setCurrentView(AppView.AGENCY); }} />;
    }

    if (currentView === AppView.ONBOARDING) {
        return <Onboarding onComplete={handleAddBusiness} onCancel={() => setCurrentView(AppView.DASHBOARD)} />;
    }

    const renderView = () => {
        switch (currentView) {
            case AppView.DASHBOARD: return <Dashboard businesses={businesses} activeBusinessId={activeBusinessId} />;
            case AppView.INBOX: return <Inbox business={activeBusiness} customers={customers} currentUser={user} onUpdateCustomers={setCustomers} />;
            case AppView.CRM: return <CRM customers={customers} orders={orders} tickets={tickets} campaigns={campaigns} onUpdateCustomers={setCustomers} />;
            case AppView.ORDERS: return <Orders orders={orders} business={activeBusiness} onStatusUpdate={(id, s) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: s } : o))} />;
            case AppView.INVENTORY: return <Inventory business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.CAMPAIGNS: return <Campaigns business={activeBusiness} campaigns={campaigns} customers={customers} onUpdateCampaigns={setCampaigns} />;
            case AppView.AUTOMATIONS: return <Automations business={activeBusiness} />;
            case AppView.SETTINGS: return <Settings business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.SIMULATOR: return <ChatSimulator business={activeBusiness} onOrderConfirmed={handleOrderPlaced} onLogEvent={(l) => setLogs(prev => [l, ...prev])} onWebhookEvent={(l) => setWebhookLogs(prev => [l, ...prev])} onHandover={() => addNotification('Agent Request', 'Customer requested human agent', 'warning', AppView.INBOX)} onBookAppointment={(appt) => setAppointments(prev => [...prev, appt])} />;
            case AppView.BILLING: return <Billing business={activeBusiness} plans={agencySettings.plans} onUpdateBusiness={updateBusiness} />;
            case AppView.CONNECT: return <Connect business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.INTEGRATIONS: return <Integrations business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.TEAM: return <Team business={activeBusiness} />;
            case AppView.TEMPLATES: return <Templates business={activeBusiness} />;
            case AppView.KNOWLEDGE: return <Knowledge business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.DEVELOPER: return <Developer business={activeBusiness} logs={logs} webhookLogs={webhookLogs} onClearLogs={() => { setLogs([]); setWebhookLogs([]); }} webhooks={webhooks} onUpdateWebhooks={setWebhooks} />;
            case AppView.SUPPORT: return <Tickets business={activeBusiness} tickets={tickets} onUpdateTickets={setTickets} />;
            case AppView.REVIEWS: return <Reviews business={activeBusiness} />;
            case AppView.CALENDAR: return <Calendar appointments={appointments} onUpdateAppointments={setAppointments} />;
            case AppView.PROFILE: return <Profile user={user} onUpdateUser={(u) => login(u as any)} onLogout={logout} />;
            case AppView.EXPERIMENTS: return <Experiments business={activeBusiness} />;
            case AppView.FINANCE: return <Finance business={activeBusiness} transactions={transactions} onUpdateTransactions={setTransactions} />;
            case AppView.TASKS: return <Tasks business={activeBusiness} tasks={tasks} customers={customers} orders={orders} onUpdateTasks={setTasks} />;
            case AppView.LOGISTICS: return <Logistics business={activeBusiness} orders={orders} onAssign={(oid, did) => { setOrders(prev => prev.map(o => o.id === oid ? { ...o, assignedDriverId: did } : o)); addNotification('Logistics', 'Driver Assigned', 'info', AppView.LOGISTICS); }} />;
            case AppView.LEGAL: return <Legal business={activeBusiness} />;
            case AppView.MEDIA: return <MediaLibrary />;
            case AppView.AGENCY: return <Agency businesses={businesses} settings={agencySettings} onUpdateSettings={setAgencySettings} />;
            case AppView.REFERRALS: return <Referrals business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.PROMOTIONS: return <Promotions business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.FLOWS: return <Flows business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.LANDING: return <LandingBuilder business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.ADS: return <Ads business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.DIALER: return <Dialer business={activeBusiness} customers={customers} onUpdateCustomer={(c) => setCustomers(prev => prev.map(cust => cust.id === c.id ? c : cust))} />;
            case AppView.IVR: return <IVR business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.LOYALTY: return <Loyalty business={activeBusiness} onUpdate={updateBusiness} />;
            case AppView.INVOICES: return <Invoices business={activeBusiness} customers={customers} />;
            case AppView.PROCUREMENT: return <Procurement business={activeBusiness} onUpdateBusiness={updateBusiness} />;
            case AppView.POS: return <POS business={activeBusiness} customers={customers} onOrderPlaced={(items, total, custId) => handleOrderPlaced(items, total, custId)} />;
            case AppView.SURVEYS: return <Surveys business={activeBusiness} />;
            case AppView.SUBSCRIPTIONS: return <Subscriptions business={activeBusiness} customers={customers} onUpdateBusiness={updateBusiness} />;
            case AppView.SOCIAL: return <SocialPlanner business={activeBusiness} />;
            case AppView.AFFILIATES: return <Affiliates business={activeBusiness} />;
            case AppView.RETURNS: return <Returns business={activeBusiness} />;
            case AppView.EVENTS: return <Events business={activeBusiness} />;
            case AppView.SCHEDULING: return <Scheduling business={activeBusiness} />;
            case AppView.QUOTES: return <Quotes business={activeBusiness} customers={customers} />;
            case AppView.CONTRACTS: return <Contracts business={activeBusiness} customers={customers} />;
            case AppView.GIFT_CARDS: return <GiftCards business={activeBusiness} />;
            case AppView.EXPENSES: return <Expenses business={activeBusiness} />;
            default: return <Dashboard businesses={businesses} activeBusinessId={activeBusinessId} />;
        }
    };

    return (
        <>
            {/* Welcome Screen for First-Time Users */}
            {showWelcome && (
                <WelcomeScreen
                    onStartTour={() => {
                        setShowWelcome(false);
                        setShowTour(true);
                    }}
                    onCreateBusiness={() => {
                        setShowWelcome(false);
                        setCurrentView(AppView.ONBOARDING);
                    }}
                    onSkip={() => setShowWelcome(false)}
                />
            )}

            {/* Onboarding Tour */}
            {showTour && (
                <OnboardingTour
                    onComplete={() => setShowTour(false)}
                    onSkip={() => setShowTour(false)}
                />
            )}

            {/* Terms Modal */}
            {showTerms && (
                <TermsModal
                    onAccept={handleAcceptTerms}
                    onDecline={handleDeclineTerms}
                />
            )}

            {/* Help Center */}
            {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}

            <Layout
                currentView={currentView}
                onNavigate={setCurrentView}
                onOpenHelp={() => setShowHelp(true)}
                onStartTour={() => setShowTour(true)}
            >
                {renderView()}
            </Layout>
        </>
    );
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <BusinessProvider>
                <DataProvider>
                    <AppContent />
                    <Analytics />
                </DataProvider>
            </BusinessProvider>
        </UserProvider>
    );
};

export default App;
