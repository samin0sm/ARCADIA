import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#1e2648] bg-[#050710] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8b5cf6] to-[#00f2fe] flex items-center justify-center font-black text-black text-base">
              ⚡
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">
              ARCADIA<span className="text-[#00f2fe]">//</span>
            </span>
          </div>
          <p className="text-sm text-[#94a3b8] max-w-sm leading-relaxed">
            The next-generation competitive esports and gaming tournament platform. Create brackets, battle the best players, earn tokens, and dominate the global rankings.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#00f2fe]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block animate-pulse"></span>
            <span>All tournament services active</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] mb-3">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li><Link to="/tournaments" className="hover:text-white transition-colors">Tournaments</Link></li>
            <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
            <li><Link to="/rewards" className="hover:text-white transition-colors">Token Rewards</Link></li>
            <li><Link to="/create" className="hover:text-white transition-colors">Host an Event</Link></li>
          </ul>
        </div>

        {/* Legal & Tech */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] mb-3">
            Ecosystem
          </h4>
          <ul className="space-y-2 text-sm text-[#94a3b8]">
            <li><span className="text-[#64748b]">Spring Boot 3 + PostgreSQL</span></li>
            <li><span className="text-[#64748b]">JWT Secure Authentication</span></li>
            <li><span className="text-[#64748b]">Single-Elimination Brackets</span></li>
            <li><span className="text-[#64748b]">Real-Time Ranking Sync</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#141b36] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748b]">
        <p>© {new Date().getFullYear()} ARCADIA Gaming Platform. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Engineered for Competitive Gamers</span>
        </p>
      </div>
    </footer>
  );
}
