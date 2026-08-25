import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MatchResultModal from '../components/MatchResultModal';

export default function ManageMatches() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournId, setSelectedTournId] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api.get('/tournaments/organizer')
      .then((res) => {
        setTournaments(res.data);
        if (res.data.length > 0) {
          setSelectedTournId(String(res.data[0].id));
        }
      })
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const fetchMatches = useCallback(async (tournId) => {
    if (!tournId) return;
    try {
      const res = await api.get(`/tournaments/${tournId}/matches`);
      setMatches(res.data);
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    if (selectedTournId) {
      fetchMatches(selectedTournId);
    }
  }, [selectedTournId, fetchMatches]);

  const activeTournament = tournaments.find((t) => String(t.id) === String(selectedTournId));

  // Group matches by round
  const matchesByRound = matches.reduce((acc, m) => {
    const rNum = m.roundNumber || 1;
    if (!acc[rNum]) acc[rNum] = { name: m.roundName || `Round ${rNum}`, list: [] };
    acc[rNum].list.push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Tournament Referee
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Match Scores & Results
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Set matches LIVE, input game scores, and declare match winners to automatically advance bracket rounds.
            </p>
          </div>

          {/* Tournament selector */}
          {tournaments.length > 0 && (
            <div className="min-w-[260px]">
              <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
                Select Tournament
              </label>
              <select
                value={selectedTournId}
                onChange={(e) => setSelectedTournId(e.target.value)}
                className="input-custom text-sm font-semibold"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.gameName})
                  </option>
                ))}
              </select>
            </div>
          )}
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

      {loading ? (
        <div className="glass-panel p-12 text-center text-[#94a3b8]">Loading matches...</div>
      ) : matches.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(matchesByRound).map(([roundNum, roundData]) => (
            <div key={roundNum} className="glass-panel p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2648] pb-3">
                <h3 className="text-base font-black uppercase text-[#00f2fe] tracking-wider">
                  {roundData.name}
                </h3>
                <span className="text-xs text-[#94a3b8]">
                  {roundData.list.filter((m) => m.status === 'COMPLETED').length} / {roundData.list.length} completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundData.list.map((m) => {
                  const isCompleted = m.status === 'COMPLETED';
                  const isLive = m.status === 'LIVE';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl bg-[#090c1a] border transition-all ${
                        isLive
                          ? 'border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                          : 'border-[#1e2648]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono text-[#94a3b8]">Match #{m.id}</span>
                        <span
                          className={`badge text-[9px] ${
                            isLive ? 'badge-ongoing' : isCompleted ? 'badge-completed' : 'badge-pending'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {/* Opponents */}
                      <div className="space-y-2 text-sm">
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isCompleted && m.winnerId === m.playerOneId
                              ? 'bg-[#10b981]/15 text-[#34d399] font-bold'
                              : 'bg-[#121832] text-white'
                          }`}
                        >
                          <span className="truncate max-w-[160px]">{m.playerOne || 'TBD'}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#090c1a]">
                            {m.playerOneScore !== null && m.playerOneScore !== undefined ? m.playerOneScore : '-'}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isCompleted && m.winnerId === m.playerTwoId
                              ? 'bg-[#10b981]/15 text-[#34d399] font-bold'
                              : 'bg-[#121832] text-white'
                          }`}
                        >
                          <span className="truncate max-w-[160px]">{m.playerTwo || 'TBD'}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#090c1a]">
                            {m.playerTwoScore !== null && m.playerTwoScore !== undefined ? m.playerTwoScore : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-4 pt-3 border-t border-[#1a223f] flex items-center justify-between">
                        <span className="text-xs text-[#94a3b8]">
                          {isCompleted ? `Winner: ${m.winner}` : 'Awaiting result'}
                        </span>
                        <button
                          onClick={() => setSelectedMatch(m)}
                          className="btn btn-primary btn-sm text-xs py-1"
                        >
                          {isCompleted ? 'Edit Score' : 'Set Score / Winner'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3">
          <span className="text-4xl block">⚔️</span>
          <h3 className="text-lg font-bold text-white">No Matches Created</h3>
          <p className="text-xs max-w-sm mx-auto">
            {activeTournament
              ? 'This tournament does not have bracket pairings yet. Go to Manage Tournaments to approve player applications and generate the bracket!'
              : 'Select a tournament above to manage match pairings and results.'}
          </p>
          {activeTournament && (
            <div className="pt-2">
              <Link to={`/tournaments/${activeTournament.id}`} className="btn btn-cyan btn-sm">
                Open Tournament Page
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Edit Match Score / Result Modal */}
      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdated={() => {
            setNotice({ type: 'success', text: 'Match result saved! Bracket automatically advanced.' });
            if (selectedTournId) fetchMatches(selectedTournId);
          }}
        />
      )}

    </div>
  );
}
