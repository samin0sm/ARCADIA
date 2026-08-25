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
        setMyTournaments(tRes.data || []);
        setMyMatches(mRes.data || []);
        setLoading(false);
      });
    } else if (user.role === 'ORGANIZER') {
      Promise.all([
        api.get('/tournaments/dashboard-stats').catch(() => ({ data: null })),
        api.get('/tournaments/organizer').catch(() => ({ data: [] }))
      ]).then(([sRes, tRes]) => {
        setOrganizerStats(sRes.data);
        setOrgTournaments(tRes.data || []);
        setLoading(false);
      });
    } else if (user.role === 'ADMIN') {
      Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/tournaments/organizer').catch(() => ({ data: [] }))
      ]).then(([sRes, tRes]) => {
        setAdminStats(sRes.data);
        setOrgTournaments(tRes.data || []);
        setLoading(false);
      });
    }
  }, [user, refreshUser]);

  const totalGames = (profile?.wins || 0) + (profile?.losses || 0);
  const winRate = totalGames > 0 ? Math.round(((profile?.wins || 0) / totalGames) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Dynamic Cyber Hero Command Center */}
      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-[#8b5cf6]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-[#00f2fe]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] via-[#6366f1] to-[#00f2fe] p-[2px] shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                <div className="w-full h-full bg-[#090d1f] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white">
                  {user?.username ? user.username.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : '⚡'}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10b981] border-2 border-[#090d1f] flex items-center justify-center text-[9px] font-bold text-black" title="Online">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="badge badge-upcoming text-[11px] font-extrabold tracking-wider">
                  {user?.role} COMMAND CENTER
                </span>
                {profile?.skillLevel && (
                  <span className="badge badge-ongoing text-[11px] font-extrabold">
                    ★ {profile.skillLevel}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1.5 tracking-tight">
                {user?.username || user?.name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 max-w-xl">
                {user?.role === 'PLAYER'
                  ? 'Track your tournament progress, ranking points, and crypto token rewards.'
                  : user?.role === 'ORGANIZER'
                  ? 'Host esports competitions, seed brackets, and submit live scores.'
                  : 'Platform governance, moderation, and system performance overview.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {user?.role === 'PLAYER' && (
              <>
                <Link to="/tournaments" className="btn btn-cyan btn-sm sm:btn-md shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                  ⚡ Join Tournament
                </Link>
                <Link to="/shop" className="btn btn-outline btn-sm sm:btn-md text-[#f59e0b] border-[#f59e0b]/40 hover:border-[#f59e0b]">
                  🪙 Rewards Shop
                </Link>
              </>
            )}
            {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <>
                <Link to="/create" className="btn btn-primary btn-sm sm:btn-md shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  + Create Event
                </Link>
                <Link to="/manage-matches" className="btn btn-outline btn-sm sm:btn-md">
                  ⚔️ Enter Scores
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PLAYER DASHBOARD VIEW                                                     */}
      {/* ========================================================================= */}
      {user?.role === 'PLAYER' && (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-5 sm:p-6 relative group overflow-hidden hover:border-[#f59e0b]/50">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
                <span>Token Balance</span>
                <span className="text-xl">🪙</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#f59e0b] mt-2 flex items-center gap-2">
                <span>{profile?.tokenBalance ?? user?.tokenBalance ?? 0}</span>
                <span className="text-xs font-semibold text-[#f59e0b]/80 uppercase">Tokens</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>Earned from wins</span>
                <Link to="/shop" className="text-[#f59e0b] font-bold hover:underline">Redeem →</Link>
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6 relative group overflow-hidden hover:border-[#00f2fe]/50">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
                <span>Ranking Points</span>
                <span className="text-xl">🏆</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#00f2fe] mt-2">
                {profile?.rankingPoints ?? 0} <span className="text-xs font-semibold text-[#00f2fe]/80">PTS</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>+3 PTS per win</span>
                <Link to="/leaderboard" className="text-[#00f2fe] font-bold hover:underline">Rankings →</Link>
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6 relative group overflow-hidden hover:border-[#10b981]/50">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
                <span>Win Record</span>
                <span className="text-xl">⚔️</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#10b981] mt-2">
                {profile?.wins ?? 0}W <span className="text-lg font-medium text-[#94a3b8]">/ {profile?.losses ?? 0}L</span>
              </div>
              <div className="mt-3 w-full bg-[#1e2648] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#10b981] h-full rounded-full transition-all duration-500" style={{ width: `${winRate}%` }} />
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6 relative group overflow-hidden hover:border-[#8b5cf6]/50">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
                <span>Total Matches</span>
                <span className="text-xl">🎮</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-2">
                {profile?.totalMatches ?? (profile?.wins || 0) + (profile?.losses || 0)}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>Win Rate: <strong className="text-white">{winRate}%</strong></span>
                <Link to="/matches" className="text-[#8b5cf6] font-bold hover:underline">History →</Link>
              </div>
            </div>
          </div>

          {/* Quick Navigation Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/my-tournaments" className="glass-panel p-6 hover:border-[#8b5cf6] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏆
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#00f2fe] transition-colors">
                My Tournaments
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Check registered competitions, brackets, and match schedules.
              </p>
            </Link>

            <Link to="/matches" className="glass-panel p-6 hover:border-[#00f2fe] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚔️
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#00f2fe] transition-colors">
                Match History
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Review past knockout fixtures, final scores, and opponent tags.
              </p>
            </Link>

            <Link to="/shop" className="glass-panel p-6 hover:border-[#f59e0b] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🪙
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#f59e0b] transition-colors">
                Rewards Shop
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Spend your victory tokens on rare profile badges and perks.
              </p>
            </Link>

            <Link to="/profile" className="glass-panel p-6 hover:border-[#10b981] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#10b981] transition-colors">
                Gamer Profile
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Customize gamer tag, favorite games, and unlocked inventory.
              </p>
            </Link>
          </div>

          {/* Registered Tournaments Section */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Active & Registered Tournaments</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">Tournaments you are registered for or competing in</p>
              </div>
              <Link to="/my-tournaments" className="btn btn-outline btn-sm text-xs font-bold text-[#a78bfa]">
                View All ({myTournaments.length}) →
              </Link>
            </div>

            {myTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myTournaments.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    to={`/tournaments/${t.id}`}
                    className="p-5 rounded-2xl bg-[#090d1f] border border-[#1e2648] hover:border-[#8b5cf6] transition-all group hover:-translate-y-1 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#00f2fe] tracking-wider">
                        {t.game || t.gameName || 'Esports'}
                      </span>
                      <span className={`badge text-[10px] ${
                        t.status === 'UPCOMING' ? 'badge-upcoming' :
                        t.status === 'ONGOING' ? 'badge-ongoing' :
                        t.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-lg mt-2 group-hover:text-[#a78bfa] transition-colors truncate">
                      {t.name}
                    </h4>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94a3b8]">
                      <span>👥 {t.currentParticipants ?? t.maxPlayers ?? 0} Players</span>
                      <span className="font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                        View Bracket →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-[#080b1a]/50 border border-dashed border-[#1e2648]">
                <span className="text-4xl mb-3 block">🏆</span>
                <h4 className="text-base font-bold text-white">No Registered Tournaments</h4>
                <p className="text-xs text-[#94a3b8] mt-1 max-w-sm mx-auto">
                  You haven't signed up for any competitive events yet. Browse our active tournaments and claim your glory!
                </p>
                <div className="mt-5">
                  <Link to="/tournaments" className="btn btn-cyan btn-sm font-bold">
                    Explore Open Tournaments
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ORGANIZER DASHBOARD VIEW                                                  */}
      {/* ========================================================================= */}
      {user?.role === 'ORGANIZER' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
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
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Approved</span>
              <div className="text-3xl font-black text-[#10b981] mt-1">
                {organizerStats?.approvedPlayers ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Scheduled</span>
              <div className="text-3xl font-black text-[#a78bfa] mt-1">
                {organizerStats?.scheduledMatches ?? 0}
              </div>
            </div>
            <div className="glass-panel p-5">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Completed</span>
              <div className="text-3xl font-black text-[#f59e0b] mt-1">
                {organizerStats?.completedMatches ?? 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Link to="/create" className="glass-panel p-6 hover:border-[#8b5cf6] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ➕
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#00f2fe] transition-colors">
                Create Tournament
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">Configure format, game titles, rules, and entry fees.</p>
            </Link>
            <Link to="/manage-tournaments" className="glass-panel p-6 hover:border-[#00f2fe] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#00f2fe] transition-colors">
                Manage Events & Pairings
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">Review signups, approve roster, and generate bracket tree.</p>
            </Link>
            <Link to="/manage-matches" className="glass-panel p-6 hover:border-[#10b981] transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚔️
              </div>
              <h3 className="font-extrabold text-white text-lg mt-4 group-hover:text-[#10b981] transition-colors">
                Referee & Scores
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">Submit live match scores and advance tournament rounds.</p>
            </Link>
          </div>

          {/* Hosted Tournaments Table */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Your Hosted Tournaments</h3>
                <p className="text-xs text-[#94a3b8]">Live status and match progression oversight</p>
              </div>
              <Link to="/create" className="btn btn-primary btn-sm text-xs font-bold">
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
                      <th className="pb-3">Roster</th>
                      <th className="pb-3">Matches</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141b36]">
                    {orgTournaments.map((t) => (
                      <tr key={t.id} className="hover:bg-[#141b36]/30 transition-colors">
                        <td className="py-3.5 font-bold text-white text-sm">{t.name}</td>
                        <td className="py-3.5 text-[#94a3b8]">{t.gameName || t.game}</td>
                        <td className="py-3.5">
                          <span className={`badge text-[10px] ${
                            t.status === 'UPCOMING' ? 'badge-upcoming' :
                            t.status === 'ONGOING' ? 'badge-ongoing' :
                            t.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#94a3b8]">
                          <span className="text-white font-semibold">{t.approvedCount ?? 0}</span> / {t.registeredCount ?? 0} approved
                        </td>
                        <td className="py-3.5 text-[#94a3b8]">
                          <span className="text-white font-semibold">{t.completedMatchCount ?? 0}</span> / {t.matchCount ?? 0} done
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <Link to={`/tournaments/${t.id}`} className="btn btn-outline btn-sm py-1 px-3 text-xs">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-[#94a3b8] text-xs">
                You haven't hosted any tournaments yet.{' '}
                <Link to="/create" className="text-[#00f2fe] font-bold hover:underline">
                  Host your first tournament now →
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ADMIN DASHBOARD VIEW                                                      */}
      {/* ========================================================================= */}
      {user?.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-5 sm:p-6">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Users</span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-2">
                {adminStats?.totalUsers ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5 sm:p-6">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Tournaments</span>
              <div className="text-3xl sm:text-4xl font-black text-[#00f2fe] mt-2">
                {adminStats?.totalTournaments ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5 sm:p-6">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Pending Approvals</span>
              <div className="text-3xl sm:text-4xl font-black text-[#f59e0b] mt-2">
                {adminStats?.pendingTournaments ?? '—'}
              </div>
            </div>
            <div className="glass-panel p-5 sm:p-6">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Total Matches</span>
              <div className="text-3xl sm:text-4xl font-black text-[#10b981] mt-2">
                {adminStats?.totalMatches ?? '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Link to="/admin/users" className="glass-panel p-6 sm:p-8 hover:border-[#8b5cf6] transition-all group hover:-translate-y-1">
              <span className="text-4xl mb-3 block">👥</span>
              <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition-colors">
                User Management Directory
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Enable, suspend, and review user accounts, security roles, and platform permissions.
              </p>
            </Link>
            <Link to="/admin/tournaments" className="glass-panel p-6 sm:p-8 hover:border-[#00f2fe] transition-all group hover:-translate-y-1">
              <span className="text-4xl mb-3 block">🛡️</span>
              <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition-colors">
                Tournament Moderation Center
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Approve newly created tournaments, manage reported events, and oversee fair play.
              </p>
            </Link>
          </div>
        </>
      )}

    </div>
  );
}
