import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard Perso' },
    { path: '/profil', label: 'Profil' },
    { path: '/poste', label: 'Poste' },
    { path: '/formation', label: 'Formation' },
    { path: '/forum', label: 'Forum', teal: true },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MIWAI</span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? item.teal
                      ? 'bg-teal-400 text-white rounded-full px-4 py-2 text-sm font-semibold transition-all'
                      : 'bg-orange-500 text-white rounded-full px-4 py-2 text-sm font-semibold transition-all'
                    : 'text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-all rounded-full hover:bg-gray-100'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.firstName || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-3 flex flex-wrap gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? item.teal
                    ? 'bg-teal-400 text-white rounded-full px-3 py-1.5 text-xs font-semibold'
                    : 'bg-orange-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold'
                  : 'text-gray-600 border border-gray-200 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-gray-50'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
