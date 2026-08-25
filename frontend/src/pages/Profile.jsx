import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    username: '',
    favoriteGame: '',
    skillLevel: 'Beginner',
    profileImage: ''
  });
  const [profileData, setProfileData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/players/profile')
      .then((res) => {
        setProfileData(res.data);
        setForm({
          username: res.data.username || '',
          favoriteGame: res.data.favoriteGame || '',
          skillLevel: res.data.skillLevel || 'Beginner',
          profileImage: res.data.profileImage || ''
        });
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Unable to fetch player profile.' });
      });

    api.get('/shop/inventory')
      .then((res) => {
        setInventory(res.data?.items || []);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/players/profile', form);
      setProfileData(res.data);
      setMessage({ type: 'success', text: '✅ Gamer profile updated successfully!' });
      refreshUser();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#00f2fe] flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            {form.profileImage ? (
              <img src={form.profileImage} alt="Avatar" className="w-full h-full object-cover rounded-2xl" onError={(e) => { e.target.style.display='none'; }} />
            ) : (
              form.username ? form.username.charAt(0).toUpperCase() : '🎮'
            )}
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00f2fe]">
              Gamer Identity
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {profileData?.username || 'Your Profile'}
            </h1>
            <p className="text-xs text-[#94a3b8]">
              Manage your gamer tag, favorite games, and view career statistics and inventory.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
            message.type === 'success'
              ? 'bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399]'
              : 'bg-[#f43f5e]/20 border border-[#f43f5e]/50 text-[#fda4af]'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Edit Form */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Edit Profile Details</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                Gamer Tag (Username)
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-custom"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Favorite Game
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valorant, CS2, League of Legends"
                  value={form.favoriteGame}
                  onChange={(e) => setForm({ ...form, favoriteGame: e.target.value })}
                  className="input-custom"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                  Skill Level
                </label>
                <select
                  value={form.skillLevel}
                  onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                  className="input-custom"
                >
                  <option value="Beginner">Beginner Tier</option>
                  <option value="Intermediate">Intermediate Tier</option>
                  <option value="Advanced">Advanced Tier</option>
                  <option value="Professional / Pro">Professional / Esports Pro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1.5">
                Profile Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/avatar.png"
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                className="input-custom"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full py-3 font-bold"
              >
                {saving ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>

          {/* Unlocked Inventory Section */}
          <div className="pt-6 border-t border-[#1e2648]">
            <h3 className="text-base font-bold text-white mb-3">🎖️ Unlocked Perks & Badges ({inventory.length})</h3>
            {inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center gap-3">
                    <span className="text-2xl">{item.iconUrl || '🎁'}</span>
                    <div>
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <span className="text-[10px] text-[#00f2fe] uppercase font-semibold">{item.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94a3b8]">
                No items redeemed yet. Visit the <a href="/shop" className="text-[#00f2fe] underline">Rewards Store</a> to unlock perks with your victory tokens!
              </p>
            )}
          </div>
        </div>

        {/* Career Stats Column */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Career Snapshot</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center justify-between">
              <span className="text-xs text-[#94a3b8] font-bold uppercase">Token Balance</span>
              <span className="text-xl font-black text-[#f59e0b]">🪙 {profileData?.tokenBalance ?? 0}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center justify-between">
              <span className="text-xs text-[#94a3b8] font-bold uppercase">Ranking Points</span>
              <span className="text-xl font-black text-[#00f2fe]">{profileData?.rankingPoints ?? 0} PTS</span>
            </div>

            <div className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center justify-between">
              <span className="text-xs text-[#94a3b8] font-bold uppercase">Win / Loss Record</span>
              <span className="text-base font-black text-[#10b981]">
                {profileData?.wins ?? 0}W <span className="text-[#94a3b8] font-normal">/ {profileData?.losses ?? 0}L</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center justify-between">
              <span className="text-xs text-[#94a3b8] font-bold uppercase">Win Rate</span>
              <span className="text-base font-black text-white">
                {profileData?.totalMatches > 0
                  ? `${Math.round((profileData.wins / profileData.totalMatches) * 100)}%`
                  : '0%'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090c1a] border border-[#1e2648] flex items-center justify-between">
              <span className="text-xs text-[#94a3b8] font-bold uppercase">Total Matches</span>
              <span className="text-base font-black text-white">{profileData?.totalMatches ?? 0}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
