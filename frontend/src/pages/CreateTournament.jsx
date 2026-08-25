import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateTournament() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    gameName: 'Valorant',
    description: '',
    format: 'Single Elimination',
    entryFee: 0,
    maxPlayers: 8,
    startDate: ''
  });
  const [customGame, setCustomGame] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const games = [
    'Valorant',
    'CS2',
    'League of Legends',
    'Apex Legends',
    'Rocket League',
    'Dota 2',
    'EA FC 24',
    'Rainbow Six Siege',
    'Other / Custom'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const resolvedGame = form.gameName === 'Other / Custom' ? customGame : form.gameName;
    if (!resolvedGame) {
      setError('Please specify the game name.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        gameName: resolvedGame.trim(),
        description: form.description.trim(),
        format: form.format,
        entryFee: Number(form.entryFee),
        maxPlayers: Number(form.maxPlayers),
        startDate: new Date(form.startDate).toISOString()
      };

      const res = await api.post('/tournaments', payload);
      navigate(`/tournaments/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tournament. Ensure start date is in the future.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Organizer Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Host a Tournament
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Publish a new competitive bracket for players to join.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                Tournament Title
              </label>
              <input
                type="text"
                placeholder="e.g. Arcadia Valorant Champions Series #1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-custom"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Game / Title
                </label>
                <select
                  value={form.gameName}
                  onChange={(e) => setForm({ ...form, gameName: e.target.value })}
                  className="input-custom"
                  required
                >
                  {games.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {form.gameName === 'Other / Custom' && (
                  <input
                    type="text"
                    placeholder="Enter game title..."
                    value={customGame}
                    onChange={(e) => setCustomGame(e.target.value)}
                    className="input-custom mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Tournament Format
                </label>
                <select
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="input-custom"
                  required
                >
                  <option value="Single Elimination">Single Elimination (Standard)</option>
                  <option value="Double Elimination">Double Elimination</option>
                  <option value="Round Robin">Round Robin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Maximum Players
                </label>
                <select
                  value={form.maxPlayers}
                  onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
                  className="input-custom"
                  required
                >
                  <option value="4">4 Players (Semi-Finals)</option>
                  <option value="8">8 Players (Quarter-Finals)</option>
                  <option value="16">16 Players (Round 1)</option>
                  <option value="32">32 Players (Epic Bracket)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Entry Fee (Tokens)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.entryFee}
                  onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                  className="input-custom"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                Start Date & Time (Future)
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-custom"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                Description & Tournament Rules
              </label>
              <textarea
                rows="4"
                placeholder="Explain the rules, map vetos, check-in instructions, and any requirements..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-custom resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-3.5 text-base font-bold shadow-[0_0_25px_rgba(139,92,246,0.4)]"
              >
                {submitting ? 'Publishing Event...' : '🚀 Publish Tournament'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card Column */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">
            Live Card Preview
          </span>
          <div className="glass-panel p-6 border-[#8b5cf6]/40 shadow-[0_0_30px_rgba(139,92,246,0.15)] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider bg-[#8b5cf6]/10 px-2.5 py-1 rounded-md border border-[#8b5cf6]/20">
                {form.gameName === 'Other / Custom' ? (customGame || 'Game') : form.gameName}
              </span>
              <span className="badge badge-upcoming">
                UPCOMING
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {form.name || 'Tournament Title Here'}
            </h3>

            <div className="space-y-2 text-xs text-[#94a3b8]">
              <p className="flex justify-between">
                <span className="text-white font-medium">Format:</span>
                <span>{form.format}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-white font-medium">Capacity:</span>
                <span>{form.maxPlayers} Max Players</span>
              </p>
              <p className="flex justify-between">
                <span className="text-white font-medium">Starts:</span>
                <span>{form.startDate ? new Date(form.startDate).toLocaleString() : 'Date TBD'}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-[#1e2648] flex items-center justify-between text-xs">
              <span className="font-bold text-[#f59e0b]">
                🪙 {form.entryFee > 0 ? `${form.entryFee} Tokens` : 'Free Entry'}
              </span>
              <span className="text-[#00f2fe] font-bold">
                +100 Tokens Winner Prize
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
