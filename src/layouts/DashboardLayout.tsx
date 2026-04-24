import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'vendor' | 'driver';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
      { icon: Package, label: 'All Orders', path: '/admin/orders' },
      { icon: Users, label: 'Vendors', path: '/admin/vendors' },
      { icon: Truck, label: 'Drivers', path: '/admin/drivers' },
      { icon: Settings, label: 'System', path: '/admin/settings' },
    ],
    vendor: [
      { icon: LayoutDashboard, label: 'Shop Dashboard', path: '/vendor' },
      { icon: Package, label: 'Inventory', path: '/vendor/inventory' },
      { icon: Bell, label: 'New Orders', path: '/vendor/orders' },
      { icon: Settings, label: 'Profile', path: '/vendor/profile' },
    ],
    driver: [
      { icon: Truck, label: 'Deliveries', path: '/driver' },
      { icon: Package, label: 'Available Jobs', path: '/driver/jobs' },
      { icon: Bell, label: 'Notifications', path: '/driver/notifications' },
      { icon: Settings, label: 'Preferences', path: '/driver/settings' },
    ],
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-white/5 fixed inset-y-0 left-0 z-50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          </div>
          <span className="text-xl font-bold tracking-tight">Alefao <span className="text-primary-400 text-sm font-medium ml-1 capitalize">{role}</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems[role].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={logout}>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.email || 'User'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{role}</p>
            </div>
            <LogOut className="text-slate-500 hover:text-rose-400 transition-colors" size={18} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        <header className="flex items-center justify-between mb-10">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Bell size={20} className="text-slate-400" />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <button className="btn-primary py-2.5 px-5 text-sm">
              Quick Action
            </button>
          </div>
        </header>

        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
