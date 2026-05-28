import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, FileText, GraduationCap,
  DollarSign, BarChart3, Settings, ChevronDown, ChevronRight,
  BookOpen, Search, Briefcase, Handshake, TestTube2
} from 'lucide-react';
import logo from '../../assets/RAC.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: Target, label: 'Leads', path: '/leads' },
  // { icon: FileText, label: 'Applications', path: '/applications' },
  // { icon: GraduationCap, label: 'Universities', path: '/universities' },
  // { icon: BookOpen, label: 'Learning Resources', path: '/learning' },
  // { icon: DollarSign, label: 'Revenue', path: '/finance' },
  // { icon: Search, label: 'Search Program', path: '/search-program' },
  // { icon: Briefcase, label: 'PRM', path: '/prm' },
  // { icon: Handshake, label: 'Allied Services', path: '/allied' },
  // { icon: TestTube2, label: 'Test Prep', path: '/test-prep' },
  // { icon: BarChart3, label: 'Reports', path: '/reports' },
  // { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
  className={`
    h-screen bg-white border-r border-slate-100 flex flex-col
    sidebar-transition fixed left-0 top-0 z-40 shadow-sm
    ${collapsed ? 'w-[78px]' : 'w-[220px]'}
  `}
>
    {/* Logo */}
<div
  className={`flex items-center border-b border-slate-100 h-20 bg-[#F9FAFB] ${
    collapsed ? "justify-center px-2" : "justify-center px-3"
  }`}
>
  <div className="flex items-center justify-center w-full">
    
    {/* Logo Background */}
    <div className=" rounded-2xl p-1 flex items-center justify-center">
      <img
        src={logo}
        alt="RAC Logo"
        className={`
          object-contain transition-all duration-300
          ${collapsed ? "w-14 h-14" : "w-24 h-24"}
        `}
      />
    </div>

  </div>
</div>

  


      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                sidebar-item group relative
                ${isActive ? 'active' : ''}
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
          &copy; 2024 RAC CRM
        </div>
      )}
    </aside>
  );
}
