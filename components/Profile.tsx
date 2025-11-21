
import React, { useState } from 'react';
import { User } from '../types';
import { Icons } from '../constants';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications'>('general');
  
  // Form State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(user.avatar);
  
  // Preferences State
  const [emailAlerts, setEmailAlerts] = useState(user.preferences?.emailAlerts ?? true);
  const [smsAlerts, setSmsAlerts] = useState(user.preferences?.smsAlerts ?? false);
  const [dailyDigest, setDailyDigest] = useState(user.preferences?.dailyDigest ?? true);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const updatedUser: User = {
        ...user,
        name,
        email,
        avatar,
        preferences: {
            emailAlerts,
            smsAlerts,
            dailyDigest
        }
    };
    
    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
          <p className="text-slate-400">Manage your personal profile and preferences.</p>
        </div>
        <button 
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
            Sign Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex flex-col space-y-2">
              <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                  <Icons.User /> <span className="ml-3">General</span>
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                  <Icons.Shield /> <span className="ml-3">Security</span>
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                  <Icons.Bell /> <span className="ml-3">Notifications</span>
              </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
              {activeTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center space-x-6 pb-6 border-b border-slate-700">
                          <div className="relative group cursor-pointer">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold overflow-hidden border-4 border-slate-700">
                                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : name.charAt(0)}
                              </div>
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-white text-xs font-bold">Change</span>
                              </div>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white">{user.name}</h3>
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold uppercase border border-blue-500/30 mt-1">
                                  {user.plan} Plan
                              </span>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">Display Name</label>
                              <input 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                              <input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">Avatar URL</label>
                              <input 
                                value={avatar || ''}
                                onChange={e => setAvatar(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500 text-sm"
                              />
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'security' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <h3 className="text-lg font-bold text-white mb-4">Password & Security</h3>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">Current Password</label>
                              <input 
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                              />
                          </div>
                          <div>
                              <label className="block text-slate-400 text-sm mb-2">New Password</label>
                              <input 
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-blue-500"
                              />
                          </div>
                      </div>

                      <div className="pt-6 border-t border-slate-700">
                          <div className="flex items-center justify-between">
                              <div>
                                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                                  <p className="text-slate-400 text-xs">Add an extra layer of security to your account.</p>
                              </div>
                              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer"></label>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'notifications' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <h3 className="text-lg font-bold text-white mb-4">Alert Preferences</h3>
                      
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                              <div>
                                  <h4 className="text-white font-medium">Email Notifications</h4>
                                  <p className="text-slate-400 text-xs">Receive updates on new orders and support tickets.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                              <div>
                                  <h4 className="text-white font-medium">SMS Alerts</h4>
                                  <p className="text-slate-400 text-xs">Get urgent alerts via text message.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                              <div>
                                  <h4 className="text-white font-medium">Daily Digest</h4>
                                  <p className="text-slate-400 text-xs">A daily summary of your sales performance.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={dailyDigest} onChange={e => setDailyDigest(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                          </div>
                      </div>
                  </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all flex items-center"
                  >
                      {isSaved ? 'Changes Saved!' : 'Save Preferences'}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;
