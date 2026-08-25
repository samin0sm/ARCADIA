import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Shop() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shop/items');
      setItems(res.data);
    } catch (err) {
      setError('Failed to load rewards shop.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (!user) {
      setError('Please login as a player to redeem items.');
      return;
    }
    if (user.role !== 'PLAYER') {
      setError('Only players can redeem items from the rewards shop.');
      return;
    }

    setPurchasingId(item.id);
    setMsg(null);
    setError(null);

    try {
      const res = await api.post(`/shop/purchase/${item.id}`);
      setMsg(res.data.message);
      await refreshUser();
      await fetchShopItems();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Purchase failed. Ensure you have enough tokens.';
      setError(errMsg);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1))',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          marginBottom: '2rem',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              🪙 Token Rewards Store
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0' }}>
              Redeem Exclusive Perks
            </h1>
            <p className="text-secondary" style={{ maxWidth: '600px', margin: 0 }}>
              Win tournaments to earn victory tokens, then unlock elite badges, cosmetic frames, and VIP passes.
            </p>
          </div>

          {user && user.role === 'PLAYER' && (
            <div 
              style={{
                background: 'var(--surface-light)',
                border: '1px solid var(--border)',
                padding: '1.25rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                Your Token Balance
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#eab308', marginTop: '0.25rem' }}>
                🪙 {user.tokenBalance !== undefined ? user.tokenBalance : 0}
              </div>
            </div>
          )}
        </div>
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{msg}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Item Catalog Grid */}
      {loading ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-secondary">Loading shop catalog...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {items.map((item) => {
            const canAfford = user && user.tokenBalance >= item.price;

            return (
              <div 
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  border: item.owned ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)',
                  background: item.owned ? 'linear-gradient(180deg, rgba(34, 197, 94, 0.05), var(--surface))' : 'var(--surface)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.8rem', background: 'var(--surface-light)', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      {item.iconUrl || '🎁'}
                    </div>
                    {item.owned ? (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                        ✓ UNLOCKED
                      </span>
                    ) : (
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                        {item.itemType}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.5', minHeight: '42px' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#eab308' }}>
                    🪙 {item.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOKENS</span>
                  </div>

                  {item.owned ? (
                    <button className="btn" disabled style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', cursor: 'default' }}>
                      Owned
                    </button>
                  ) : (
                    <button
                      className={`btn ${canAfford ? 'btn-primary' : 'btn-outline'}`}
                      disabled={purchasingId === item.id || (user && !canAfford)}
                      onClick={() => handlePurchase(item)}
                      style={{ minWidth: '100px' }}
                    >
                      {purchasingId === item.id ? 'Unlocking...' : canAfford ? 'Redeem' : 'Need Tokens'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
