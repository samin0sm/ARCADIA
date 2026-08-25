import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Games from './pages/Games';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import CreateTournament from './pages/CreateTournament';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyTournaments from './pages/MyTournaments';
import MatchHistory from './pages/MatchHistory';
import RewardsWallet from './pages/RewardsWallet';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import ManageTournaments from './pages/ManageTournaments';
import ManageMatches from './pages/ManageMatches';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './pages/AuthPage';

function Guard({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#070913]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Games Discovery */}
            <Route path="/games" element={<Games />} />
            <Route path="/player/games" element={<Games />} />

            {/* Tournaments Discovery */}
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/player/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/player/tournaments/:id" element={<TournamentDetails />} />
            
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage isRegister />} />

            {/* Authenticated Dashboard */}
            <Route
              path="/dashboard"
              element={
                <Guard>
                  <Dashboard />
                </Guard>
              }
            />
            <Route
              path="/player/dashboard"
              element={
                <Guard roles={['PLAYER']}>
                  <Dashboard />
                </Guard>
              }
            />

            {/* Player Routes */}
            <Route
              path="/profile"
              element={
                <Guard roles={['PLAYER']}>
                  <Profile />
                </Guard>
              }
            />
            <Route
              path="/player/profile"
              element={
                <Guard roles={['PLAYER']}>
                  <Profile />
                </Guard>
              }
            />
            <Route
              path="/my-tournaments"
              element={
                <Guard roles={['PLAYER']}>
                  <MyTournaments />
                </Guard>
              }
            />
            <Route
              path="/player/my-tournaments"
              element={
                <Guard roles={['PLAYER']}>
                  <MyTournaments />
                </Guard>
              }
            />
            <Route
              path="/matches"
              element={
                <Guard roles={['PLAYER']}>
                  <MatchHistory />
                </Guard>
              }
            />
            <Route
              path="/rewards"
              element={
                <Guard roles={['PLAYER']}>
                  <RewardsWallet />
                </Guard>
              }
            />

            {/* Organizer & Admin Routes */}
            <Route
              path="/create"
              element={
                <Guard roles={['ORGANIZER', 'ADMIN']}>
                  <CreateTournament />
                </Guard>
              }
            />
            <Route
              path="/manage-tournaments"
              element={
                <Guard roles={['ORGANIZER', 'ADMIN']}>
                  <ManageTournaments />
                </Guard>
              }
            />
            <Route
              path="/manage-matches"
              element={
                <Guard roles={['ORGANIZER', 'ADMIN']}>
                  <ManageMatches />
                </Guard>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <Guard roles={['ADMIN']}>
                  <AdminPanel initialTab="dashboard" />
                </Guard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Guard roles={['ADMIN']}>
                  <AdminPanel initialTab="users" />
                </Guard>
              }
            />
            <Route
              path="/admin/tournaments"
              element={
                <Guard roles={['ADMIN']}>
                  <AdminPanel initialTab="tournaments" />
                </Guard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
