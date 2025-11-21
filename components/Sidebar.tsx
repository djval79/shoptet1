import React from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';
import { useUser } from '../contexts/UserContext';
import { useBusiness } from '../contexts/BusinessContext';
import { useData } from '../contexts/DataContext';

interface SidebarProps {
    currentView: AppView;
    onNavigate: (view: AppView) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
    onOpenHelp?: () => void;
    onStartTour?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileOpen, onMobileClose, onOpenHelp, onStartTour }) => {
    const { user, agencySettings } = useUser();
    const { businesses, activeBusinessId, setActiveBusinessId } = useBusiness();
    const { tasks, orders, tickets } = useData();

    const NavItem = ({ view, icon, label, badge }: { view: AppView, icon: React.ReactNode, label: string, badge?: number }) => (
        <button
            onClick={() => { onNavigate(view); onMobileClose(); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group mb-0.5 ${currentView === view
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
        >
            <span className={`text-lg ${currentView === view ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
            <span className="text-sm font-medium flex-1 text-left">{label}</span>
            {badge ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span> : null}
        </button>
    );

    const NavCategory = ({ title, children }: { title: string, children?: React.ReactNode }) => (
        <div className="mb-4">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">{title}</div>
            <div className="space-y-0.5">{children}</div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onMobileClose}></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col h-full transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Header / Logo */}
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Icons.Zap className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none text-white tracking-tight">Chat2Close</h1>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Enterprise</p>
                        </div>
                    </div>
                    <button className="lg:hidden text-slate-400" onClick={onMobileClose}>✕</button>
                </div>

                {/* Business Switcher */}
                <div className="px-3 mb-2">
                    <div className="relative group">
                        <select
                            value={activeBusinessId}
                            onChange={(e) => { setActiveBusinessId(e.target.value); onNavigate(AppView.DASHBOARD); }}
                            className="w-full bg-[#1e293b] border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 pl-9 outline-none focus:border-blue-500 appearance-none cursor-pointer font-medium transition-colors hover:border-slate-600"
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            <option value="new">+ New Business</option>
                        </select>
                        <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><Icons.Store className="w-4 h-4" /></div>
                        <div className="absolute right-3 top-3 text-slate-500 pointer-events-none text-[10px]">▼</div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar space-y-6">
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
                        {user?.role === 'owner' && <NavItem view={AppView.AGENCY} icon={<Icons.Briefcase />} label="Agency Admin" />}
                    </NavCategory>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800 bg-[#080c17]">
                    <div className="flex items-center cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors group" onClick={() => onNavigate(AppView.PROFILE)}>
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 group-hover:border-slate-500">
                                {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="" /> : user?.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b1120]"></div>
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="text-slate-500 group-hover:text-white transition-colors"><Icons.Settings className="w-4 h-4" /></div>
                    </div>

                    {/* Help & Tour Buttons */}
                    {(onOpenHelp || onStartTour) && (
                        <div className="flex gap-2 mt-3">
                            {onOpenHelp && (
                                <button
                                    onClick={onOpenHelp}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
                                    title="Help & Support"
                                >
                                    <Icons.LifeBuoy className="w-4 h-4" />
                                    <span>Help</span>
                                </button>
                            )}
                            {onStartTour && (
                                <button
                                    onClick={onStartTour}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-xs font-medium"
                                    title="Start Product Tour"
                                >
                                    <Icons.Play className="w-4 h-4" />
                                    <span>Tour</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
