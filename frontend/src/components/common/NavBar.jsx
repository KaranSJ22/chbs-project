import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = ({ userRole = "Employee" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold tracking-wide">Hall Booking System</span>
          {/* <span className="text-xs bg-blue-800 px-2 py-1 rounded text-blue-100 uppercase tracking-wider border border-blue-700">
            {userRole}
          </span> */}
        </div>

        {/* Links */}
        <div className="flex items-center space-x-8 text-sm font-medium">
          <Link to="/dashboard" className="hover:text-blue-200 transition-colors">
            Dashboard
          </Link>
          <Link to="/book" className="hover:text-blue-200 transition-colors">
            New Booking
          </Link>
          {userRole === 'Admin' && (
            <Link to="/admin" className="hover:text-blue-200 transition-colors">
              Admin Console
            </Link>
          )}
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors uppercase tracking-wide"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;