import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#070913]/90 backdrop-blur-md border-b border-[#1e2648]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#00f2fe] flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-white">
            ARCADIA<span className="text-[#00f2fe]">//</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/games"
            className={`text-sm font-semibold transition-colors ${
              isActive('/games') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Games
          </Link>
          <Link
            to="/tournaments"
            className={`text-sm font-semibold transition-colors ${
              isActive('/tournaments') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Tournaments
          </Link>
          <Link
            to="/leaderboard"
            className={`text-sm font-semibold transition-colors ${
              isActive('/leaderboard') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            to="/shop"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isActive('/shop') ? 'text-[#eab308]' : 'text-[#94a3b8] hover:text-[#eab308]'
            }`}
          >
            <span>🪙</span>
            <span>Rewards Shop</span>
          </Link>

          {/* Player Links */}
          {user?.role === 'PLAYER' && (
            <>
              <Link
                to="/my-tournaments"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/my-tournaments') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                My Events
              </Link>
              <Link
                to="/matches"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/matches') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Match History
              </Link>
              <Link
                to="/rewards"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/rewards') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Wallet
              </Link>
            </>
          )}

          {/* Organizer Links */}
          {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
            <>
              <Link
                to="/create"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/create') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                + Create Event
              </Link>
              <Link
                to="/manage-tournaments"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/manage-tournaments') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Manage Events
              </Link>
              <Link
                to="/manage-matches"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/manage-matches') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Matches & Scores
              </Link>
            </>
          )}

          {/* Admin Links */}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`text-sm font-semibold transition-colors ${
                isActive('/admin') ? 'text-[#00f2fe]' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Admin Center
            </Link>
          )}
        </nav>

        {/* Right side auth & user info */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Token Wallet Badge (Player) */}
              {user.role === 'PLAYER' && (
                <Link
                  to="/rewards"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121832] border border-[#f59e0b]/40 text-[#f59e0b] hover:border-[#f59e0b] transition-colors text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  title="Your Token Balance"
                >
                  <span>🪙</span>
                  <span>{user.tokenBalance ?? 0} Tokens</span>
                </Link>
              )}

              {/* User badge */}
              <Link
                to={user.role === 'PLAYER' ? '/profile' : '/dashboard'}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0e1326] border border-[#1e2648] hover:border-[#8b5cf6] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
                  {user.username ? user.username.charAt(0).toUpperCase() : user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white max-w-[110px] truncate">
                    {user.username || user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#00f2fe]">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f43f5e] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-cyan btn-sm">
                Join Arena
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-[#0e1326] border border-[#1e2648] text-white"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0d1d] border-b border-[#1e2648] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/games"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
          >
            Games Catalog
          </Link>
          <Link
            to="/tournaments"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
          >
            Tournaments
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
          >
            Leaderboard
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#eab308] hover:bg-[#141b36]"
          >
            🪙 Rewards Shop
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
              >
                Dashboard
              </Link>
              {user.role === 'PLAYER' && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
                  >
                    Gamer Profile
                  </Link>
                  <Link
                    to="/my-tournaments"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
                  >
                    My Tournaments
                  </Link>
                  <Link
                    to="/matches"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
                  >
                    Match History
                  </Link>
                  <Link
                    to="/rewards"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-[#f59e0b] hover:bg-[#141b36]"
                  >
                    🪙 Rewards Wallet ({user.tokenBalance ?? 0} Tokens)
                  </Link>
                </>
              )}
              {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
                <>
                  <Link
                    to="/create"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-[#00f2fe] hover:bg-[#141b36]"
                  >
                    + Create Tournament
                  </Link>
                  <Link
                    to="/manage-tournaments"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
                  >
                    Manage Tournaments
                  </Link>
                  <Link
                    to="/manage-matches"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#141b36]"
                  >
                    Manage Matches & Scores
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-[#a78bfa] hover:bg-[#141b36]"
                >
                  Admin Center
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#f43f5e] hover:bg-[#141b36]"
              >
                Sign Out
              </button>
            </>
          )}

          {!user && (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-outline w-full"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn btn-cyan w-full"
              >
                Join Arena
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
