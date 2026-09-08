import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Settings, User, LogOut, ChevronDown, Search } from 'lucide-react';

export default function Navbar({ onToggleSidebar, pageTitle }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { text: "Aanya Sharma received offer from U of T", time: "2m ago", type: "offer" },
    { text: "New lead: Arjun Patel from Delhi", time: "15m ago", type: "lead" },
    { text: "Visa approved for Meera Joshi", time: "1h ago", type: "visa" },
    { text: "Application deadline: 3 students", time: "3h ago", type: "alert" },
  ];

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display font-semibold text-slate-800 text-base leading-tight">{pageTitle}</h1>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
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

      <div className="flex items-center gap-2" ref={dropdownRef}>
        {/* future integrations */}
        {/* Notifications */}
        {/* <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-card-hover border border-slate-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-800">Notifications</p>
                <span className="badge bg-primary-100 text-primary-600">{notifications.length} new</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                  <p className="text-sm text-slate-700">{n.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button className="text-xs text-primary-600 font-semibold hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div> */}

        {/* Settings */}
        {/* <button className="p-2 rounded-xl hover:bg-primary-50 text-slate-500 hover:text-primary-600 transition-colors">
          <Settings size={20} />
        </button> */}

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              RAC
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Admin User</p>
              <p className="text-[10px] text-slate-400 leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-hover border border-slate-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800">Admin User</p>
                <p className="text-xs text-slate-400">admin@educonsult.com</p>
              </div>
              {[
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-600 transition-colors">
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-danger transition-colors">
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
