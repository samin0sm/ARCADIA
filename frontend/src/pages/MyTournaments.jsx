import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function MyTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/tournaments/my')
      .then((res) => {
        setTournaments(res.data);
        setError(null);
      })
      .catch(() => {
        // Fallback to alias if needed
        api.get('/players/tournaments')
          .then((res) => setTournaments(res.data))
          .catch(() => {
            setError('Unable to load your tournaments.');
            setTournaments([]);
          });
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.gameName?.toLowerCase().includes(search.toLowerCase()) ||
    t.game?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Player Schedule
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              My Tournaments
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Review your registered tournaments, track registration status, and prepare for your matches.
            </p>
          </div>

          <Link to="/tournaments" className="btn btn-cyan btn-sm font-bold">
            ⚡ Find New Tournaments
          </Link>
        </div>

        {/* Search */}
        <div className="mt-6 max-w-md">
          <input
            type="text"
            placeholder="Search your tournaments by name or game..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-custom"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Tournaments List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel h-56 animate-pulse bg-[#0e1326]/50 rounded-2xl"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => {
            const tournId = t.tournamentId || t.id;
            const tournName = t.name;
            const gameTitle = t.gameName || t.game;
            const tStatus = t.tournamentStatus || t.status;
            const regStatus = t.registrationStatus || 'REGISTERED';
            const scheduleNote = t.matchScheduleNote || 'Matches will appear when the tournament schedule is published.';

            return (
              <article
                key={tournId}
                className="glass-panel p-6 flex flex-col justify-between group hover:border-[#8b5cf6] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider bg-[#8b5cf6]/10 px-2.5 py-1 rounded-md border border-[#8b5cf6]/20">
                      {gameTitle}
                    </span>
                    <span className={`badge ${
                      tStatus === 'UPCOMING' ? 'badge-upcoming' :
                      tStatus === 'ONGOING' ? 'badge-ongoing' :
                      tStatus === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                    }`}>
                      {tStatus}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-[#00f2fe] transition-colors mb-2">
                    {tournName}
                  </h3>

                  {/* Details pill grid */}
                  <div className="space-y-2 py-3 border-y border-[#1e2648] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Registration Status:</span>
                      <span className={`font-bold ${
                        regStatus === 'APPROVED' ? 'text-[#10b981]' : 'text-[#f59e0b]'
                      }`}>
                        ● {regStatus}
                      </span>
                    </div>
                    {t.startDate && (
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Start Date:</span>
                        <span className="text-white font-medium">
                          {new Date(t.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {t.maxPlayers && (
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Participants:</span>
                        <span className="text-[#00f2fe] font-bold">
                          {t.currentParticipants ?? 0} / {t.maxPlayers}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Match Info notice */}
                  <div className="mt-3 p-3 rounded-lg bg-[#090c1a] border border-[#1e2648] text-[11px] text-[#94a3b8] flex items-center gap-2">
                    <span>⚔️</span>
                    <span>{scheduleNote}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1e2648] flex items-center justify-between">
                  <span className="text-xs text-[#10b981] font-bold">
                    ✓ Joined
                  </span>
                  <Link to={`/tournaments/${tournId}`} className="btn btn-outline btn-sm">
                    View Details & Bracket →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3 max-w-md mx-auto">
          <span className="text-4xl block">🏆</span>
          <h3 className="text-lg font-bold text-white">No Tournaments Joined Yet</h3>
          <p className="text-xs">
            You haven't joined any competitive tournaments yet. Browse the tournament directory to register!
          </p>
          <div className="pt-2">
            <Link to="/tournaments" className="btn btn-cyan btn-sm">
              Discover Tournaments
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
