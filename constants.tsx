
import React from 'react';
import { BusinessProfile, Campaign, Customer, Order, Automation, TeamMember, ActivityLog, Template, ApiKey, Ticket, TrainingExample, Review, Appointment, Experiment, AppView, SystemNotification, Transaction, Task, Driver, ComplianceRequest, MediaAsset, AgencySettings, Referral, Coupon, SalesDataPoint, Flow, MessageLog, SandboxParticipant, WhatsAppSender, WebhookEventLog, Ad, SimulatorScenario } from './types';

export const Icons = {
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  MegaphoneSolid: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="16" x="2" y="4" rx="2"/><path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z"/></svg>,
  Inbox: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Contact: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>,
  Puzzle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.439 15.439a5 5 0 0 1-7.071 7.072l-1.414-1.415"></path><path d="M6.439 15.439a5 5 0 0 0-3.536-8.536 5 5 0 0 0-3.535 1.465"></path><path d="M10.561 9.561a5 5 0 0 1 7.071-7.072l1.414 1.415"></path><path d="M17.561 9.561a5 5 0 0 0 3.536 8.536 5 5 0 0 0 3.535-1.465"></path></svg>,
  Workflow: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Tag: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  List: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  LifeBuoy: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>,
  TargetCrosshair: () => <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>,
  Target: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  Layout: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  Gift: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  RotateCcw: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>,
  Ticket: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 21h-2l-3-7h-2l-1 5h-2v-13h2l1 5h2l3-7h2l1 5h2v13h-2l-1-5z"></path></svg>, // Custom representation or use default
  Flask: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 2v7.31"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path></svg>,
  GraduationCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  Smartphone: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>,
  PhoneForwarded: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="19 1 23 5 19 9"></polyline><line x1="15" y1="5" x2="23" y2="5"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  File: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
  BookOpen: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Code: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Briefcase: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Wand: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"></path><path d="M12.5 6.5L10 9"></path><path d="M18 6l2.5-2.5"></path><path d="M6 10l2 2 7-7 2 2-7 7-2-2"></path></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  PhoneMissed: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  PhoneIncoming: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 2 16 8 22 8"></polyline><line x1="23" y1="1" x2="16" y2="8"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Voicemail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="11.5" r="4.5"></circle><circle cx="18.5" cy="11.5" r="4.5"></circle><line x1="5.5" y1="16" x2="18.5" y2="16"></line></svg>,
  DownloadCloud: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  HardDrive: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
};

export const MOCK_BUSINESSES: BusinessProfile[] = [
  {
    id: 'biz_1',
    name: 'CyberPunk Coffee',
    industry: 'Food & Beverage',
    description: 'High-octane caffeine for netrunners. Open 24/7 in Neo-Tokyo.',
    welcomeMessage: 'Wake up, Samurai. What can I brew for you today?',
    products: [
      { id: 'p1', name: 'Neon Espresso', price: 4.50, description: 'A double shot of dark roast with a bioluminescent foam.', inStock: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', category: 'Drinks', salesVelocity: 8, stockLevel: 140 },
      { id: 'p2', name: 'Cyber Mug', price: 25.00, description: 'Thermal insulated mug with LED temperature display.', inStock: true, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80', category: 'Merch', salesVelocity: 2, stockLevel: 45 },
      { id: 'p3', name: 'Glitch Donut', price: 3.50, description: 'Sugar-glazed donut with holographic sprinkles.', inStock: false, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80', category: 'Food', salesVelocity: 12, stockLevel: 0 }
    ],
    salesStrategy: 'friendly',
    policies: 'No refunds on consumed items. Returns accepted for merch within 30 days.',
    twilioNumber: '+14155238886',
    twilioAccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    twilioAuthToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    language: 'English',
    currencySymbol: '$',
    revenue: 12450,
    activeChats: 342,
    businessHours: { enabled: true, timezone: 'UTC', opensAt: '06:00', closesAt: '22:00', closedDays: [0] },
    deliveryRadius: 5,
    metaVerificationStatus: 'verified'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Alice Walker',
    phone: '+15550001111',
    status: 'negotiating',
    totalSpend: 125.50,
    lastActive: Date.now() - 3600000,
    history: [
        { id: 'm1', role: 'user', text: 'Do you have the cyber mug in pink?', timestamp: Date.now() - 86400000 },
        { id: 'm2', role: 'model', text: 'We sure do! Here it is.', product: MOCK_BUSINESSES[0].products[1], timestamp: Date.now() - 86300000 }
    ],
    aiPaused: false,
    optInStatus: 'opted_in',
    tags: ['VIP', 'Coffee Lover'],
    leadScore: 85
  },
  {
    id: 'c2',
    name: 'Bob Builder',
    phone: '+15550002222',
    status: 'closed',
    totalSpend: 450.00,
    lastActive: Date.now() - 120000,
    history: [
        { id: 'm3', role: 'user', text: 'I need to order 50 donuts for an event.', timestamp: Date.now() - 200000 }
    ],
    aiPaused: true,
    optInStatus: 'opted_in',
    tags: ['Corporate'],
    leadScore: 98
  },
  {
    id: 'c3',
    name: 'Charlie Day',
    phone: '+15550003333',
    status: 'lead',
    totalSpend: 0,
    lastActive: Date.now() - 5000,
    history: [],
    aiPaused: false,
    optInStatus: 'pending',
    leadScore: 45
  }
];

export const MOCK_ORDERS: Order[] = [
    { id: 'ord_123', customerId: 'c1', customerName: 'Alice Walker', items: [{...MOCK_BUSINESSES[0].products[0], quantity: 2}], total: 9.00, status: 'completed', timestamp: Date.now() - 86400000 },
    { id: 'ord_124', customerId: 'c2', customerName: 'Bob Builder', items: [{...MOCK_BUSINESSES[0].products[2], quantity: 12}], total: 42.00, status: 'processing', timestamp: Date.now() - 3600000 },
    { id: 'ord_125', customerId: 'c3', customerName: 'Charlie Day', items: [{...MOCK_BUSINESSES[0].products[1], quantity: 1}], total: 25.00, status: 'new', timestamp: Date.now() - 1800000 }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', type: 'payment', amount: 9.00, status: 'completed', date: Date.now() - 86400000, description: 'Order #ord_123' },
    { id: 't2', type: 'payment', amount: 42.00, status: 'completed', date: Date.now() - 3600000, description: 'Order #ord_124' },
    { id: 't3', type: 'payout', amount: -500.00, status: 'completed', date: Date.now() - 172800000, description: 'Weekly Payout' }
];

export const MOCK_TICKETS: Ticket[] = [
    { id: 'tkt_1', customerId: 'c1', customerName: 'Alice Walker', subject: 'Wrong color mug', description: 'I ordered pink but got blue.', status: 'open', priority: 'medium', createdAt: Date.now() - 4000000 }
];

export const MOCK_TASKS: Task[] = [
    { id: 'task_1', title: 'Follow up with Alice', description: 'Check if she likes the new mug', priority: 'high', status: 'todo', dueDate: Date.now() + 86400000, customerId: 'c1', customerName: 'Alice Walker' },
    { id: 'task_2', title: 'Restock Donuts', priority: 'medium', status: 'in_progress', dueDate: Date.now() }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'camp_1', name: 'Morning Brew Blast', status: 'completed', audience: 'All Customers', message: 'Good morning! ☕ Get 20% off espresso till 10am.', stats: { sent: 150, read: 120, replied: 45, converted: 12, revenue: 340 }, createdAt: Date.now() - 604800000 }
];

export const MOCK_AUTOMATIONS: Automation[] = [
    { id: 'auto_1', name: 'Abandoned Cart Recovery', trigger: 'abandoned_cart', steps: [{id:'s1', type:'delay', content:'1 hour'}, {id:'s2', type:'message', content:'Hey, you left coffee in your cart!'}], active: true, stats: { runs: 45, converted: 8 } }
];

export const MOCK_TEAM: TeamMember[] = [
    { id: 'tm_1', name: 'Sarah Connor', email: 'sarah@cyberpunk.coffee', role: 'admin', status: 'active', lastActive: Date.now(), avatar: 'https://i.pravatar.cc/150?u=sarah', metrics: { revenue: 15000, chatsClosed: 450, avgResponseTime: 2, csat: 4.9 }, achievements: ['top_closer', '5_star'] },
    { id: 'tm_2', name: 'John Wick', email: 'john@cyberpunk.coffee', role: 'agent', status: 'active', lastActive: Date.now() - 3600000, avatar: 'https://i.pravatar.cc/150?u=john', metrics: { revenue: 8400, chatsClosed: 320, avgResponseTime: 1, csat: 4.7 }, achievements: ['speed'] }
];

export const MOCK_TEMPLATES: Template[] = [
    { id: 'tpl_1', name: 'order_confirmation', category: 'UTILITY', language: 'en_US', body: 'Your order {{1}} has been confirmed and is being prepared.', status: 'approved', createdAt: Date.now() },
    { id: 'tpl_2', name: 'promo_flash', category: 'MARKETING', language: 'en_US', body: 'Flash Sale! ⚡ Get 50% off {{1}} for the next hour only.', status: 'approved', createdAt: Date.now() }
];

export const MOCK_API_KEYS: ApiKey[] = [
    { id: 'pk_1', name: 'Production Key', prefix: 'pk_live_3948...', created: Date.now() - 30000000, lastUsed: Date.now(), status: 'active' }
];

export const MOCK_TRAINING_EXAMPLES: TrainingExample[] = [
    { id: 'ex_1', trigger: 'Can I pay with crypto?', badResponse: 'No we only take cash.', correction: 'We accept Bitcoin and Ethereum via our secure checkout link.', status: 'pending' }
];

export const MOCK_REVIEWS: Review[] = [
    { id: 'rev_1', customerName: 'Alice Walker', rating: 5, text: 'Best espresso in the city!', productName: 'Neon Espresso', timestamp: Date.now() - 86400000, sentiment: 'positive', status: 'pending' }
];

export const MOCK_EXPERIMENTS: Experiment[] = [
    { id: 'exp_1', name: 'Tone Test', variable: 'Sales Strategy', variantA: 'Friendly', variantB: 'Professional', status: 'running', startDate: Date.now() - 600000, stats: { a: { sessions: 120, conversions: 10, revenue: 450 }, b: { sessions: 115, conversions: 15, revenue: 620 } } }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'apt_1', customerId: 'c1', customerName: 'Alice Walker', serviceName: 'Coffee Tasting', startTime: Date.now() + 86400000, duration: 60, status: 'confirmed' }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
    { id: 'n1', title: 'New Order', message: 'Order #1234 placed by Bob.', type: 'success', timestamp: Date.now(), read: false, link: AppView.ORDERS },
    { id: 'n2', title: 'Stock Alert', message: 'Glitch Donut is out of stock.', type: 'warning', timestamp: Date.now() - 3600000, read: false, link: AppView.INVENTORY }
];

export const MOCK_DRIVERS: Driver[] = [
    { id: 'd1', name: 'Speedy Gonzales', phone: '+15550009999', status: 'idle', activeOrders: 0 },
    { id: 'd2', name: 'Road Runner', phone: '+15550008888', status: 'busy', activeOrders: 2 }
];

export const MOCK_COMPLIANCE_REQUESTS: ComplianceRequest[] = [
    { id: 'req_1', customerName: 'Privacy Advocate', customerPhone: '+15551234567', type: 'delete_data', status: 'pending', requestDate: Date.now() - 86400000 }
];

export const MOCK_MEDIA: MediaAsset[] = [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', name: 'espresso.jpg', type: 'image', size: '2.4 MB', tags: ['coffee', 'product'], createdAt: Date.now() }
];

export const MOCK_SENDERS: WhatsAppSender[] = [
    { id: 's1', phoneNumber: '+14155238886', displayName: 'CyberPunk Main', qualityRating: 'High', messagingLimit: 'Tier 1 (1k/day)', status: 'Connected' }
];

export const MOCK_SANDBOX_PARTICIPANTS: SandboxParticipant[] = [
    { id: 'p1', phone: '+15550001111', joinedAt: Date.now() - 86400000, status: 'active' }
];

export const MOCK_REFERRALS: Referral[] = [
    { id: 'ref_1', referrerName: 'Alice Walker', refereeName: 'Eve Online', status: 'paid', amount: 50, date: Date.now() - 86400000 }
];

export const MOCK_COUPONS: Coupon[] = [
    { id: 'cpn_1', code: 'WELCOME20', type: 'percentage', value: 20, active: true, usageCount: 45, description: 'New user discount' }
];

export const MOCK_ADS: Ad[] = [
    { id: 'ad_1', name: 'Summer Promo', platform: 'instagram', status: 'active', headline: 'Cool off with 20% off', primaryText: 'Best iced coffee in town.', mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', budget: 50, spent: 120, impressions: 5000, clicks: 120, ctr: 2.4, createdAt: Date.now() - 86400000 * 3 }
];

export const MOCK_SCENARIOS: SimulatorScenario[] = [
    {
        id: 'sc_1',
        name: 'New Customer Onboarding',
        description: 'Simulates a brand new user interacting for the first time. Tests welcome message and menu navigation.',
        initialMessages: [
            { id: 'msg_0', role: 'system', text: 'User scanned QR code from Instagram.', timestamp: Date.now(), isSystem: true },
            { id: 'msg_1', role: 'user', text: 'Hi', timestamp: Date.now() }
        ],
        initialCart: []
    },
    {
        id: 'sc_2',
        name: 'Abandoned Cart Recovery',
        description: 'User added items but stopped responding. Tests re-engagement logic.',
        initialMessages: [
            { id: 'msg_0', role: 'user', text: 'I want the Neon Espresso', timestamp: Date.now() - 3600000 },
            { id: 'msg_1', role: 'model', text: 'Great choice! Added to cart.', timestamp: Date.now() - 3590000 }
        ],
        initialCart: [{ id: 'p1', name: 'Neon Espresso', price: 4.50, description: 'Double shot', quantity: 1 }]
    },
    {
        id: 'sc_3',
        name: 'Support Dispute',
        description: 'Angry customer complaining about a late order. Tests sentiment analysis and handover.',
        initialMessages: [
             { id: 'msg_1', role: 'user', text: 'Where is my order? It has been 2 hours!', timestamp: Date.now() }
        ]
    }
];

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
    { id: 'log_1', user: 'System', action: 'Backup Created', target: 'Daily Backup', timestamp: Date.now() - 3600000, type: 'success' },
    { id: 'log_2', user: 'Sarah Connor', action: 'Updated Settings', target: 'AI Configuration', timestamp: Date.now() - 7200000, type: 'info' },
    { id: 'log_3', user: 'John Wick', action: 'Deleted Contact', target: 'Spam User', timestamp: Date.now() - 86400000, type: 'warning' }
];

export const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
    name: 'TwilioFlow',
    primaryColor: '#3b82f6',
    plans: {
        starter: { id: 'p1', name: 'Starter', price: 49, currency: '$', features: ['1 Number', '500 Conversations'] },
        growth: { id: 'p2', name: 'Growth', price: 129, currency: '$', features: ['3 Numbers', 'Unlimited Conversations', 'API Access'] },
        enterprise: { id: 'p3', name: 'Enterprise', price: 499, currency: '$', features: ['Unlimited', 'Dedicated Server', 'SLA'] }
    }
};
