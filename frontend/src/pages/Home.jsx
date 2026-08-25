import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tournaments').catch(() => ({ data: [] })),
      api.get('/games').catch(() => ({ data: [] })),
      api.get('/rankings').catch(() => ({ data: [] }))
    ]).then(([tournRes, gamesRes, rankRes]) => {
      setTournaments(tournRes.data.slice(0, 3));
      setGames(gamesRes.data.slice(0, 4));
      setLeaderboard(rankRes.data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      
      {/* High-Impact Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-gradient-to-tr from-[#8b5cf6]/20 via-[#6366f1]/15 to-[#00f2fe]/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c1022] border border-[#00f2fe]/40 text-[#00f2fe] text-xs font-extrabold tracking-widest uppercase mb-8 shadow-[0_0_25px_rgba(0,242,254,0.25)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-ping" />
          <span>Next-Gen Competitive Esports Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] uppercase max-w-5xl mx-auto">
          Unleash Your Skill.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] via-[#c084fc] to-[#ec4899]">
            Dominate The Arena.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto font-normal leading-relaxed">
          The ultimate platform for single-elimination esports tournaments. Compete in live brackets, earn crypto tokens, and climb to the top of global leaderboards.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/tournaments" className="btn btn-cyan btn-lg font-black shadow-[0_0_30px_rgba(0,242,254,0.4)]">
            ⚡ Explore Tournaments
          </Link>
          <Link to="/games" className="btn btn-outline btn-lg font-bold">
            🎮 Browse Games Catalog
          </Link>
          {user?.role === 'ORGANIZER' && (
            <Link to="/create" className="btn btn-primary btn-lg">
              + Host an Event
            </Link>
          )}
        </div>

        {/* Live Metric Counters Banner */}
        <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="glass-panel p-6 text-center border-t-2 border-t-[#8b5cf6]">
            <span className="text-3xl sm:text-4xl font-black text-white">100%</span>
            <p className="text-xs text-[#94a3b8] font-extrabold uppercase tracking-wider mt-1">Live Elimination Trees</p>
          </div>
          <div className="glass-panel p-6 text-center border-t-2 border-t-[#f59e0b]">
            <span className="text-3xl sm:text-4xl font-black text-[#f59e0b]">🪙 100</span>
            <p className="text-xs text-[#94a3b8] font-extrabold uppercase tracking-wider mt-1">Tokens Per Championship</p>
          </div>
          <div className="glass-panel p-6 text-center border-t-2 border-t-[#00f2fe]">
            <span className="text-3xl sm:text-4xl font-black text-[#00f2fe]">8+</span>
            <p className="text-xs text-[#94a3b8] font-extrabold uppercase tracking-wider mt-1">Esports Titles</p>
          </div>
          <div className="glass-panel p-6 text-center border-t-2 border-t-[#10b981]">
            <span className="text-3xl sm:text-4xl font-black text-[#10b981]">Instant</span>
            <p className="text-xs text-[#94a3b8] font-extrabold uppercase tracking-wider mt-1">Score Sync & Crown</p>
          </div>
        </div>
      </section>

      {/* Featured Esports Games Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">Active Titles</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Supported Esports Games</h2>
          </div>
          <Link to="/games" className="text-sm font-bold text-[#8b5cf6] hover:text-[#c084fc] transition-colors">
            View All ({games.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((g) => (
            <Link
              key={g.id}
              to={`/tournaments?game=${encodeURIComponent(g.name)}`}
              className="glass-panel p-5 group hover:border-[#00f2fe] transition-all hover:-translate-y-1 overflow-hidden relative"
            >
              <div className="h-36 rounded-xl overflow-hidden mb-4 relative bg-[#090d1f]">
                {g.iconUrl ? (
                  <img
                    src={g.iconUrl}
                    alt={g.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1022] via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 badge badge-upcoming text-[10px]">
                  {g.tournamentCount ?? 0} Tournaments
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#00f2fe] transition-colors">
                {g.name}
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">Competitive Fixtures</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Featured Tournaments</h2>
          </div>
          <Link to="/tournaments" className="text-sm font-bold text-[#8b5cf6] hover:text-[#c084fc] transition-colors">
            View All Events →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel h-64 animate-pulse bg-[#0e1326]/50 rounded-2xl" />
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <article key={t.id} className="glass-panel p-6 flex flex-col justify-between group hover:border-[#8b5cf6] transition-all hover:-translate-y-1 shadow-lg">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider bg-[#8b5cf6]/10 px-3 py-1 rounded-lg border border-[#8b5cf6]/30">
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
                  <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition-colors mb-2">
                    {t.name}
                  </h3>
                  <div className="space-y-2 text-xs text-[#94a3b8] mb-6">
                    <p className="flex items-center justify-between">
                      <span className="text-white font-semibold">Format:</span>
                      <span>{t.format || 'Single Elimination'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-white font-semibold">Capacity:</span>
                      <span>{t.currentParticipants ?? 0} / {t.maxPlayers} Players</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-white font-semibold">Starts:</span>
                      <span>{new Date(t.startDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1.5">
                    <span>🪙</span> {t.entryFee > 0 ? `${t.entryFee} Entry` : 'Free Entry'}
                  </span>
                  <Link to={`/tournaments/${t.id}`} className="btn btn-outline btn-sm">
                    View Bracket →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-[#94a3b8]">
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
            From registration to crowning the champion, everything is automated, ranked, and rewarded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 relative overflow-hidden group hover:border-[#8b5cf6]">
            <span className="text-6xl font-black text-[#151c38] absolute top-4 right-6 select-none group-hover:text-[#8b5cf6]/20 transition-colors">01</span>
            <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-3xl mb-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              🎮
            </div>
            <h3 className="text-xl font-black text-white mb-2">Build Your Gamer Tag</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Register an account, select your favorite game and skill tier, and browse open tournament brackets hosted by esports organizers.
            </p>
          </div>

          <div className="glass-panel p-8 relative overflow-hidden group hover:border-[#00f2fe]">
            <span className="text-6xl font-black text-[#151c38] absolute top-4 right-6 select-none group-hover:text-[#00f2fe]/20 transition-colors">02</span>
            <div className="w-14 h-14 rounded-2xl bg-[#00f2fe]/20 border border-[#00f2fe]/40 flex items-center justify-center text-3xl mb-6 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
              ⚔️
            </div>
            <h3 className="text-xl font-black text-white mb-2">Compete in Brackets</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Once approved, players are automatically paired in single-elimination brackets. Match results advance winners to next rounds in real time.
            </p>
          </div>

          <div className="glass-panel p-8 relative overflow-hidden group hover:border-[#f59e0b]">
            <span className="text-6xl font-black text-[#151c38] absolute top-4 right-6 select-none group-hover:text-[#f59e0b]/20 transition-colors">03</span>
            <div className="w-14 h-14 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center text-3xl mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              👑
            </div>
            <h3 className="text-xl font-black text-white mb-2">Win Tokens & Badges</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Tournament champions receive 100 token rewards directly in their wallet, boost their win record, and climb to the top of global rankings.
            </p>
          </div>
        </div>
      </section>

      {/* Top Champions Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden border-[#8b5cf6]/30 shadow-[0_10px_50px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">Hall of Fame</span>
              <h2 className="text-3xl font-black text-white">Global Leaderboard</h2>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Check out the highest-ranking competitors dominating the Arcadia arena. Every tournament win earns ranking points and unlocks VIP badges.
              </p>
              <Link to="/leaderboard" className="btn btn-primary btn-sm inline-flex font-bold">
                View Full Rankings →
              </Link>
            </div>

            <div className="w-full md:w-auto flex-1 max-w-md space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((r, idx) => (
                  <div
                    key={r.rank || idx}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      idx === 0
                        ? 'podium-rank-1'
                        : idx === 1
                        ? 'podium-rank-2'
                        : 'podium-rank-3'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white w-6 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="font-extrabold text-white text-sm">{r.username}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[#94a3b8]">{r.wins}W / {r.losses}L</span>
                      <span className="font-mono font-black text-[#00f2fe] px-2.5 py-1 rounded-lg bg-[#070a17]">
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
