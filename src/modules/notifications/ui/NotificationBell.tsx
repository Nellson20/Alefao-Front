import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Clock, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../application/useNotifications';
import GlassCard from '../../../components/ui/GlassCard';

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative ${
          isOpen ? 'bg-white/10 border-primary-500/50 ring-1 ring-primary-500/20' : ''
        }`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-primary-400' : 'text-slate-400'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <GlassCard className="absolute right-0 mt-4 w-80 md:w-96 z-[100] p-0 overflow-hidden shadow-2xl border-primary-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
            <h3 className="font-bold text-slate-100">{t('notifications.title') || 'Notifications'}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                {t('notifications.mark_all_read') || 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-600">
                  <Bell size={24} />
                </div>
                <p className="text-slate-500 text-sm">{t('notifications.empty') || 'No notifications yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer relative group ${
                      !notif.isRead ? 'bg-primary-500/5' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        notif.type === 'ORDER_CREATED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary-500/10 text-primary-400'
                      }`}>
                        {notif.type === 'ORDER_CREATED' ? <Package size={18} /> : <Bell size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-bold truncate ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5 bg-white/2 text-center">
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold">
              {t('notifications.view_all') || 'View all history'}
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default NotificationBell;
