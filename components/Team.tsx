
import React, { useState } from 'react';
import { BusinessProfile, TeamMember, ActivityLog } from '../types';
import { MOCK_TEAM, MOCK_ACTIVITY_LOG, Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TeamProps {
  business: BusinessProfile;
}

const Team: React.FC<TeamProps> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'performance' | 'audit'>('members');
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM);
  const [logs, setLogs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOG);
  const [isInviting, setIsInviting] = useState(false);
  
  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('agent');

  // Leaderboard sorting
  const sortedByRevenue = [...members].sort((a, b) => (b.metrics?.revenue || 0) - (a.metrics?.revenue || 0));

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: `user_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      lastActive: 0,
      avatar: `https://ui-avatars.com/api/?name=${inviteEmail}&background=random`,
      metrics: { revenue: 0, chatsClosed: 0, avgResponseTime: 0, csat: 0 },
      achievements: []
    };

    setMembers([...members, newMember]);
    
    // Log activity
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      user: 'You',
      action: 'Invited User',
      target: inviteEmail,
      timestamp: Date.now(),
      type: 'info'
    };
    setLogs([newLog, ...logs]);

    // Reset
    setInviteEmail('');
    setIsInviting(false);
  };

  const removeMember = (id: string) => {
    if(window.confirm('Remove this user from the team?')) {
        const member = members.find(m => m.id === id);
        setMembers(members.filter(m => m.id !== id));
        if (member) {
             setLogs([{
                id: `log_${Date.now()}`,
                user: 'You',
                action: 'Removed User',
                target: member.name,
                timestamp: Date.now(),
                type: 'warning'
            }, ...logs]);
        }
    }
  };

  const getRoleBadgeColor = (role: string) => {
      switch(role) {
          case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
          case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          case 'agent': return 'bg-green-500/20 text-green-400 border-green-500/30';
          default: return 'bg-slate-700 text-slate-300';
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white">Team & Performance</h2>
            <p className="text-slate-400">Manage your sales force and track results.</p>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Members
            </button>
            <button 
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'performance' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Leaderboard
            </button>
            <button 
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Audit Log
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Members Tab */}
          {activeTab === 'members' && (
              <div className="flex-1 flex flex-col">
                {isInviting && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 shadow-xl animate-in slide-in-from-top-2">
                        <h3 className="text-white font-bold mb-4">Invite New User</h3>
                        <form onSubmit={handleInvite} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-white outline-none focus:border-blue-500"
                                    placeholder="colleague@company.com"
                                />
                            </div>
                            <div className="w-48">
                                <label className="block text-xs text-slate-400 mb-1">Role</label>
                                <select 
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="agent">Sales Agent</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsInviting(false)} className="px-4 py-2.5 text-slate-400 hover:text-white">Cancel</button>
                                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded font-bold">Send Invite</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-bold text-white text-sm">All Members</h3>
                        <button onClick={() => setIsInviting(true)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center font-medium">
                            <Icons.Plus /> <span className="ml-1">Invite</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Last Active</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {members.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full mr-3 border border-slate-600" />
                                                <div>
                                                    <div className="font-medium text-white">{m.name}</div>
                                                    <div className="text-slate-500 text-xs">{m.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase ${getRoleBadgeColor(m.role)}`}>
                                                {m.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {m.status === 'active' ? (
                                                <span className="flex items-center text-green-400 text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-yellow-400 text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5"></span> Invited
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs font-mono">
                                            {m.lastActive > 0 ? new Date(m.lastActive).toLocaleString() : '--'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {m.role !== 'owner' && (
                                                <button 
                                                    onClick={() => removeMember(m.id)}
                                                    className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                    title="Remove User"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                  {/* Top 3 Podium */}
                  <div className="grid grid-cols-3 gap-4 h-48">
                      {sortedByRevenue.slice(0, 3).map((agent, i) => (
                          <div key={agent.id} className={`relative rounded-xl border p-4 flex flex-col items-center justify-end shadow-lg overflow-hidden ${
                              i === 0 ? 'bg-gradient-to-t from-yellow-900/40 to-slate-800 border-yellow-500/30' :
                              i === 1 ? 'bg-gradient-to-t from-slate-700/40 to-slate-800 border-slate-500/30' :
                              'bg-gradient-to-t from-orange-900/40 to-slate-800 border-orange-500/30'
                          }`}>
                              {/* Rank Badge */}
                              <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white border shadow-md ${
                                  i === 0 ? 'bg-yellow-500 border-yellow-400' :
                                  i === 1 ? 'bg-slate-400 border-slate-300' :
                                  'bg-orange-600 border-orange-500'
                              }`}>
                                  {i + 1}
                              </div>
                              
                              <img src={agent.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-slate-700 shadow-xl mb-3" />
                              <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                              <p className="text-green-400 font-bold font-mono">${agent.metrics?.revenue.toLocaleString()}</p>
                              <div className="flex gap-2 mt-2">
                                  {agent.achievements?.includes('top_closer') && <span title="Top Closer">🏆</span>}
                                  {agent.achievements?.includes('speed') && <span title="Fast Responder">⚡</span>}
                                  {agent.achievements?.includes('5_star') && <span title="5 Star Rating">⭐</span>}
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Leaderboard Table */}
                  <div className="bg-slate-800 rounded-xl border border-slate-700 flex-1 flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                          <h3 className="font-bold text-white">Agent Rankings</h3>
                          <div className="text-xs text-slate-400">This Month</div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left">
                              <thead className="bg-slate-900/30 text-slate-500 text-xs uppercase">
                                  <tr>
                                      <th className="p-4">Rank</th>
                                      <th className="p-4">Agent</th>
                                      <th className="p-4">Revenue</th>
                                      <th className="p-4">Chats Closed</th>
                                      <th className="p-4">Avg Speed</th>
                                      <th className="p-4">CSAT</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-700 text-sm">
                                  {sortedByRevenue.map((agent, i) => (
                                      <tr key={agent.id} className="hover:bg-slate-700/30">
                                          <td className="p-4 font-bold text-slate-400">#{i + 1}</td>
                                          <td className="p-4 font-medium text-white flex items-center">
                                              <img src={agent.avatar} className="w-6 h-6 rounded-full mr-2" alt=""/>
                                              {agent.name}
                                          </td>
                                          <td className="p-4 font-mono text-green-400 font-bold">${agent.metrics?.revenue.toLocaleString()}</td>
                                          <td className="p-4 text-slate-300">{agent.metrics?.chatsClosed}</td>
                                          <td className="p-4 text-slate-300">{agent.metrics?.avgResponseTime}m</td>
                                          <td className="p-4">
                                              <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                                                  (agent.metrics?.csat || 0) >= 4.8 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                              }`}>
                                                  {agent.metrics?.csat} ★
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                      <h3 className="font-bold text-white">System Audit Log</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {logs.map(log => (
                          <div key={log.id} className="flex gap-3 relative group">
                              <div className="flex flex-col items-center">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                      log.type === 'success' ? 'bg-green-500' : 
                                      log.type === 'warning' ? 'bg-yellow-500' : 
                                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                  }`}></div>
                                  <div className="w-0.5 bg-slate-700 flex-1 my-1 group-last:hidden"></div>
                              </div>
                              <div className="pb-4 border-b border-slate-700/50 w-full group-last:border-0">
                                  <div className="flex justify-between">
                                      <p className="text-sm text-white font-medium">
                                          <span className="text-blue-400">{log.user}</span> {log.action}
                                      </p>
                                      <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1 bg-slate-900/30 px-2 py-1 rounded inline-block">
                                      Target: {log.target}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Team;
