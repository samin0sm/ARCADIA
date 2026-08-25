import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ isRegister = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(isRegister ? 'register' : 'login');
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'PLAYER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickFill = (role) => {
    if (role === 'PLAYER') {
      setForm({
        ...form,
        email: 'player@gamingevents.local',
        password: 'Password123!'
      });
    } else if (role === 'ORGANIZER') {
      setForm({
        ...form,
        email: 'organizer@gamingevents.local',
        password: 'Password123!'
      });
    } else if (role === 'ADMIN') {
      setForm({
        ...form,
        email: 'admin@gamingevents.local',
        password: 'Password123!'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const payload = {
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        };
        const user = await login(payload, '/auth/register');
        navigate(user.role === 'ORGANIZER' ? '/dashboard' : '/tournaments');
      } else {
        const payload = {
          email: form.email.trim(),
          password: form.password
        };
        const user = await login(payload, '/auth/login');
        navigate(user.role === 'ORGANIZER' ? '/dashboard' : '/tournaments');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Authentication failed. Please check your credentials and try again.'
      );
      setLoading(false);
    }
  };

  // Password rules validation for register
  const hasMinLen = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasDigit = /\d/.test(form.password);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6">
      <div className="glass-panel w-full max-w-md p-8 relative border-[#8b5cf6]/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] space-y-6">
        
        {/* Header & Mode Switcher */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#00f2fe] flex items-center justify-center text-2xl font-black text-black mx-auto mb-2 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            ⚡
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
            {mode === 'register' ? 'Join the Arena' : 'Welcome Back'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[#090c1a] p-1 border border-[#1e2648]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/40 text-[#fda4af] text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-custom"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
                  Gamer Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. ShadowStriker"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-custom"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
                  Account Type
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-custom text-sm font-semibold"
                >
                  <option value="PLAYER">Player (Join tournaments, compete, win tokens)</option>
                  <option value="ORGANIZER">Organizer (Host tournaments, referee matches)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="gamer@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-custom"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#94a3b8] uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-custom"
              required
            />
          </div>

          {/* Password requirement checklist when registering */}
          {mode === 'register' && (
            <div className="p-3 rounded-lg bg-[#090c1a] border border-[#1e2648] grid grid-cols-2 gap-1.5 text-[11px]">
              <span className={hasMinLen ? 'text-[#10b981]' : 'text-[#64748b]'}>
                {hasMinLen ? '✓' : '○'} 8+ Characters
              </span>
              <span className={hasUpper ? 'text-[#10b981]' : 'text-[#64748b]'}>
                {hasUpper ? '✓' : '○'} 1 Uppercase Letter
              </span>
              <span className={hasLower ? 'text-[#10b981]' : 'text-[#64748b]'}>
                {hasLower ? '✓' : '○'} 1 Lowercase Letter
              </span>
              <span className={hasDigit ? 'text-[#10b981]' : 'text-[#64748b]'}>
                {hasDigit ? '✓' : '○'} 1 Number
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              {loading ? 'Authenticating...' : mode === 'register' ? 'Create My Account' : 'Sign In to Arena'}
            </button>
          </div>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-[#1e2648] space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] block text-center">
            Quick Fill Demo Accounts (Password: Password123!)
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('PLAYER')}
              className="px-2.5 py-1 rounded bg-[#0e1326] border border-[#1e2648] text-[#00f2fe] text-[11px] font-bold hover:border-[#00f2fe]"
            >
              🎮 Demo Player
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ORGANIZER')}
              className="px-2.5 py-1 rounded bg-[#0e1326] border border-[#1e2648] text-[#8b5cf6] text-[11px] font-bold hover:border-[#8b5cf6]"
            >
              👑 Demo Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="px-2.5 py-1 rounded bg-[#0e1326] border border-[#1e2648] text-[#f59e0b] text-[11px] font-bold hover:border-[#f59e0b]"
            >
              🛡️ Platform Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
