import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin, isNormal } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper for active link and hover styles
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `group relative w-full px-6 py-3 text-[11px] font-bold tracking-wider uppercase transition-colors hover:bg-slate-50 md:w-auto md:py-2 md:hover:bg-transparent ${isActive ? 'text-[#F47216]' : 'text-[#042848]'
      }`;
  };

  // Helper for the animated bottom border
  const Underline = ({ path }) => (
    <span className={`absolute bottom-0 left-0 hidden h-0.5 bg-[#F47216] transition-all duration-300 md:block ${location.pathname === path ? 'w-full' : 'w-0 group-hover:w-full'
      }`}></span>
  );

  return (
    <div className="bg-white font-sans text-slate-900">
      {/* --- HEADER SECTION --- */}
      <header className="relative flex flex-col items-center justify-center px-6 py-6 lg:flex-row lg:justify-between">
        <div className="flex shrink-0 items-center justify-center gap-4 lg:absolute lg:left-6">
          <img src="../../assets/logo.png" alt="HSFC" className="h-16 w-auto object-contain" />
        </div>

        <div className="mt-6 flex flex-col items-center text-center lg:mx-auto lg:mt-0">
          <p className="text-[11px] font-bold tracking-widest text-[#0E88D3] uppercase">Govt. Of India, Department Of Space</p>
          <p className="mt-0.5 text-xs font-bold tracking-widest text-[#042848] uppercase">Indian Space Research Organisation</p>
          <h1 className="mt-1 text-2xl leading-none font-black tracking-tight text-[#042848] md:text-3xl">
            Human Space Flight Centre <span className="text-[#F47216]">(HSFC)</span>
          </h1>
          <h2 className="mt-1 text-2xl leading-none font-black tracking-tight text-[#042848] md:text-2xl">Hall Booking System</h2>
        </div>
      </header>

      {/* --- STICKY NAVIGATION --- */}
      <nav className="sticky top-0 z-50 border-t-2 border-b border-t-[#042848] border-b-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4">

          {/* Mobile Menu Toggle */}
          <div className="flex items-center justify-between py-3 md:hidden">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Navigation</span>
            <label htmlFor="menu-toggle" className="cursor-pointer p-2">
              <svg className="h-5 w-5 text-[#042848]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </label>
          </div>
          <input type="checkbox" id="menu-toggle" className="peer hidden" />

          {/* Nav Links */}
          <div className="hidden flex-col items-center justify-center gap-1 py-4 transition-all peer-checked:flex md:flex md:flex-row md:gap-4 md:py-2">

            {isAdmin && (
              <Link to="/admin" className={getLinkClass('/admin')}>
                <span>ADMIN DASHBOARD</span>
                <Underline path="/admin" />
              </Link>
            )}

            {isNormal && (
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                <span>DASHBOARD</span>
                <Underline path="/dashboard" />
              </Link>
            )}

            <Link to="/book" className={getLinkClass('/book')}>
              <span>BOOK HALL</span>
              <Underline path="/book" />
            </Link>

            <Link to="/timeline" className={getLinkClass('/timeline')}>
              <span>TIMELINE</span>
              <Underline path="/timeline" />
            </Link>

            <Link to="/calendar" className={getLinkClass('/calendar')}>
              <span>CALENDAR</span>
              <Underline path="/calendar" />
            </Link>

            <Link to="/instructions" className={getLinkClass('/instructions')}>
              <span>INSTRUCTIONS</span>
              <Underline path="/instructions" />
            </Link>

            {/* Logout Button Container */}
            <div className="w-full px-6 py-2 md:w-auto md:px-0 md:py-0">
              <button
                onClick={handleLogout}
                className="w-full rounded-full bg-[#F47216] px-7 py-2 text-[11px] font-black tracking-wider text-white uppercase shadow-sm transition-all hover:scale-105 hover:bg-[#d96212] active:scale-95 md:w-auto"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;