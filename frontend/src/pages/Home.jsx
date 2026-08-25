import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments').catch(() => ({ data: [] })),
      api.get('/rankings').catch(() => ({ data: [] }))
    ]).then(([tournRes, rankRes]) => {
      setTournaments(tournRes.data.slice(0, 3));
      setLeaderboard(rankRes.data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#8b5cf6]/20 to-[#00f2fe]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12172a] border border-[#00f2fe]/40 text-[#00f2fe] text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>
          Competitive Esports Ecosystem
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight uppercase max-w-4xl mx-auto">
          Play Harder.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] via-[#a78bfa] to-[#8b5cf6] text-glow-purple">
            Rise Higher.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto font-medium leading-relaxed">
          The ultimate platform for gaming tournaments. Join open qualifiers, compete in dynamic single-elimination brackets, earn crypto tokens, and rise through the global ranks.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/tournaments" className="btn btn-cyan text-base px-8 py-3.5 font-bold shadow-[0_0_25px_rgba(0,242,254,0.4)]">
            ⚡ Explore Tournaments
          </Link>
          {user?.role === 'ORGANIZER' ? (
            <Link to="/create" className="btn btn-primary text-base px-8 py-3.5">
              + Host an Event
            </Link>
          ) : !user ? (
            <Link to="/register" className="btn btn-outline text-base px-8 py-3.5">
              Create Gamer Profile
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-outline text-base px-8 py-3.5">
              Go to Command Center
            </Link>
          )}
        </div>

        {/* Live metric counters banner */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="glass-panel p-5 text-center">
            <span className="text-3xl font-black text-white">100%</span>
            <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mt-1">Live Brackets</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <span className="text-3xl font-black text-[#00f2fe]">🪙 100</span>
            <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mt-1">Token Winnings / Win</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <span className="text-3xl font-black text-[#a78bfa]">Single</span>
            <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mt-1">Elimination Logic</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <span className="text-3xl font-black text-[#10b981]">Instant</span>
            <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mt-1">Score Sync & Crown</p>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">Competitive Fixtures</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Featured Tournaments</h2>
          </div>
          <Link to="/tournaments" className="text-sm font-bold text-[#8b5cf6] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
            View All Events →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel h-64 animate-pulse bg-[#0e1326]/50"></div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <article key={t.id} className="glass-panel p-6 flex flex-col justify-between group hover:border-[#8b5cf6] transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider bg-[#8b5cf6]/10 px-2.5 py-1 rounded-md border border-[#8b5cf6]/20">
                      {t.gameName}
                    </span>
                    <span className={`badge ${
                      t.status === 'UPCOMING' ? 'badge-upcoming' :
                      t.status === 'ONGOING' ? 'badge-ongoing' :
                      t.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#00f2fe] transition-colors mb-2">
                    {t.name}
                  </h3>
                  <div className="space-y-1.5 text-xs text-[#94a3b8] mb-6">
                    <p className="flex items-center gap-2">
                      <span className="text-white font-semibold">Format:</span> {t.format || 'Single Elimination'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white font-semibold">Capacity:</span> {t.maxPlayers} Players
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white font-semibold">Starts:</span> {new Date(t.startDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1e2648] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1">
                    🪙 {t.entryFee > 0 ? `${t.entryFee} Entry` : 'Free Entry'}
                  </span>
                  <Link to={`/tournaments/${t.id}`} className="btn btn-outline btn-sm">
                    View Event →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center text-[#94a3b8]">
            No tournaments currently listed. Be the first to create one!
          </div>
        )}
      </section>

      {/* How It Works 3-Step Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">The Arena Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">How Arcadia Works</h2>
          <p className="text-sm text-[#94a3b8] mt-2 max-w-lg mx-auto">
            From registration to crowning the champion, everything is automated and ranked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 relative overflow-hidden group">
            <span className="text-5xl font-black text-[#1e2648] absolute top-4 right-6 select-none group-hover:text-[#8b5cf6]/30 transition-colors">01</span>
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-2xl mb-6">
              🎮
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Build Your Gamer Tag</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Register an account, select your favorite game and skill tier, and browse open tournament brackets hosted by top esports organizers.
            </p>
          </div>

          <div className="glass-panel p-8 relative overflow-hidden group">
            <span className="text-5xl font-black text-[#1e2648] absolute top-4 right-6 select-none group-hover:text-[#00f2fe]/30 transition-colors">02</span>
            <div className="w-12 h-12 rounded-xl bg-[#00f2fe]/20 border border-[#00f2fe]/40 flex items-center justify-center text-2xl mb-6">
              ⚔️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Compete in Brackets</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Once approved, players are automatically paired in single-elimination brackets. Match results advance winners to next rounds in real time.
            </p>
          </div>

          <div className="glass-panel p-8 relative overflow-hidden group">
            <span className="text-5xl font-black text-[#1e2648] absolute top-4 right-6 select-none group-hover:text-[#f59e0b]/30 transition-colors">03</span>
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center text-2xl mb-6">
              👑
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Win Tokens & Prestige</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Tournament champions receive 100 token rewards directly in their wallet, boost their win record, and climb to the top of the global leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Top Champions Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden border-[#8b5cf6]/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">Hall of Fame</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Global Leaderboard</h2>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Check out the highest-ranking competitors dominating the Arcadia arena. Every tournament win earns ranking points.
              </p>
              <Link to="/leaderboard" className="btn btn-primary btn-sm inline-flex">
                View Full Rankings →
              </Link>
            </div>

            <div className="w-full md:w-auto flex-1 max-w-md space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((r, idx) => (
                  <div
                    key={r.rank}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      idx === 0
                        ? 'podium-rank-1'
                        : idx === 1
                        ? 'podium-rank-2'
                        : 'podium-rank-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-white w-6 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="font-bold text-white text-sm">{r.username}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[#94a3b8]">{r.wins}W / {r.losses}L</span>
                      <span className="font-mono font-bold text-[#00f2fe] px-2 py-0.5 rounded bg-[#090c1a]">
                        {r.points} PTS
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#94a3b8] text-center p-4">
                  Leaderboard will populate as matches complete.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
