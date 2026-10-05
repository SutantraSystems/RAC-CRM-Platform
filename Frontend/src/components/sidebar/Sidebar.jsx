import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, FileText, GraduationCap,
  DollarSign, BarChart3, Settings, ChevronDown, ChevronRight,
  BookOpen, Search, Briefcase, Handshake, TestTube2
} from 'lucide-react';
import logo from '../../assets/RAC.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: FileText, label: 'Import Students', path: '/importstudents' },

  // future integration
  // { icon: Target, label: 'Leads', path: '/leads' },
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

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobileOpen = isMobile && !collapsed;

  const widthClass = isMobile
    ? "w-[220px] max-w-[85vw]"
    : collapsed
      ? "w-[78px]"
      : "w-[220px]";

  const transformClass = isMobile
    ? mobileOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  return (
    <>
      {/* Backdrop — only rendered on mobile while the drawer is open */}
      {mobileOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside
        className={`
      h-screen h-dvh bg-white border-r border-slate-100 flex flex-col
      sidebar-transition fixed left-0 top-0 z-40 shadow-sm
      ${widthClass} ${transformClass}
    `}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-slate-100 h-20 bg-[#F9FAFB] ${(!isMobile && collapsed) ? "justify-center px-2" : "justify-center px-3"
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
            ${(!isMobile && collapsed) ? "w-14 h-14" : "w-24 h-24"}
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
            const showLabel = isMobile || !collapsed;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Tapping a link closes the drawer on mobile.
                  if (isMobile && !collapsed) onToggle();
                }}
                className={`
                  sidebar-item group relative
                  ${isActive ? 'active' : ''}
                  ${!showLabel ? 'justify-center px-2' : ''}
                `}
                title={!showLabel ? item.label : ''}
              >
                <Icon size={18} className="flex-shrink-0" />
                {showLabel && (
                  <span className="truncate">{item.label}</span>
                )}
                {!showLabel && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}