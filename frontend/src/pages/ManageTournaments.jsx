import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ManageTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const fetchTournaments = useCallback(async () => {
    try {
      const res = await api.get('/tournaments/organizer');
      setTournaments(res.data);
      if (res.data.length > 0 && !selectedTournament) {
        setSelectedTournament(res.data[0]);
      }
    } catch {
      setNotice({ type: 'error', text: 'Failed to load your tournaments.' });
    } finally {
      setLoading(false);
    }
  }, [selectedTournament]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const fetchRegistrations = useCallback(async (tournId) => {
    try {
      const res = await api.get(`/tournaments/${tournId}/registrations`);
      setRegistrations(res.data);
    } catch {
      setRegistrations([]);
    }
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchRegistrations(selectedTournament.id);
    }
  }, [selectedTournament, fetchRegistrations]);

  const handleApprove = async (regId) => {
    try {
      await api.put(`/tournaments/registrations/${regId}/approve`);
      setNotice({ type: 'success', text: 'Player registration approved!' });
      if (selectedTournament) {
        fetchRegistrations(selectedTournament.id);
        fetchTournaments();
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Approval failed.' });
    }
  };

  const handleGeneratePairings = async (tournId) => {
    try {
      await api.post(`/tournaments/${tournId}/pairings`);
      setNotice({ type: 'success', text: '🔥 Elimination bracket generated! Matches scheduled.' });
      fetchTournaments();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Failed to generate pairings.' });
    }
  };

  const handleDelete = async (tournId) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await api.delete(`/tournaments/${tournId}`);
      setNotice({ type: 'success', text: 'Tournament removed.' });
      setSelectedTournament(null);
      fetchTournaments();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Failed to delete tournament.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Organizer Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Manage Tournaments
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Review player applications, approve participant slots, and generate live elimination brackets.
            </p>
          </div>

          <Link to="/create" className="btn btn-primary btn-sm font-bold">
            + Host New Tournament
          </Link>
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
        <div className="glass-panel p-12 text-center text-[#94a3b8]">Loading events...</div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tournament Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              Your Tournaments ({tournaments.length})
            </h3>

            {tournaments.map((t) => {
              const isSelected = selectedTournament?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#141b36] border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                      : 'bg-[#090c1a] border-[#1e2648] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#8b5cf6]">{t.gameName}</span>
                    <span className="badge text-[9px] badge-upcoming">{t.status}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{t.name}</h4>
                  <div className="flex justify-between text-[11px] text-[#94a3b8] mt-2">
                    <span>{t.approvedCount ?? 0} approved / {t.registeredCount ?? 0} signups</span>
                    <span>{t.matchCount ?? 0} matches</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tournament Details & Registrations Pane */}
          {selectedTournament && (
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2648]">
                <div>
                  <span className="text-xs font-bold text-[#8b5cf6] uppercase">{selectedTournament.gameName}</span>
                  <h2 className="text-2xl font-black text-white">{selectedTournament.name}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/tournaments/${selectedTournament.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Bracket
                  </Link>

                  {selectedTournament.status === 'UPCOMING' && (
                    <button
                      onClick={() => handleGeneratePairings(selectedTournament.id)}
                      className="btn btn-cyan btn-sm font-bold"
                    >
                      ⚔️ Generate Bracket
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(selectedTournament.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete Event
                  </button>
                </div>
              </div>

              {/* Player Applications Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Player Applications ({registrations.length})
                  </h3>
                  <span className="text-xs text-[#94a3b8]">
                    {registrations.filter((r) => r.status === 'APPROVED').length} Approved
                  </span>
                </div>

                {registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                          <th className="pb-3">Gamer Tag</th>
                          <th className="pb-3">Registered At</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Approval</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141b36]">
                        {registrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-[#141b36]/30">
                            <td className="py-3 font-bold text-white">{reg.username}</td>
                            <td className="py-3 text-[#94a3b8]">
                              {new Date(reg.registrationDate).toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span
                                className={`badge text-[10px] ${
                                  reg.status === 'APPROVED' ? 'badge-completed' : 'badge-pending'
                                }`}
                              >
                                {reg.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {reg.status !== 'APPROVED' ? (
                                <button
                                  onClick={() => handleApprove(reg.id)}
                                  className="btn btn-success btn-sm text-xs py-1"
                                >
                                  Approve Player
                                </button>
                              ) : (
                                <span className="text-[#10b981] font-semibold text-xs">✓ Ready for Bracket</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#94a3b8] text-xs">
                    No registrations submitted for this tournament yet.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3">
          <span className="text-4xl block">🎮</span>
          <h3 className="text-lg font-bold text-white">No Tournaments Hosted</h3>
          <p className="text-xs max-w-sm mx-auto">
            You have not hosted any competitive events yet. Create your first tournament to get started!
          </p>
          <div className="pt-2">
            <Link to="/create" className="btn btn-primary btn-sm">
              + Host a Tournament
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
