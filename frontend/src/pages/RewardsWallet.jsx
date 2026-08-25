import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function RewardsWallet() {
  const [data, setData] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rewards/history')
      .then((res) => setData(res.data))
      .catch(() => setData({ balance: 0, history: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">
              Platform Economy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Token Rewards Wallet
            </h1>
            <p className="text-xs text-[#94a3b8] mt-1">
              Earn tokens by competing in tournaments and claiming championship titles.
            </p>
          </div>

          {/* Glowing Balance Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#f59e0b]/20 to-[#8b5cf6]/20 border border-[#f59e0b]/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] min-w-[240px]">
            <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b]">
              Current Balance
            </span>
            <div className="text-4xl font-black text-white mt-1 flex items-center gap-3">
              <span className="text-3xl">🪙</span>
              <span>{data.balance}</span>
              <span className="text-xs font-bold text-[#f59e0b]">Tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Info Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 space-y-1">
          <span className="text-xl">🏆</span>
          <h4 className="text-sm font-bold text-white">Tournament Champion</h4>
          <p className="text-xs text-[#94a3b8]">+100 Tokens awarded automatically upon winning grand finals.</p>
        </div>
        <div className="glass-panel p-5 space-y-1">
          <span className="text-xl">⚡</span>
          <h4 className="text-sm font-bold text-white">Instant Ledger Sync</h4>
          <p className="text-xs text-[#94a3b8]">Unique transaction hash recorded for every tournament victory.</p>
        </div>
        <div className="glass-panel p-5 space-y-1">
          <span className="text-xl">🛡️</span>
          <h4 className="text-sm font-bold text-white">Verified Competition</h4>
          <p className="text-xs text-[#94a3b8]">Tokens establish your tier ranking on the global leaderboard.</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Transaction History</h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#0e1326] animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : data.history && data.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2648] text-[#00f2fe] uppercase tracking-wider">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Event / Source</th>
                  <th className="pb-3">Reward Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141b36]">
                {data.history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#141b36]/30">
                    <td className="py-3 font-mono text-[#94a3b8] text-[11px]">
                      {tx.transactionId || `TX-${tx.id}`}
                    </td>
                    <td className="py-3 font-bold text-white">
                      {tx.tournament}
                    </td>
                    <td className="py-3">
                      <span className="badge badge-completed text-[10px]">
                        {tx.rewardType}
                      </span>
                    </td>
                    <td className="py-3 font-black text-[#10b981]">
                      +{tx.amount} Tokens
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#94a3b8] text-xs">
            No token transactions recorded yet. Win a tournament to earn your first token reward!
          </div>
        )}
      </div>

    </div>
  );
}
