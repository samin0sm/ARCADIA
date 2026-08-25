import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MatchHistory() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/players/matches')
      .then((res) => setMatches(res.data))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
            Combat Record
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Match History
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Review your upcoming fixtures, completed tournament matches, and individual match scores.
          </p>
        </div>
      </div>

      {/* Match Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel h-28 animate-pulse bg-[#0e1326]/50"></div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((m) => {
            const isPlayerOne = m.playerOneId === user?.profileId || m.playerOne === user?.username;
            const opponentName = isPlayerOne ? m.playerTwo : m.playerOne;
            const myScore = isPlayerOne ? m.playerOneScore : m.playerTwoScore;
            const oppScore = isPlayerOne ? m.playerTwoScore : m.playerOneScore;
            const isCompleted = m.status === 'COMPLETED';
            const isLive = m.status === 'LIVE';
            const isWinner = isCompleted && m.winner === (isPlayerOne ? m.playerOne : m.playerTwo);

            return (
              <div
                key={m.id}
                className="glass-panel p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8b5cf6] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                    isWinner
                      ? 'bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399]'
                      : isCompleted
                      ? 'bg-[#f43f5e]/20 border border-[#f43f5e]/50 text-[#fb7185]'
                      : 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 text-[#a78bfa]'
                  }`}>
                    {isWinner ? '🏆' : isCompleted ? '❌' : '⚔️'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                        {m.roundName}
                      </span>
                      <span className={`badge text-[9px] ${
                        isLive ? 'badge-ongoing' : isCompleted ? 'badge-completed' : 'badge-pending'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      vs. <span className="text-[#00f2fe]">{opponentName || 'TBD'}</span>
                    </h3>
                  </div>
                </div>

                {/* Score and Result Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1e2648]">
                  {isCompleted ? (
                    <div className="text-right">
                      <div className="font-mono text-lg font-black text-white">
                        {myScore ?? 0} - {oppScore ?? 0}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isWinner ? 'text-[#10b981]' : 'text-[#f43f5e]'
                      }`}>
                        {isWinner ? 'VICTORY (+3 PTS)' : 'DEFEAT'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs text-[#94a3b8] font-semibold">
                        {isLive ? '🔴 LIVE IN PROGRESS' : 'Awaiting Match'}
                      </span>
                    </div>
                  )}

                  <Link
                    to={`/tournaments/${m.tournamentId}`}
                    className="btn btn-outline btn-sm text-xs"
                  >
                    View Bracket →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3">
          <span className="text-4xl block">⚔️</span>
          <h3 className="text-lg font-bold text-white">No Match Records Found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Once you join a tournament and bracket pairings are created, your matchups will be tracked here.
          </p>
          <div className="pt-2">
            <Link to="/tournaments" className="btn btn-cyan btn-sm">
              Explore Tournaments
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
