import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/games')
      .then((res) => {
        setGames(res.data);
        setError(null);
      })
      .catch(() => {
        setError('Unable to load game catalog. Please check your connection.');
        setGames([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-12 relative overflow-hidden text-center max-w-4xl mx-auto">
        <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
          Esports Titles & Arenas
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
          Browse Games
        </h1>
        <p className="text-sm text-[#94a3b8] mt-2 max-w-xl mx-auto">
          Explore competitive games, find active tournaments, and jump straight into the action.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search games by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-custom text-center"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Games Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-panel h-72 animate-pulse bg-[#0e1326]/60 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <article
              key={game.id}
              className="glass-panel overflow-hidden flex flex-col justify-between group hover:border-[#00f2fe] transition-all hover:scale-[1.02]"
            >
              {/* Game Poster / Icon Banner */}
              <div className="h-44 relative overflow-hidden bg-[#090c1a]">
                <img
                  src={game.iconUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60'}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090c1a] via-transparent to-transparent"></div>
                
                {/* Active Tournaments Badge */}
                <div className="absolute top-3 right-3">
                  <span className="badge badge-ongoing text-[10px] font-bold shadow-lg">
                    {game.tournamentCount} {game.tournamentCount === 1 ? 'Tournament' : 'Tournaments'}
                  </span>
                </div>
              </div>

              {/* Game Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1.5 line-clamp-2 leading-relaxed">
                    {game.description || 'Competitive tournament title hosted on ARCADIA.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/tournaments?game=${encodeURIComponent(game.name)}`)}
                    className="btn btn-cyan w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Explore Tournaments</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-[#94a3b8] space-y-3 max-w-md mx-auto">
          <span className="text-4xl block">🎮</span>
          <h3 className="text-lg font-bold text-white">No Games Found</h3>
          <p className="text-xs">
            No titles match your search "{search}". Try searching for another game title.
          </p>
          <button onClick={() => setSearch('')} className="btn btn-outline btn-sm">
            Clear Search
          </button>
        </div>
      )}

    </div>
  );
}
