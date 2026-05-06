import React, { useState } from 'react';
import { Bell, CheckCheck, Package, Clock, Info, AlertTriangle, CheckCircle2, XCircle, Loader2, Mail, MailOpen, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Modules
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../modules/notifications/application/useNotifications';
import { notificationRepository } from '../modules/notifications/infrastructure/notification.repository';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) markAsRead(notif.id);
    
    if (notif.type === 'ORDER_CREATED' && notif.metadata?.orderId && user?.role === 'driver') {
      navigate(`/driver/jobs?id=${notif.metadata.orderId}`);
    } else if (notif.metadata?.orderId) {
      // Logic for Vendor and Admin to go to Orders page
      const basePath = user?.role === 'admin' ? '/admin/orders' : 
                       user?.role === 'vendor' ? '/vendor/orders' : '/driver/deliveries';
      
      navigate(`${basePath}?id=${notif.metadata.orderId}`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(id);
    try {
      await notificationRepository.delete(id);
      refresh();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ORDER_CREATED': return <Package className="text-primary-400" size={20} />;
      case 'ORDER_ACCEPTED': return <CheckCircle2 className="text-emerald-400" size={20} />;
      case 'ORDER_CANCELLED': return <XCircle className="text-rose-400" size={20} />;
      case 'SYSTEM': return <Info className="text-violet-400" size={20} />;
      case 'ALERT': return <AlertTriangle className="text-amber-400" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {t('notifications.title')}
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} {t('common.new')}
              </span>
            )}
          </h1>
          <p className="text-slate-500">{t('notifications.subtitle') || 'Stay updated with your latest activities'}</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button 
              variant="secondary" 
              icon={CheckCheck} 
              onClick={markAllAsRead}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              {t('notifications.mark_all_read')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters/Tabs */}
      <div className="flex p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5">
        {[
          { id: 'all', label: t('common.all'), icon: Bell },
          { id: 'unread', label: t('notifications.unread') || 'Unread', icon: Mail },
          { id: 'read', label: t('notifications.read') || 'Read', icon: MailOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            <span className="whitespace-nowrap">{tab.label}</span>
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-white/5'
            }`}>
              {tab.id === 'all' ? notifications.length : 
               tab.id === 'unread' ? unreadCount : 
               notifications.length - unreadCount}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <GlassCard 
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`group hover:border-white/10 transition-all cursor-pointer ${
                !notif.isRead ? 'border-primary-500/30 bg-primary-500/5 ring-1 ring-primary-500/10' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  !notif.isRead ? 'bg-primary-500/20 shadow-lg shadow-primary-500/20' : 'bg-white/5'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      <button 
                        onClick={(e) => handleDelete(notif.id, e)}
                        disabled={isDeleting === notif.id}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg"
                      >
                        {isDeleting === notif.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-slate-200' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  
                  {notif.metadata?.orderId && (
                    <div className="pt-2">
                       <Badge variant="neutral">#{notif.metadata.orderId.substring(0, 8)}</Badge>
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 animate-pulse" />
                )}
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Bell size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('notifications.empty')}</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {t('notifications.empty_subtitle') || 'No notifications found for the current filter.'}
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
