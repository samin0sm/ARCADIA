import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [organizerStats, setOrganizerStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [myTournaments, setMyTournaments] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [orgTournaments, setOrgTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    if (!user) return;

    if (user.role === 'PLAYER') {
      Promise.all([
        api.get('/players/profile').catch(() => ({ data: null })),
        api.get('/players/tournaments').catch(() => ({ data: [] })),
        api.get('/players/matches').catch(() => ({ data: [] }))
      ]).then(([pRes, tRes, mRes]) => {
        setProfile(pRes.data);
        setMyTournaments(tRes.data);
        setMyMatches(mRes.data);
        setLoading(false);
      });
    } else if (user.role === 'ORGANIZER') {
      Promise.all([
        api.get('/tournaments/dashboard-stats').catch(() => ({ data: null })),
        api.get('/tournaments/organizer').catch(() => ({ data: [] }))
      ]).then(([sRes, tRes]) => {
        setOrganizerStats(sRes.data);
        setOrgTournaments(tRes.data);
        setLoading(false);
      });
    } else if (user.role === 'ADMIN') {
      Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/tournaments/organizer').catch(() => ({ data: [] }))
      ]).then(([sRes, tRes]) => {
        setAdminStats(sRes.data);
        setOrgTournaments(tRes.data);
        setLoading(false);
      });
    }
  }, [user, refreshUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Command Center Header */}
      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              {user?.role} Command Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Welcome back, {user?.name || user?.username || user?.email?.split('@')[0]}
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              {user?.role === 'PLAYER'
                ? 'Track your tournament progress, ranking points, and crypto token rewards.'
                : user?.role === 'ORGANIZER'
                ? 'Manage your gaming events, bracket pairings, and match results.'
                : 'Control platform users, approve tournaments, and view system health.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'PLAYER' && (
              <Link to="/tournaments" className="btn btn-cyan btn-sm font-bold">
                ⚡ Join Tournaments
              </Link>
            )}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Link to="/create" className="btn btn-primary btn-sm font-bold">
                + Create Tournament
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* PLAYER DASHBOARD VIEW */}
      {user?.role === 'PLAYER' && (
        <>
          {/* Stats Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Token Balance</span>
              <div className="text-3xl font-black text-[#f59e0b] mt-1 flex items-center gap-2">
                <span>🪙</span>
                <span>{profile?.tokenBalance ?? user?.tokenBalance ?? 0}</span>
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Ranking Points</span>
              <div className="text-3xl font-black text-[#00f2fe] mt-1">
                {profile?.rankingPoints ?? 0} PTS
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Win Record</span>
              <div className="text-3xl font-black text-[#10b981] mt-1">
                {profile?.wins ?? 0}W <span className="text-sm font-normal text-[#94a3b8]">/ {profile?.losses ?? 0}L</span>
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Matches</span>
              <div className="text-3xl font-black text-white mt-1">
                {profile?.totalMatches ?? 0}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/my-tournaments" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">🏆</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">My Tournaments</h3>
              <p className="text-xs text-[#94a3b8] mt-1">View registered events & brackets</p>
            </Link>
            <Link to="/matches" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">⚔️</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Match History</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Check past results & scores</p>
            </Link>
            <Link to="/rewards" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">🪙</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Token Wallet</h3>
              <p className="text-xs text-[#94a3b8] mt-1">View tournament win transaction log</p>
            </Link>
            <Link to="/profile" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">👤</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Gamer Profile</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Edit gamer tag & favorite games</p>
            </Link>
          </div>

          {/* Joined Tournaments Section */}
          <div className="glass-panel p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Registered Tournaments</h3>
              <Link to="/my-tournaments" className="text-xs font-bold text-[#8b5cf6] hover:text-[#a78bfa]">
                View All ({myTournaments.length}) →
              </Link>
            </div>

            {myTournaments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myTournaments.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    to={`/tournaments/${t.id}`}
                    className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] hover:border-[#8b5cf6] transition-all"
                  >
                    <span className="text-xs font-bold text-[#8b5cf6]">{t.game}</span>
                    <h4 className="font-bold text-white text-base mt-1 truncate">{t.name}</h4>
                    <span className="badge badge-upcoming text-[10px] mt-2">{t.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#94a3b8] text-xs">
                You haven't joined any tournaments yet.{' '}
                <Link to="/tournaments" className="text-[#00f2fe] font-bold">
                  Browse open tournaments →
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ORGANIZER DASHBOARD VIEW */}
      {user?.role === 'ORGANIZER' && (
        <>
          {/* Organizer Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Hosted Events</span>
              <div className="text-3xl font-black text-white mt-1">
                {organizerStats?.hostedTournaments ?? orgTournaments.length ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Signups</span>
              <div className="text-3xl font-black text-[#00f2fe] mt-1">
                {organizerStats?.totalRegistrations ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Approved Players</span>
              <div className="text-3xl font-black text-[#10b981] mt-1">
                {organizerStats?.approvedPlayers ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Scheduled Matches</span>
              <div className="text-3xl font-black text-[#a78bfa] mt-1">
                {organizerStats?.scheduledMatches ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Completed Matches</span>
              <div className="text-3xl font-black text-[#f59e0b] mt-1">
                {organizerStats?.completedMatches ?? 0}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/create" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">➕</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Create Tournament</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Publish a new competition</p>
            </Link>
            <Link to="/manage-tournaments" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">📋</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Manage Events</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Approve registrations & generate pairings</p>
            </Link>
            <Link to="/manage-matches" className="glass-panel p-5 hover:border-[#8b5cf6] transition-all group">
              <span className="text-2xl mb-2 block">⚔️</span>
              <h3 className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">Score & Result Entry</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Submit match results & crown winners</p>
            </Link>
          </div>

          {/* Hosted Tournaments List */}
          <div className="glass-panel p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Your Hosted Tournaments</h3>
              <Link to="/create" className="btn btn-primary btn-sm text-xs">
                + New Event
              </Link>
            </div>

            {orgTournaments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                      <th className="pb-3">Tournament Name</th>
                      <th className="pb-3">Game</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Registrations</th>
                      <th className="pb-3">Matches</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141b36]">
                    {orgTournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-[#141b36]/30">
                        <td className="py-3 font-bold text-white">{t.name}</td>
                        <td className="py-3 text-[#94a3b8]">{t.gameName}</td>
                        <td className="py-3">
                          <span className={`badge text-[10px] ${
                            t.status === 'UPCOMING' ? 'badge-upcoming' :
                            t.status === 'ONGOING' ? 'badge-ongoing' :
                            t.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#94a3b8]">
                          {t.approvedCount ?? 0} approved / {t.registeredCount ?? 0} total
                        </td>
                        <td className="py-3 text-[#94a3b8]">
                          {t.completedMatchCount ?? 0} / {t.matchCount ?? 0} done
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <Link to={`/tournaments/${t.id}`} className="btn btn-outline btn-sm py-1 text-xs">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#94a3b8] text-xs">
                You haven't hosted any tournaments yet.{' '}
                <Link to="/create" className="text-[#00f2fe] font-bold">
                  Host your first tournament now →
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {user?.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Users</span>
              <div className="text-3xl font-black text-white mt-1">
                {adminStats?.totalUsers ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Tournaments</span>
              <div className="text-3xl font-black text-[#00f2fe] mt-1">
                {adminStats?.totalTournaments ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Pending Approvals</span>
              <div className="text-3xl font-black text-[#f59e0b] mt-1">
                {adminStats?.pendingTournaments ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Matches</span>
              <div className="text-3xl font-black text-[#10b981] mt-1">
                {adminStats?.totalMatches ?? '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/users" className="glass-panel p-6 hover:border-[#8b5cf6] transition-all group">
              <span className="text-3xl mb-2 block">👥</span>
              <h3 className="text-xl font-bold text-white group-hover:text-[#00f2fe] transition-colors">User Management</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Enable, disable, and review user accounts and roles</p>
            </Link>
            <Link to="/admin/tournaments" className="glass-panel p-6 hover:border-[#8b5cf6] transition-all group">
              <span className="text-3xl mb-2 block">🛡️</span>
              <h3 className="text-xl font-bold text-white group-hover:text-[#00f2fe] transition-colors">Tournament Approvals</h3>
              <p className="text-xs text-[#94a3b8] mt-1">Approve pending tournaments and moderate content</p>
            </Link>
          </div>
        </>
      )}

    </div>
  );
}
