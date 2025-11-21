import React, { createContext, useContext, ReactNode } from 'react';
import { Customer, Order, Transaction, Ticket, Task, Campaign, Appointment, MessageLog, WebhookEventLog, SystemNotification, Webhook } from '../types';
import { MOCK_CUSTOMERS, MOCK_ORDERS, MOCK_TRANSACTIONS, MOCK_TICKETS, MOCK_TASKS, MOCK_CAMPAIGNS, MOCK_APPOINTMENTS, MOCK_NOTIFICATIONS } from '../constants';
import { usePersistedState } from '../hooks/usePersistedState';

interface DataContextType {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    logs: MessageLog[];
    setLogs: React.Dispatch<React.SetStateAction<MessageLog[]>>;
    webhookLogs: WebhookEventLog[];
    setWebhookLogs: React.Dispatch<React.SetStateAction<WebhookEventLog[]>>;
    notifications: SystemNotification[];
    setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
    webhooks: Webhook[];
    setWebhooks: React.Dispatch<React.SetStateAction<Webhook[]>>;
    addNotification: (title: string, message: string, type?: SystemNotification['type'], link?: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = usePersistedState<Customer[]>('shoptet_customers', MOCK_CUSTOMERS);
    const [orders, setOrders] = usePersistedState<Order[]>('shoptet_orders', MOCK_ORDERS);
    const [transactions, setTransactions] = usePersistedState<Transaction[]>('shoptet_transactions', MOCK_TRANSACTIONS);
    const [tickets, setTickets] = usePersistedState<Ticket[]>('shoptet_tickets', MOCK_TICKETS);
    const [tasks, setTasks] = usePersistedState<Task[]>('shoptet_tasks', MOCK_TASKS);
    const [campaigns, setCampaigns] = usePersistedState<Campaign[]>('shoptet_campaigns', MOCK_CAMPAIGNS);
    const [appointments, setAppointments] = usePersistedState<Appointment[]>('shoptet_appointments', MOCK_APPOINTMENTS);
    const [logs, setLogs] = usePersistedState<MessageLog[]>('shoptet_logs', []);
    const [webhookLogs, setWebhookLogs] = usePersistedState<WebhookEventLog[]>('shoptet_webhook_logs', []);
    const [notifications, setNotifications] = usePersistedState<SystemNotification[]>('shoptet_notifications', MOCK_NOTIFICATIONS);
    const [webhooks, setWebhooks] = usePersistedState<Webhook[]>('shoptet_webhooks', []);

    const addNotification = (title: string, message: string, type: SystemNotification['type'] = 'info', link?: any) => {
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

    return (
        <DataContext.Provider value={{
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
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
