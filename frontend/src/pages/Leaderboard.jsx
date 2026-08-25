import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/rankings')
      .then((res) => setRankings(res.data))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rankings.filter((r) =>
    r.username.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = rankings.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden text-center max-w-3xl mx-auto">
        <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
          Global Arena Standings
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
          Leaderboard
        </h1>
        <p className="text-sm text-[#94a3b8] mt-2">
          The best competitive players across all tournaments. Earn ranking points and build your legacy.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search by gamer tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-custom text-center"
          />
        </div>
      </div>

      {/* Top 3 Podium Spotlight (if at least 1 player) */}
      {!search && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
          
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="glass-panel podium-rank-2 p-6 text-center order-2 md:order-1 transform hover:-translate-y-1 transition-all">
              <span className="text-3xl block mb-2">🥈</span>
              <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Rank #2</span>
              <h3 className="text-xl font-bold text-white mt-1">{topThree[1].username}</h3>
              <div className="mt-4 pt-4 border-t border-[#1e2648] flex justify-around text-xs">
                <div>
                  <span className="text-[#94a3b8] block">Points</span>
                  <span className="font-bold text-[#00f2fe] text-base">{topThree[1].points}</span>
                </div>
                <div>
                  <span className="text-[#94a3b8] block">Record</span>
                  <span className="font-bold text-white text-base">{topThree[1].wins}W / {topThree[1].losses}L</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Center) */}
          {topThree[0] && (
            <div className="glass-panel podium-rank-1 p-8 text-center order-1 md:order-2 md:-translate-y-4 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
              <span className="text-5xl block mb-2 animate-bounce">👑</span>
              <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest">Grand Champion #1</span>
              <h3 className="text-2xl font-black text-white mt-1">{topThree[0].username}</h3>
              <div className="mt-4 pt-4 border-t border-[#f59e0b]/40 flex justify-around text-xs">
                <div>
                  <span className="text-[#94a3b8] block">Points</span>
                  <span className="font-black text-[#f59e0b] text-xl">{topThree[0].points}</span>
                </div>
                <div>
                  <span className="text-[#94a3b8] block">Record</span>
                  <span className="font-bold text-white text-base">{topThree[0].wins}W / {topThree[0].losses}L</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="glass-panel podium-rank-3 p-6 text-center order-3 md:order-3 transform hover:-translate-y-1 transition-all">
              <span className="text-3xl block mb-2">🥉</span>
              <span className="text-xs font-bold text-[#d97706] uppercase tracking-widest">Rank #3</span>
              <h3 className="text-xl font-bold text-white mt-1">{topThree[2].username}</h3>
              <div className="mt-4 pt-4 border-t border-[#1e2648] flex justify-around text-xs">
                <div>
                  <span className="text-[#94a3b8] block">Points</span>
                  <span className="font-bold text-[#00f2fe] text-base">{topThree[2].points}</span>
                </div>
                <div>
                  <span className="text-[#94a3b8] block">Record</span>
                  <span className="font-bold text-white text-base">{topThree[2].wins}W / {topThree[2].losses}L</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Rankings Table */}
      <div className="glass-panel p-6 sm:p-8 space-y-4 max-w-5xl mx-auto">
        <h3 className="text-lg font-bold text-white">Full Ranking Table</h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-[#0e1326] animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                  <th className="pb-3 w-16">Rank</th>
                  <th className="pb-3">Gamer Tag</th>
                  <th className="pb-3">Ranking Points</th>
                  <th className="pb-3">Matches Won</th>
                  <th className="pb-3">Matches Lost</th>
                  <th className="pb-3 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b36]">
                {filtered.map((row) => {
                  const total = row.wins + row.losses;
                  const winRate = total > 0 ? Math.round((row.wins / total) * 100) : 0;

                  return (
                    <tr key={row.rank} className="hover:bg-[#141b36]/30">
                      <td className="py-3.5 font-black text-sm">
                        {row.rank === 1 ? '🥇 #1' : row.rank === 2 ? '🥈 #2' : row.rank === 3 ? '🥉 #3' : `#${row.rank}`}
                      </td>
                      <td className="py-3.5 font-bold text-white text-sm">
                        {row.username}
                      </td>
                      <td className="py-3.5 font-black text-[#00f2fe] text-sm">
                        {row.points} PTS
                      </td>
                      <td className="py-3.5 text-[#10b981] font-semibold">
                        {row.wins}
                      </td>
                      <td className="py-3.5 text-[#f43f5e] font-semibold">
                        {row.losses}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-white">
                        {winRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#94a3b8] text-xs">
            No rankings available. Play matches to establish your ranking!
          </div>
        )}
      </div>

    </div>
  );
}
