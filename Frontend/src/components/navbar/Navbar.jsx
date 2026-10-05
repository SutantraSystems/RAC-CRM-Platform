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

  const [loggingOut, setLoggingOut] = useState(false);

  const email = user?.email || '';
  const displayName = user?.short_name || 'User';
  const fullName = user?.full_name?.trim() || displayName;
  const initials = user?.full_name
    ? user.full_name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (email ? email.slice(0, 2).toUpperCase() : '??');

  const handleLogout = async () => {
    if (loggingOut) return; // ignore double taps while the request is in flight
    setLoggingOut(true);
    try {
      // Never throws: even if the request fails, the user is signed out locally.
      await logout();
    } finally {
      setProfileOpen(false);
      // `replace` keeps the CRM page out of history, so Back can't return to it.
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    // touchstart: iOS Safari doesn't emit mouse events when tapping non-interactive areas, so mousedown alone wouldn't close the menu there.
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-100 flex items-center justify-between gap-2 px-3 sm:px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-slate-800 text-sm sm:text-base leading-tight truncate">{pageTitle}</h1>
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

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pl-2 sm:pr-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 w-52 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-card-hover border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800 truncate">{fullName}</p>
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
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-danger transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogOut size={15} />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}