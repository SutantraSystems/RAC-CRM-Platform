import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../ui/NotificationBell';

export default function Navbar({ onToggleSidebar, pageTitle }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const email = user?.email || '';
  const displayName = user?.short_name || 'User';
  const initials = user?.full_name
    ? user.full_name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (email ? email.slice(0, 2).toUpperCase() : '??');

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display font-semibold text-slate-800 text-base leading-tight">{pageTitle}</h1>
          {/* <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p> */}
        </div>
      </div>

      {/* // future integration */}
      {/* Search bar - desktop */}
      {/* <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 w-64 border border-slate-100 focus-within:border-primary-300 focus-within:bg-white transition-all">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search students, leads..."
          className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
        />
      </div> */}

      <div className="flex items-center gap-2">
        {/* Reminder notifications (Due + Overdue) */}
        <NotificationBell />

        {/* future integrations */}

        {/* Settings */}
        {/* <button className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors">
          <Settings size={20} />
        </button> */}

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{email}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-hover border border-slate-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-400">{email}</p>
              </div>
              {[
                { icon: User, label: 'Profile', onClick: () => navigate('/profile') },
                { icon: Settings, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick?.();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-600 transition-colors"
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-danger transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}