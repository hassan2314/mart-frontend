import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/blogs', icon: FileText, label: 'Blogs' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/invite-manager', icon: UserPlus, label: 'Invite Manager' },
];

const AdminLayout = () => {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? 'false');
    } catch {
      return false;
    }
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const pageTitle = () => {
    const path = location.pathname.replace('/admin', '').replace('/', '') || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, null, {
        withCredentials: true,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('accessToken');
      setCurrentUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout Error:', err);
      alert('Error logging out. Try again.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 min-h-[4rem]">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold truncate">Admin Panel</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors flex-shrink-0"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/admin/dashboard'}
              isActive={to === '/admin/dashboard' ? (_, { pathname }) => pathname === '/admin' || pathname === '/admin/dashboard' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-500'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`
              }
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">{pageTitle()}</h1>
        </header>
        <div className="flex-1 min-h-0 overflow-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
