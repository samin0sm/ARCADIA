import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Tournaments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGame = searchParams.get('game') || 'ALL';
  
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [joinNotice, setJoinNotice] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch games for filter buttons
  useEffect(() => {
    api.get('/games')
      .then((res) => setGames(res.data))
      .catch(() => setGames([]));
  }, []);

  // Update selected game if query param changes
  useEffect(() => {
    const qGame = searchParams.get('game');
    if (qGame) setSelectedGame(qGame);
  }, [searchParams]);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedGame !== 'ALL') params.game = selectedGame;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/tournaments', { params });
      setTournaments(res.data);
    } catch {
      setError('Unable to load tournaments. Please check connection.');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, search]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleGameSelect = (gName) => {
    setSelectedGame(gName);
    if (gName === 'ALL') {
      searchParams.delete('game');
    } else {
      searchParams.set('game', gName);
    }
    setSearchParams(searchParams);
  };

  const handleJoin = async (t) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'PLAYER') {
      setJoinNotice({ type: 'error', text: 'Only players can join tournaments.' });
      return;
    }

    try {
      const res = await api.post(`/tournaments/${t.id}/join`);
      setJoinNotice({ type: 'success', text: res.data?.message || `Successfully registered for ${t.name}!` });
      fetchTournaments();
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setJoinNotice({ type: 'error', text: msg });
    }
  };

  const filtered = tournaments.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Compete & Conquer
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white">
              Discover Tournaments
            </h1>
            <p className="text-sm text-[#94a3b8] max-w-xl">
              Browse open tournaments, join competitive single-elimination brackets, and claim glory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'PLAYER' && (
              <Link to="/my-tournaments" className="btn btn-outline btn-sm font-bold">
                🏆 My Tournaments
              </Link>
            )}
            <Link to="/games" className="btn btn-cyan btn-sm font-bold">
              🎮 Browse Games
            </Link>
          </div>
        </div>

        {/* Global Search & Status filter */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Search tournaments by name or game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-custom"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-custom font-semibold text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming (Open for Join)</option>
              <option value="ONGOING">Ongoing (In Progress)</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Game Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-[#94a3b8] mr-1 uppercase">Filter Game:</span>
          <button
            onClick={() => handleGameSelect('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGame === 'ALL'
                ? 'bg-[#00f2fe] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                : 'bg-[#090c1a] border border-[#1e2648] text-[#94a3b8] hover:text-white'
            }`}
          >
            All Games
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGameSelect(g.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGame === g.name
                  ? 'bg-[#00f2fe] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                  : 'bg-[#090c1a] border border-[#1e2648] text-[#94a3b8] hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Join Notice Toast / Alert */}
      {joinNotice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
            joinNotice.type === 'success'
              ? 'bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399]'
              : 'bg-[#f43f5e]/20 border border-[#f43f5e]/50 text-[#fda4af]'
          }`}
        >
          <span>{joinNotice.text}</span>
          <button onClick={() => setJoinNotice(null)} className="text-sm">✕</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Tournaments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel h-64 animate-pulse bg-[#0e1326]/60 rounded-2xl"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => {
            const isFull = t.currentParticipants >= t.maxPlayers;
            const isJoinable = t.status === 'UPCOMING' && !isFull;

            return (
              <article
                key={t.id}
                className="glass-panel p-6 flex flex-col justify-between group hover:border-[#8b5cf6] transition-all"
              >
                <div>
                  {/* Category & Status */}
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

                  <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition-colors mb-2">
                    {t.name}
                  </h3>

                  <p className="text-xs text-[#94a3b8] line-clamp-2 mb-4 leading-relaxed">
                    {t.description || 'Single-elimination competitive bracket on ARCADIA.'}
                  </p>

                  {/* Metadata Specs */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#090c1a]/80 border border-[#1e2648] text-xs">
                    <div>
                      <span className="text-[#64748b] block text-[10px] uppercase font-bold">Organizer</span>
                      <span className="text-white font-semibold truncate block">{t.organizer}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10px] uppercase font-bold">Entry Fee</span>
                      <span className="text-[#f59e0b] font-bold">
                        {Number(t.entryFee) > 0 ? `$${t.entryFee}` : 'FREE'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10px] uppercase font-bold">Participants</span>
                      <span className={`font-bold ${isFull ? 'text-[#f43f5e]' : 'text-[#00f2fe]'}`}>
                        {t.currentParticipants ?? 0} / {t.maxPlayers} {isFull && '(FULL)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10px] uppercase font-bold">Date</span>
                      <span className="text-[#94a3b8] font-medium">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 mt-4 border-t border-[#1e2648] flex items-center gap-3">
                  <Link
                    to={`/tournaments/${t.id}`}
                    className="btn btn-outline btn-sm flex-1 text-center"
                  >
                    View Details
                  </Link>

                  {isJoinable && (
                    <button
                      onClick={() => handleJoin(t)}
                      className="btn btn-primary btn-sm flex-1 font-bold"
                    >
                      ⚡ Join
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3 max-w-md mx-auto">
          <span className="text-4xl block">🏆</span>
          <h3 className="text-lg font-bold text-white">No Tournaments Found</h3>
          <p className="text-xs">
            No events match your current filter selection. Try changing the game filter or clearing search.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedGame('ALL'); setStatusFilter('ALL'); }}
            className="btn btn-cyan btn-sm"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
