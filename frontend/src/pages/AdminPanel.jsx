import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminPanel({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [sRes, uRes, tRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/tournaments').catch(() => ({ data: [] }))
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setTournaments(tRes.data);
    } catch {
      setNotice({ type: 'error', text: 'Failed to load admin management data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleUser = async (userObj) => {
    try {
      await api.put(`/admin/users/${userObj.id}/status`, { enabled: !userObj.enabled });
      setNotice({
        type: 'success',
        text: `User ${userObj.name} is now ${!userObj.enabled ? 'ENABLED' : 'BLOCKED'}.`
      });
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Failed to update user status.' });
    }
  };

  const handleApproveTournament = async (id) => {
    try {
      await api.put(`/admin/tournaments/${id}/approve`);
      setNotice({ type: 'success', text: 'Tournament approved and set to UPCOMING.' });
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Failed to approve tournament.' });
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    try {
      await api.delete(`/admin/tournaments/${id}`);
      setNotice({ type: 'success', text: 'Tournament removed from platform.' });
      loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Failed to delete tournament.' });
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#a78bfa]">
            Platform Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Admin Center
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Review user accounts, manage tournament permissions, and oversee platform integrity.
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
            notice.type === 'success'
              ? 'bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399]'
              : 'bg-[#f43f5e]/20 border border-[#f43f5e]/50 text-[#fda4af]'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#1e2648] pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          👥 User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'tournaments'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          🛡️ Tournaments Moderation ({tournaments.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Users</span>
              <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
              <span className="text-[11px] text-[#94a3b8]">{stats.playerCount} Players · {stats.organizerCount} Organizers</span>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">All Tournaments</span>
              <div className="text-3xl font-black text-[#00f2fe] mt-1">{stats.totalTournaments}</div>
              <span className="text-[11px] text-[#94a3b8]">{stats.activeTournaments} Active</span>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Pending Approvals</span>
              <div className="text-3xl font-black text-[#f59e0b] mt-1">{stats.pendingTournaments}</div>
              <span className="text-[11px] text-[#94a3b8]">Require Moderator Review</span>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Matches Recorded</span>
              <div className="text-3xl font-black text-[#10b981] mt-1">{stats.totalMatches}</div>
              <span className="text-[11px] text-[#94a3b8]">Platform Fixtures</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Registered Users</h3>
            <input
              type="text"
              placeholder="Search user name, email, role..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="input-custom sm:w-72 text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Access</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b36]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141b36]/30">
                    <td className="py-3 font-bold text-white">{u.name}</td>
                    <td className="py-3 text-[#94a3b8]">{u.email}</td>
                    <td className="py-3">
                      <span className={`badge text-[9px] ${
                        u.role === 'ADMIN' ? 'bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]' :
                        u.role === 'ORGANIZER' ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]' :
                        'bg-[#64748b]/20 text-[#94a3b8] border border-[#334155]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[11px] font-bold ${u.enabled ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {u.enabled ? '● Active' : '✕ Disabled'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUser(u)}
                          className={`btn btn-sm py-1 text-[11px] ${
                            u.enabled ? 'btn-danger' : 'btn-success'
                          }`}
                        >
                          {u.enabled ? 'Block User' : 'Enable User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tournament Moderation */}
      {activeTab === 'tournaments' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">All Tournaments & Approvals</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                  <th className="pb-3">Event Name</th>
                  <th className="pb-3">Game</th>
                  <th className="pb-3">Organizer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b36]">
                {tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-[#141b36]/30">
                    <td className="py-3 font-bold text-white">{t.name}</td>
                    <td className="py-3 text-[#94a3b8]">{t.game}</td>
                    <td className="py-3 text-[#94a3b8]">{t.organizer}</td>
                    <td className="py-3">
                      <span className={`badge text-[9px] ${
                        t.status === 'UPCOMING' ? 'badge-upcoming' :
                        t.status === 'ONGOING' ? 'badge-ongoing' :
                        t.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {t.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveTournament(t.id)}
                          className="btn btn-success btn-sm text-[11px] py-1"
                        >
                          Approve
                        </button>
                      )}
                      <Link to={`/tournaments/${t.id}`} className="btn btn-outline btn-sm text-[11px] py-1">
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        className="btn btn-danger btn-sm text-[11px] py-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
