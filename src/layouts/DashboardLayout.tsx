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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

import NotificationBell from '../modules/notifications/ui/NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'vendor' | 'driver';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = {
    admin: [
      { icon: LayoutDashboard, label: t('common.overview'), path: '/admin' },
      { icon: Package, label: t('common.orders'), path: '/admin/orders' },
      { icon: Users, label: t('common.vendors'), path: '/admin/vendors' },
      { icon: Truck, label: t('common.drivers'), path: '/admin/drivers' },
      { icon: Settings, label: t('common.system'), path: '/admin/settings' },
    ],
    vendor: [
      { icon: LayoutDashboard, label: t('common.shop_dashboard'), path: '/vendor' },
      { icon: Package, label: t('common.inventory'), path: '/vendor/inventory' },
      { icon: Bell, label: t('common.new_orders'), path: '/vendor/orders' },
      { icon: Settings, label: t('common.profile'), path: '/vendor/profile' },
    ],
    driver: [
      { icon: Truck, label: t('common.deliveries'), path: '/driver' },
      { icon: Package, label: t('common.available_jobs'), path: '/driver/jobs' },
      { icon: Bell, label: t('common.notifications'), path: '/driver/notifications' },
      { icon: Settings, label: t('common.preferences'), path: '/driver/settings' },
    ],
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 glass border-r border-white/5 fixed inset-y-0 left-0 z-[60] flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold tracking-tight">Alefao <span className="text-primary-400 text-sm font-medium ml-1 capitalize">{t(`common.${role}`)}</span></span>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems[role].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
              <p className="text-sm font-semibold truncate">{user?.email || t('common.user')}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{t(`common.${role}`)}</p>
            </div>
            <LogOut className="text-slate-500 hover:text-rose-400 transition-colors" size={18} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 md:p-8 min-w-0">
        <header className="flex items-center justify-between gap-4 mb-8 md:mb-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-md group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={t('common.search')} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-white/10 mx-1 md:mx-2" />
            <button className="btn-primary py-2 md:py-2.5 px-3 md:px-5 text-xs md:text-sm whitespace-nowrap">
              {t('common.quick_action')}
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
