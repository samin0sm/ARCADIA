import React from 'react';

export default function BracketViewer({ bracket, loading }) {
  if (loading) {
    return (
      <div className="card text-center" style={{ padding: '3rem' }}>
        <p className="text-secondary">Loading tournament bracket...</p>
      </div>
    );
  }

  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3rem', border: '1px dashed var(--border)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚔️</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Elimination Bracket Not Generated Yet</h3>
        <p className="text-secondary" style={{ maxWidth: '460px', margin: '0 auto' }}>
          The tournament organizer will generate the official matchup tree once player registration and approval are complete.
        </p>
      </div>
    );
  }

  return (
    <div className="bracket-container" style={{ overflowX: 'auto', paddingBottom: '1.5rem' }}>
      {bracket.champion && (
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(245, 158, 11, 0.05))',
            borderColor: 'rgba(234, 179, 8, 0.4)',
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1.5rem'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>👑</div>
          <div style={{ color: '#eab308', fontWeight: 800, letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Tournament Champion
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', marginTop: '0.25rem' }}>
            {bracket.champion}
          </h2>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2.5rem', minWidth: 'fit-content' }}>
        {bracket.rounds.map((round) => (
          <div key={round.roundNumber} style={{ width: '280px', display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ 
                background: 'var(--surface-light)',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '1px',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border)'
              }}
            >
              {round.roundName}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, justifyContent: 'space-around' }}>
              {round.matches.map((match) => {
                const isCompleted = match.status === 'COMPLETED';
                const isLive = match.status === 'LIVE';
                const p1Won = isCompleted && match.winner === match.playerOne;
                const p2Won = isCompleted && match.winner === match.playerTwo;

                return (
                  <div
                    key={match.id}
                    className="card"
                    style={{
                      padding: '0.85rem',
                      borderColor: isLive ? 'var(--primary)' : isCompleted ? 'rgba(34, 197, 94, 0.3)' : 'var(--border)',
                      background: isLive ? 'rgba(99, 102, 241, 0.08)' : 'var(--surface)',
                      boxShadow: isLive ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                      <span className="text-secondary" style={{ fontWeight: 600 }}>MATCH #{match.id}</span>
                      <span
                        className={`badge ${
                          isCompleted ? 'badge-success' : isLive ? 'badge-primary' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                      >
                        {match.status}
                      </span>
                    </div>

                    {/* Player 1 Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '6px',
                        marginBottom: '0.35rem',
                        background: p1Won ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-light)',
                        border: p1Won ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
                        fontWeight: p1Won ? 700 : 500
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {p1Won && '🏆 '}
                        {match.playerOne || 'TBD'}
                      </span>
                      <span style={{ fontWeight: 700, color: p1Won ? '#4ade80' : 'var(--text-secondary)' }}>
                        {match.playerOneScore !== null && match.playerOneScore !== undefined ? match.playerOneScore : '-'}
                      </span>
                    </div>

                    {/* Player 2 Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '6px',
                        background: p2Won ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-light)',
                        border: p2Won ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
                        fontWeight: p2Won ? 700 : 500
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {p2Won && '🏆 '}
                        {match.playerTwo || 'TBD'}
                      </span>
                      <span style={{ fontWeight: 700, color: p2Won ? '#4ade80' : 'var(--text-secondary)' }}>
                        {match.playerTwoScore !== null && match.playerTwoScore !== undefined ? match.playerTwoScore : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
