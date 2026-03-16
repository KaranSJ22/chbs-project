import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin, isNormal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getDesktopLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? 'rounded-full bg-[#FF9040] px-6 py-2 text-[10px] font-black text-[#042848] uppercase tracking-wider transition-colors'
      : 'rounded-full px-5 py-2 text-[10px] font-bold text-slate-500 hover:bg-[#FF9040] hover:text-[#042848] uppercase tracking-wider transition-all duration-200';
  };

  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `border-t border-white/5 px-6 py-4 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
      isActive 
        ? 'bg-white/10 pl-8 text-[#FF9040]' 
        : 'text-slate-200 hover:bg-white/5 hover:pl-8 hover:text-[#FF9040]'
    }`;
  };

  return (
    <div className="font-sans">
      
      <nav className="relative sticky top-0 z-50 w-full border-b-2 border-[#F47216] bg-[#042848] shadow-lg">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
          
          {/* Logo */}
          <div className="flex flex-1 items-center justify-start">
            <div className="rounded bg-white/95 p-1 shadow-sm transition-transform duration-300 hover:scale-105">
              <img src="../../assets/logo.png" alt="HSFC" className="h-10 w-auto object-contain md:h-14" />
            </div>
          </div>

          {/* Title */}
          <div className="flex shrink-0 flex-col items-center justify-center text-center">
            <h1 className="text-[13px] font-black tracking-tight text-white sm:text-lg md:text-3xl">Human Space Flight Centre</h1>
            <h2 className="mt-0.5 text-[9px] font-bold tracking-[0.2em] text-[#FF9040] uppercase sm:text-[10px] md:text-sm">Hall Booking System</h2>
          </div>

          {/* Hamburger Menu */}
          <div className="flex flex-1 items-center justify-end">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="block cursor-pointer p-2 text-slate-200 transition-colors hover:text-[#FF9040] md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 flex w-full flex-col border-b-2 border-[#F47216] bg-[#042848] shadow-xl md:hidden">
            
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/admin')}>Admin Dashboard</Link>
            )}
            
            {isNormal && (
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/dashboard')}>Dashboard</Link>
            )}
            
            <Link to="/book" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/book')}>Book Hall</Link>
            <Link to="/timeline" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/timeline')}>Timeline</Link>
            <Link to="/calendar" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/calendar')}>Calendar</Link>
            <Link to="/instructions" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/instructions')}>Instructions</Link>
            
            <div className="border-t border-white/5 bg-black/10 px-6 py-4">
              <button 
                onClick={handleLogout} 
                className="w-full rounded bg-[#F47216] py-3 text-[11px] font-black tracking-wider text-white uppercase shadow-md transition-all active:scale-95"
              >
                LOGOUT
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Navbar */}
      <nav className="sticky top-[72px] z-40 hidden justify-center bg-slate-50/80 py-4 backdrop-blur-md md:flex md:top-[88px]">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/50">
          
          {isAdmin && (
            <Link to="/admin" className={getDesktopLinkClass('/admin')}>Admin</Link>
          )}
          
          {isNormal && (
            <Link to="/dashboard" className={getDesktopLinkClass('/dashboard')}>Dashboard</Link>
          )}
          
          <Link to="/book" className={getDesktopLinkClass('/book')}>Book Hall</Link>
          <Link to="/timeline" className={getDesktopLinkClass('/timeline')}>Timeline</Link>
          <Link to="/calendar" className={getDesktopLinkClass('/calendar')}>Calendar</Link>
          <Link to="/instructions" className={getDesktopLinkClass('/instructions')}>Instructions</Link>
          
          <div className="mx-1 h-4 w-px bg-slate-200"></div>
          
          <button 
            onClick={handleLogout} 
            className="px-5 py-2 text-[10px] font-black text-[#F47216] uppercase transition-transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </nav>

    </div>
  );
};

export default NavBar;