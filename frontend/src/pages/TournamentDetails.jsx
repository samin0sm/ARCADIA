import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BracketViewer from '../components/BracketViewer';

export default function TournamentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [roster, setRoster] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchTournamentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, rRes, bRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/roster`).catch(() => ({ data: [] })),
        api.get(`/tournaments/${id}/bracket`).catch(() => ({ data: null }))
      ]);
      setTournament(tRes.data);
      setRoster(rRes.data);
      setBracket(bRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Tournament not found or unable to load.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'PLAYER') {
      setNotice({ type: 'error', text: 'Only players can join tournaments.' });
      return;
    }

    setJoining(true);
    try {
      const res = await api.post(`/tournaments/${id}/join`);
      setNotice({
        type: 'success',
        text: res.data?.message || '🎉 Successfully registered for tournament!'
      });
      fetchTournamentData();
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.response?.data?.error || 'Failed to join tournament.'
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#94a3b8]">Loading tournament arena...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-5xl block">⚠️</span>
        <h2 className="text-2xl font-black text-white">Tournament Not Found</h2>
        <p className="text-xs text-[#94a3b8]">{error || 'This tournament does not exist.'}</p>
        <Link to="/tournaments" className="btn btn-cyan btn-sm">
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

  const isUserRegistered = roster.some((r) => r.username === user?.username);
  const isFull = (tournament.currentParticipants ?? roster.length) >= tournament.maxPlayers;
  const isUpcoming = tournament.status === 'UPCOMING';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-wider bg-[#8b5cf6]/15 px-3 py-1 rounded-md border border-[#8b5cf6]/30">
                {tournament.gameName}
              </span>
              <span className={`badge ${
                tournament.status === 'UPCOMING' ? 'badge-upcoming' :
                tournament.status === 'ONGOING' ? 'badge-ongoing' :
                tournament.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
              }`}>
                {tournament.status}
              </span>
              <span className="text-xs text-[#94a3b8] font-semibold">
                Format: <strong className="text-white">{tournament.format || 'Single Elimination'}</strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {tournament.name}
            </h1>

            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {tournament.description || 'Official competitive championship hosted on ARCADIA.'}
            </p>
          </div>

          {/* Join CTA Card */}
          <div className="glass-panel p-6 bg-[#090c1a]/90 border-[#00f2fe]/30 sm:min-w-[300px] flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94a3b8]">Entry Fee:</span>
                <span className="text-white font-bold">
                  {Number(tournament.entryFee) > 0 ? `$${tournament.entryFee}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#94a3b8]">Registered:</span>
                <span className={`font-bold ${isFull ? 'text-[#f43f5e]' : 'text-[#00f2fe]'}`}>
                  {tournament.currentParticipants ?? roster.length} / {tournament.maxPlayers} Players
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#94a3b8]">Start Date:</span>
                <span className="text-white font-semibold">
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleString() : 'TBD'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            {!user ? (
              <Link to="/login" className="btn btn-cyan w-full text-center font-bold text-sm py-3">
                Sign In to Join Tournament
              </Link>
            ) : isUserRegistered ? (
              <div className="p-3 rounded-xl bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399] text-center text-xs font-bold">
                ✓ You Are Registered
              </div>
            ) : isFull ? (
              <button disabled className="btn btn-outline w-full opacity-50 cursor-not-allowed text-xs py-3">
                Tournament Full ({tournament.maxPlayers} Max)
              </button>
            ) : !isUpcoming ? (
              <button disabled className="btn btn-outline w-full opacity-50 cursor-not-allowed text-xs py-3">
                Registration Closed ({tournament.status})
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="btn btn-primary w-full font-bold text-sm py-3 shadow-[0_0_25px_rgba(139,92,246,0.5)]"
              >
                {joining ? 'Joining Tournament...' : '⚡ JOIN TOURNAMENT'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notice Alert */}
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
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          📋 Overview & Rules
        </button>
        <button
          onClick={() => setActiveTab('bracket')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'bracket'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          ⚔️ Bracket & Fixtures
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-[#00f2fe] text-[#00f2fe]'
              : 'border-transparent text-[#94a3b8] hover:text-white'
          }`}
        >
          👥 Participants Roster ({roster.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Tournament Overview</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                {tournament.description || 'Welcome to the tournament! Prepare your roster and compete for the championship.'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#1e2648]">
              <h3 className="text-base font-bold text-white">Rules & Guidelines</h3>
              <ul className="space-y-2 text-xs text-[#94a3b8] list-disc list-inside">
                <li>All matches must be played on official game servers.</li>
                <li>Single-elimination format: Lose one match and you are eliminated.</li>
                <li>Winner of each match advances automatically to the next round.</li>
                <li>Check-in begins 15 minutes before the scheduled start date.</li>
                <li>Unsportsmanlike behavior will result in disqualification.</li>
              </ul>
            </div>
          </div>

          {/* Quick Info Specs */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Event Information</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#090c1a] border border-[#1e2648]">
                <span className="text-[#94a3b8] block">Game Title</span>
                <span className="font-bold text-white text-sm">{tournament.gameName}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c1a] border border-[#1e2648]">
                <span className="text-[#94a3b8] block">Organizer</span>
                <span className="font-bold text-white text-sm">{tournament.organizer}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c1a] border border-[#1e2648]">
                <span className="text-[#94a3b8] block">Max Bracket Slots</span>
                <span className="font-bold text-white text-sm">{tournament.maxPlayers} Players</span>
              </div>
              <div className="p-3 rounded-lg bg-[#090c1a] border border-[#1e2648]">
                <span className="text-[#94a3b8] block">Champion</span>
                <span className="font-bold text-[#f59e0b] text-sm">{tournament.champion || 'TBD (In Competition)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Bracket */}
      {activeTab === 'bracket' && (
        <div className="glass-panel p-6 sm:p-8">
          <BracketViewer
            bracket={bracket}
            onUpdateMatch={() => fetchTournamentData()}
            isOrganizer={user?.role === 'ORGANIZER' || user?.role === 'ADMIN'}
          />
        </div>
      )}

      {/* Tab: Participants Roster */}
      {activeTab === 'roster' && (
        <div className="glass-panel p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Registered Participants</h3>
            <span className="text-xs text-[#94a3b8]">
              {roster.length} / {tournament.maxPlayers} Slots Filled
            </span>
          </div>

          {roster.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {roster.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center font-black text-white text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.username}</h4>
                    <span className="text-[10px] text-[#10b981] font-semibold">● Registered</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#94a3b8] text-xs">
              No participants have joined this tournament yet. Be the first to register!
            </div>
          )}
        </div>
      )}

    </div>
  );
}
