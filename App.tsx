
import React, { useState, useEffect } from 'react';
import { BusinessProfile, Customer, Order, Transaction, Ticket, Task, Campaign, User, AppView, MessageLog, WebhookEventLog, SalesDataPoint, SystemNotification, Webhook, Appointment, AgencySettings } from './types';
import { Icons, MOCK_BUSINESSES, MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_TASKS, MOCK_CAMPAIGNS, DEFAULT_AGENCY_SETTINGS, MOCK_APPOINTMENTS, MOCK_NOTIFICATIONS } from './constants';

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

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // Data State
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(MOCK_BUSINESSES);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(MOCK_BUSINESSES[0].id);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookEventLog[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  
  // Agency State
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(DEFAULT_AGENCY_SETTINGS);

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0];

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

  // Notification Helper
  const addNotification = (title: string, message: string, type: SystemNotification['type'] = 'info', link?: AppView) => {
      const newNotif: SystemNotification = {
          id: `notif_${Date.now()}`,
          title,
          message,
          type,
          timestamp: Date.now(),
          read: false,
          link
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'owner' && loggedInUser.name === 'Agency Admin') {
        setCurrentView(AppView.AGENCY);
    }
  };

  const handleLogout = () => {
      setUser(null);
      setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateBusiness = (updated: BusinessProfile) => {
      setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
  };
  
  const handleAddBusiness = (newBusiness: BusinessProfile) => {
      setBusinesses([...businesses, newBusiness]);
      setActiveBusinessId(newBusiness.id);
      setCurrentView(AppView.DASHBOARD);
      addNotification('Business Created', `${newBusiness.name} is now active.`, 'success');
  };

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
      setOrders([newOrder, ...orders]);
      
      // Add Revenue Transaction
      const newTxn: Transaction = {
          id: `txn_${Date.now()}`,
          type: 'payment',
          amount: total,
          status: 'completed',
          date: Date.now(),
          description: `Order #${newOrder.id}`
      };
      setTransactions([newTxn, ...transactions]);
      
      // Update Business Revenue
      const updatedBiz = { ...activeBusiness, revenue: activeBusiness.revenue + total };
      handleUpdateBusiness(updatedBiz);

      addNotification('New Order', `Order #${newOrder.id} for $${total} received.`, 'success', AppView.ORDERS);
  };

  if (!user) {
      return <Auth onLogin={handleLogin} />;
  }

  if (currentView === AppView.ONBOARDING) {
      return <Onboarding onComplete={handleAddBusiness} onCancel={() => setCurrentView(AppView.DASHBOARD)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard businesses={businesses} activeBusinessId={activeBusinessId} salesData={[{name: 'Today', revenue: activeBusiness.revenue, conversations: activeBusiness.activeChats}]} />;
      case AppView.INBOX: return <Inbox business={activeBusiness} customers={customers} currentUser={user} onUpdateCustomers={setCustomers} />;
      case AppView.CRM: return <CRM customers={customers} orders={orders} tickets={tickets} campaigns={campaigns} onUpdateCustomers={setCustomers} />;
      case AppView.ORDERS: return <Orders orders={orders} business={activeBusiness} onStatusUpdate={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} />;
      case AppView.INVENTORY: return <Inventory business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.CAMPAIGNS: return <Campaigns business={activeBusiness} campaigns={campaigns} customers={customers} onUpdateCampaigns={setCampaigns} />;
      case AppView.AUTOMATIONS: return <Automations business={activeBusiness} />;
      case AppView.SETTINGS: return <Settings business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.SIMULATOR: return <ChatSimulator business={activeBusiness} onOrderConfirmed={handleOrderPlaced} onLogEvent={(l) => setLogs(prev => [l, ...prev])} onWebhookEvent={(l) => setWebhookLogs(prev => [l, ...prev])} onHandover={() => addNotification('Agent Request', 'Customer requested human agent', 'warning', AppView.INBOX)} onBookAppointment={(appt) => setAppointments(prev => [...prev, appt])} />;
      case AppView.BILLING: return <Billing business={activeBusiness} plans={agencySettings.plans} onUpdateBusiness={handleUpdateBusiness} />;
      case AppView.CONNECT: return <Connect business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.INTEGRATIONS: return <Integrations business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.TEAM: return <Team business={activeBusiness} />;
      case AppView.TEMPLATES: return <Templates business={activeBusiness} />;
      case AppView.KNOWLEDGE: return <Knowledge business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.DEVELOPER: return <Developer business={activeBusiness} logs={logs} webhookLogs={webhookLogs} onClearLogs={() => { setLogs([]); setWebhookLogs([]); }} webhooks={webhooks} onUpdateWebhooks={setWebhooks} />;
      case AppView.SUPPORT: return <Tickets business={activeBusiness} tickets={tickets} onUpdateTickets={setTickets} />;
      case AppView.REVIEWS: return <Reviews business={activeBusiness} />;
      case AppView.CALENDAR: return <Calendar appointments={appointments} onUpdateAppointments={setAppointments} />;
      case AppView.PROFILE: return <Profile user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
      case AppView.EXPERIMENTS: return <Experiments business={activeBusiness} />;
      case AppView.FINANCE: return <Finance business={activeBusiness} transactions={transactions} onUpdateTransactions={setTransactions} />;
      case AppView.TASKS: return <Tasks business={activeBusiness} tasks={tasks} onUpdateTasks={setTasks} />;
      case AppView.LOGISTICS: return <Logistics business={activeBusiness} orders={orders} onAssign={(oid, did) => { setOrders(prev => prev.map(o => o.id === oid ? {...o, assignedDriverId: did} : o)); addNotification('Logistics', 'Driver Assigned', 'info', AppView.LOGISTICS); }} />;
      case AppView.LEGAL: return <Legal business={activeBusiness} />;
      case AppView.MEDIA: return <MediaLibrary />;
      case AppView.AGENCY: return <Agency businesses={businesses} settings={agencySettings} onUpdateSettings={setAgencySettings} />;
      case AppView.REFERRALS: return <Referrals business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.PROMOTIONS: return <Promotions business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.FLOWS: return <Flows business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.LANDING: return <LandingBuilder business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.ADS: return <Ads business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.DIALER: return <Dialer business={activeBusiness} customers={customers} onUpdateCustomer={(c) => setCustomers(prev => prev.map(cust => cust.id === c.id ? c : cust))} />;
      case AppView.IVR: return <IVR business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.LOYALTY: return <Loyalty business={activeBusiness} onUpdate={handleUpdateBusiness} />;
      case AppView.INVOICES: return <Invoices business={activeBusiness} customers={customers} />;
      case AppView.PROCUREMENT: return <Procurement business={activeBusiness} onUpdateBusiness={handleUpdateBusiness} />;
      case AppView.POS: return <POS business={activeBusiness} customers={customers} onOrderPlaced={(items, total, custId) => handleOrderPlaced(items, total, custId)} />;
      case AppView.SURVEYS: return <Surveys business={activeBusiness} />;
      case AppView.SUBSCRIPTIONS: return <Subscriptions business={activeBusiness} customers={customers} onUpdateBusiness={handleUpdateBusiness} />;
      case AppView.SOCIAL: return <SocialPlanner business={activeBusiness} />;
      case AppView.AFFILIATES: return <Affiliates business={activeBusiness} />;
      case AppView.RETURNS: return <Returns business={activeBusiness} />;
      case AppView.EVENTS: return <Events business={activeBusiness} />;
      case AppView.SCHEDULING: return <Scheduling business={activeBusiness} />;
      case AppView.QUOTES: return <Quotes business={activeBusiness} customers={customers} />;
      case AppView.CONTRACTS: return <Contracts business={activeBusiness} customers={customers} />;
      case AppView.GIFT_CARDS: return <GiftCards business={activeBusiness} />;
      case AppView.EXPENSES: return <Expenses business={activeBusiness} />;
      default: return <Dashboard businesses={businesses} activeBusinessId={activeBusinessId} salesData={[{name: 'Today', revenue: activeBusiness.revenue, conversations: activeBusiness.activeChats}]} />;
    }
  };

  const NavItem = ({ view, icon, label, badge }: { view: AppView, icon: React.ReactNode, label: string, badge?: number }) => (
      <button 
        onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
            currentView === view 
            ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white shadow-lg shadow-blue-900/20' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
          <span className={`text-lg ${currentView === view ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
          <span className="text-sm font-medium flex-1 text-left">{label}</span>
          {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span> : null}
      </button>
  );

  const NavCategory = ({ title, children }: { title: string, children?: React.ReactNode }) => (
      <div className="mb-2">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</div>
          <div className="space-y-0.5">{children}</div>
      </div>
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
      <CommandPalette 
        isOpen={isCmdPaletteOpen} 
        onClose={() => setIsCmdPaletteOpen(false)} 
        onNavigate={setCurrentView} 
        data={{ customers, orders, products: activeBusiness.products }}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <span className="text-white font-bold text-lg">⚡</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none text-white tracking-tight" style={{color: agencySettings.primaryColor}}>{agencySettings.name}</h1>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Enterprise</p>
                </div>
            </div>
            <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>

        <div className="p-3 border-b border-slate-800">
            <div className="relative">
                <select 
                    value={activeBusinessId}
                    onChange={(e) => { setActiveBusinessId(e.target.value); setCurrentView(AppView.DASHBOARD); }}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 pl-9 outline-none focus:border-blue-500 appearance-none cursor-pointer font-medium"
                >
                    {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    <option value="new">+ New Business</option>
                </select>
                <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><Icons.Store /></div>
                <div className="absolute right-3 top-3 text-slate-500 pointer-events-none text-[10px]">▼</div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar space-y-6">
            <NavCategory title="Command Center">
                <NavItem view={AppView.DASHBOARD} icon={<Icons.TrendingUp />} label="Dashboard" />
                <NavItem view={AppView.INBOX} icon={<Icons.Inbox />} label="Unified Inbox" badge={5} />
                <NavItem view={AppView.TASKS} icon={<Icons.List />} label="Tasks" badge={tasks.filter(t => t.status === 'todo').length} />
                <NavItem view={AppView.CALENDAR} icon={<Icons.Calendar />} label="Calendar" />
            </NavCategory>

            <NavCategory title="Sales & CRM">
                <NavItem view={AppView.CRM} icon={<Icons.Users />} label="CRM & Leads" />
                <NavItem view={AppView.ORDERS} icon={<Icons.Package />} label="Orders" badge={orders.filter(o => o.status === 'new').length} />
                <NavItem view={AppView.POS} icon={<Icons.CreditCard />} label="Point of Sale" />
                <NavItem view={AppView.QUOTES} icon={<Icons.FileText />} label="Quotes" />
                <NavItem view={AppView.CONTRACTS} icon={<Icons.FileText />} label="Contracts" />
                <NavItem view={AppView.INVOICES} icon={<Icons.FileText />} label="Invoices" />
                <NavItem view={AppView.SUBSCRIPTIONS} icon={<Icons.Activity />} label="Subscriptions" />
            </NavCategory>

            <NavCategory title="Growth & Marketing">
                <NavItem view={AppView.CAMPAIGNS} icon={<Icons.MegaphoneSolid />} label="Broadcasts" />
                <NavItem view={AppView.AUTOMATIONS} icon={<Icons.Workflow />} label="Automations" />
                <NavItem view={AppView.ADS} icon={<Icons.Target />} label="Ads Manager" />
                <NavItem view={AppView.SOCIAL} icon={<Icons.Share />} label="Social Planner" />
                <NavItem view={AppView.LANDING} icon={<Icons.Layout />} label="Storefront" />
                <NavItem view={AppView.DIALER} icon={<Icons.Phone />} label="Power Dialer" />
                <NavItem view={AppView.REFERRALS} icon={<Icons.Users />} label="Referrals" />
                <NavItem view={AppView.LOYALTY} icon={<Icons.Star />} label="Loyalty" />
                <NavItem view={AppView.AFFILIATES} icon={<Icons.Users />} label="Partners" />
                <NavItem view={AppView.GIFT_CARDS} icon={<Icons.Gift />} label="Gift Cards" />
            </NavCategory>

            <NavCategory title="Operations">
                <NavItem view={AppView.INVENTORY} icon={<Icons.Grid />} label="Inventory" />
                <NavItem view={AppView.LOGISTICS} icon={<Icons.Map />} label="Logistics" />
                <NavItem view={AppView.PROCUREMENT} icon={<Icons.Truck />} label="Procurement" />
                <NavItem view={AppView.RETURNS} icon={<Icons.RotateCcw />} label="Returns (RMA)" />
                <NavItem view={AppView.SCHEDULING} icon={<Icons.Clock />} label="Staff Roster" />
                <NavItem view={AppView.EVENTS} icon={<Icons.Ticket />} label="Events" />
                <NavItem view={AppView.SUPPORT} icon={<Icons.LifeBuoy />} label="Helpdesk" badge={tickets.filter(t => t.status === 'open').length} />
                <NavItem view={AppView.EXPENSES} icon={<Icons.FileText />} label="Expenses" />
            </NavCategory>

            <NavCategory title="Intelligence">
                <NavItem view={AppView.SIMULATOR} icon={<Icons.MessageSquare />} label="AI Simulator" />
                <NavItem view={AppView.EXPERIMENTS} icon={<Icons.Flask />} label="A/B Testing" />
                <NavItem view={AppView.REVIEWS} icon={<Icons.Star />} label="Reputation" />
                <NavItem view={AppView.SURVEYS} icon={<Icons.Activity />} label="Surveys (NPS)" />
                <NavItem view={AppView.TRAINING} icon={<Icons.GraduationCap />} label="AI Training" />
                <NavItem view={AppView.MEDIA} icon={<Icons.Image />} label="Media Studio" />
            </NavCategory>

            <NavCategory title="Configuration">
                <NavItem view={AppView.SETTINGS} icon={<Icons.Settings />} label="Settings" />
                <NavItem view={AppView.TEAM} icon={<Icons.User />} label="Team" />
                <NavItem view={AppView.CONNECT} icon={<Icons.Link />} label="Connect" />
                <NavItem view={AppView.FLOWS} icon={<Icons.Smartphone />} label="Flows" />
                <NavItem view={AppView.IVR} icon={<Icons.PhoneForwarded />} label="IVR Voice" />
                <NavItem view={AppView.TEMPLATES} icon={<Icons.File />} label="Templates" />
                <NavItem view={AppView.KNOWLEDGE} icon={<Icons.BookOpen />} label="Knowledge" />
                <NavItem view={AppView.LEGAL} icon={<Icons.Shield />} label="Legal" />
                <NavItem view={AppView.INTEGRATIONS} icon={<Icons.Puzzle />} label="Integrations" />
                <NavItem view={AppView.DEVELOPER} icon={<Icons.Code />} label="Developer" />
                <NavItem view={AppView.BILLING} icon={<Icons.CreditCard />} label="Billing" />
                {user.role === 'owner' && <NavItem view={AppView.AGENCY} icon={<Icons.Briefcase />} label="Agency Admin" />}
            </NavCategory>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-[#080c17]">
            <div className="flex items-center cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors group" onClick={() => setCurrentView(AppView.PROFILE)}>
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 group-hover:border-slate-500">
                       {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt=""/> : user.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b1120]"></div>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="text-slate-500 group-hover:text-white transition-colors"><Icons.Settings /></div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#0b1120] border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400"><Icons.Menu /></button>
                <span className="font-bold text-white">{activeBusiness.name}</span>
            </div>
            <div className="flex items-center space-x-3">
                <NotificationCenter 
                    notifications={notifications} 
                    onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
                    onClearAll={() => setNotifications([])}
                    onNavigate={setCurrentView}
                />
            </div>
        </div>

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
                     <Icons.Search />
                     <span className="ml-2 flex-1">Search...</span>
                     <span className="bg-slate-700 px-1.5 rounded border border-slate-600 font-mono text-[10px]">⌘K</span>
                 </div>
                 
                 <div className="h-6 w-px bg-slate-800 mx-2"></div>

                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative" title="Help">
                     <Icons.LifeBuoy />
                 </button>
                 
                 <NotificationCenter 
                    notifications={notifications} 
                    onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
                    onClearAll={() => setNotifications([])}
                    onNavigate={setCurrentView}
                />
             </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-hidden relative bg-[#0f172a]">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                {renderView()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
