/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Compass, User, Map as MapIcon, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAppStore } from './store';
import Welcome from './pages/Welcome';
import Preferences from './pages/Preferences';
import Attractions from './pages/Attractions';
import Workbench from './pages/Workbench';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { unlockedSections } = useAppStore();

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-emerald-900 font-bold text-xl tracking-tight">
            <Compass className="w-6 h-6 text-emerald-600" />
            <span>WanderAI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/preferences"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === '/preferences'
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Trip Planner
              </Link>
              {unlockedSections.explore && (
                <Link
                  to="/attractions"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === '/attractions'
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Explore
                </Link>
              )}
              {unlockedSections.itinerary && (
                <Link
                  to="/workbench"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === '/workbench'
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Itinerary
                </Link>
              )}
              {unlockedSections.bookings && (
                <Link
                  to="/checkout"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === '/checkout'
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Bookings
                </Link>
              )}
            </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              location.pathname === '/profile'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Force redirect to / on initial load/refresh
    if (window.location.hash !== '' && window.location.hash !== '#/') {
      window.location.hash = '/';
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/attractions" element={<Attractions />} />
                <Route path="/workbench" element={<Workbench />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
}
