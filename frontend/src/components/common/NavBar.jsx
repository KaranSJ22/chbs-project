import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin, isNormal } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#003366] text-white px-6 py-3 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-wide">HSFC Hall Booking System</h1>
      </div>

      <div className="flex items-center gap-6 font-medium text-sm">
        {/* Dashboard Link (Role-based) */}
        {/* {isAdmin ? (
          <Link
            to="/admin"
            className={`hover:text-[#FF6600] transition-colors ${location.pathname === '/admin' ? 'text-[#FF6600]' : ''}`}
          >
            Admin Dashboard
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className={`hover:text-[#FF6600] transition-colors ${location.pathname === '/dashboard' ? 'text-[#FF6600]' : ''}`}
          >
            Dashboard
          </Link>
        )} */}

        {isAdmin && <Link to="admin">Admin Dashboard</Link>}
        {isNormal && <Link to="dashboard">Dashboard</Link>}
        {/* Book Hall Link */}
        <Link
          to="/book"
          className={`hover:text-[#FF6600] transition-colors ${location.pathname === '/book' ? 'text-[#FF6600]' : ''}`}
        >
          Book Hall
        </Link>
        <Link
          to="/timeline"
          className={`hover:text-[#FF6600] transition-colors ${location.pathname === '/timeline' ? 'text-[#FF6600]' : ''}`}
        >
          Timeline
        </Link>
        {/* Logout Button */}
        <button
          className="bg-[#FF6600] px-4 py-1.5 rounded text-white font-bold hover:bg-orange-700 transition shadow"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;