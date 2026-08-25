import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const meRes = await api.get('/auth/me');
      let extra = {};
      if (meRes.data.role === 'PLAYER') {
        try {
          const profRes = await api.get('/players/profile');
          extra = {
            profileId: profRes.data.id,
            username: profRes.data.username,
            tokenBalance: profRes.data.tokenBalance,
            rankingPoints: profRes.data.rankingPoints,
            wins: profRes.data.wins,
            losses: profRes.data.losses,
            totalMatches: profRes.data.totalMatches,
            profileImage: profRes.data.profileImage,
            favoriteGame: profRes.data.favoriteGame,
            skillLevel: profRes.data.skillLevel
          };
        } catch (e) {
          // ignore profile fetch error
        }
      }
      const updated = { ...meRes.data, ...extra };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setLoading(false);
      return updated;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data, path = '/auth/login') => {
    const res = await api.post(path, data);
    const token = res.data.accessToken;
    localStorage.setItem('token', token);
    const baseUser = {
      role: res.data.role,
      email: res.data.email,
      name: res.data.name
    };
    localStorage.setItem('user', JSON.stringify(baseUser));
    setUser(baseUser);
    
    // Fetch full profile info right after login
    setTimeout(() => {
      refreshUser();
    }, 50);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
