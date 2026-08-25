import React, { useState } from 'react';
import api from '../services/api';

export default function MatchResultModal({ match, onClose, onUpdated }) {
  const [playerOneScore, setPlayerOneScore] = useState(match.playerOneScore ?? 0);
  const [playerTwoScore, setPlayerTwoScore] = useState(match.playerTwoScore ?? 0);
  const [winnerId, setWinnerId] = useState(match.winnerId ?? match.playerOneId);
  const [status, setStatus] = useState(match.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!match) return null;

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // First update status if needed
      if (status !== 'COMPLETED') {
        await api.put(`/matches/${match.id}/status`, { status });
      }
      
      // If winner is chosen, submit result
      if (winnerId) {
        await api.put(`/matches/${match.id}/result`, {
          winnerId: Number(winnerId),
          playerOneScore: Number(playerOneScore),
          playerTwoScore: Number(playerTwoScore)
        });
      }
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update match.');
      setSubmitting(false);
    }
  };

  const handleSetStatusOnly = async (newStatus) => {
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/matches/${match.id}/status`, { status: newStatus });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 relative border-[#8b5cf6]/50 shadow-[0_0_50px_rgba(139,92,246,0.25)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <span className="text-[11px] font-black uppercase tracking-wider text-[#00f2fe]">
          Match #{match.id} · {match.roundName}
        </span>
        <h3 className="text-xl font-bold text-white mt-1 mb-4">
          Update Fixture
        </h3>

        {error && (
          <div className="p-3 rounded-lg bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Quick status actions */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleSetStatusOnly('LIVE')}
            disabled={submitting}
            className={`btn btn-sm flex-1 ${
              match.status === 'LIVE'
                ? 'btn-primary'
                : 'btn-outline text-[#a78bfa] border-[#8b5cf6]/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping mr-1"></span>
            Set Match LIVE
          </button>
          <button
            type="button"
            onClick={() => handleSetStatusOnly('SCHEDULED')}
            disabled={submitting}
            className={`btn btn-sm flex-1 ${
              match.status === 'SCHEDULED' ? 'bg-[#334155] text-white' : 'btn-outline'
            }`}
          >
            Set Scheduled
          </button>
        </div>

        <form onSubmit={handleSubmitResult} className="space-y-4">
          <div className="space-y-3 p-4 rounded-xl bg-[#090c1a] border border-[#1e2648]">
            <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Scores & Winner Selection
            </h4>

            {/* Player One */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-white flex-1 truncate">
                {match.playerOne}
              </label>
              <input
                type="number"
                min="0"
                value={playerOneScore}
                onChange={(e) => setPlayerOneScore(e.target.value)}
                className="input-custom w-20 text-center font-mono font-bold"
                required
              />
            </div>

            {/* Player Two */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-white flex-1 truncate">
                {match.playerTwo}
              </label>
              <input
                type="number"
                min="0"
                value={playerTwoScore}
                onChange={(e) => setPlayerTwoScore(e.target.value)}
                className="input-custom w-20 text-center font-mono font-bold"
                required
              />
            </div>

            {/* Select Winner Radio / Dropdown */}
            <div className="pt-2 border-t border-[#1a223f]">
              <label className="block text-xs font-bold text-[#94a3b8] mb-1.5">
                Official Winner
              </label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="input-custom text-sm font-semibold"
                required
              >
                <option value={match.playerOneId}>🏆 {match.playerOne}</option>
                <option value={match.playerTwoId}>🏆 {match.playerTwo}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'Submitting...' : 'Save & Crown'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
