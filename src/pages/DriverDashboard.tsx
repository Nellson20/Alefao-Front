import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, DollarSign, ListChecks, Loader2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';

// Modules
import { orderRepository } from '../modules/orders/infrastructure/order.repository';

const DriverDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await orderRepository.getDriverOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch driver orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeOrder = orders.find(o => ['ACCEPTED', 'PICKED_UP'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const todayEarnings = completedOrders.reduce((acc, o) => acc + (Number(o.deliveryFee) || 10), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Trip Card */}
      {activeOrder ? (
        <GlassCard className="border-primary-500/30 bg-gradient-to-r from-primary-900/20 to-transparent relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                {t('dashboard.stats.active_orders')}: {t(`orders.status.${activeOrder.status.toLowerCase()}`, { defaultValue: activeOrder.status })}
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t('common.orders')} #{activeOrder.id.substring(0, 8)}</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary-500 border-4 border-primary-900/50" />
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-white/20" />
                    <MapPin className="text-rose-500" size={20} />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('orders.pickup')}</p>
                      <p className="font-semibold text-sm md:text-base leading-tight">{activeOrder.pickupAddress || 'Restaurant Address'}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('orders.delivery')}</p>
                      <p className="font-semibold text-sm md:text-base leading-tight">{activeOrder.deliveryAddress || 'Customer Address'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <Button icon={Navigation} className="flex-1 py-3 md:py-4">
                  {t('dashboard.welcome.driver_nav') || 'Open Navigation'}
                </Button>
                <Button variant="secondary" className="flex-1 py-3 md:py-4" onClick={() => window.location.href='/orders'}>
                  {activeOrder.status === 'ACCEPTED' ? t('orders.pickup_confirm') : t('orders.deliver_confirm')}
                </Button>
              </div>
            </div>

            <div className="w-full md:w-80 h-64 bg-slate-800 rounded-3xl relative flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-40 mix-blend-luminosity" />
               <div className="relative flex flex-col items-center gap-2">
                 <Navigation className="text-primary-400 animate-bounce" size={48} />
                 <p className="text-xs font-bold text-white uppercase tracking-widest">{t('dashboard.welcome.driver_nav_active') || 'Navigation Active'}</p>
               </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-500" size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('dashboard.stats.active_orders')}: 0</h2>
          <p className="text-slate-500 mb-6">{t('dashboard.welcome.driver_no_active') || 'Check for available jobs to start earning.'}</p>
          <Button onClick={() => window.location.href='/available-jobs'}>{t('common.available_jobs')}</Button>
        </GlassCard>
      )}

      {/* Driver Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('dashboard.stats.total_earned')} value={`$${todayEarnings.toFixed(2)}`} icon={DollarSign} color="emerald" trend="+12%" isUp={true} />
        <StatCard label={t('dashboard.stats.completed_deliveries')} value={completedOrders.length.toString()} icon={ListChecks} color="blue" />
        <StatCard label="Safety Score" value="98%" icon={ShieldCheck} color="primary" />
        <StatCard label="Drive Time" value="5h 22m" icon={Clock} color="amber" />
      </div>

      {/* History Table */}
      <GlassCard>
        <h3 className="text-xl font-bold mb-6">{t('common.recent_activity')}</h3>
        <div className="space-y-2">
          {completedOrders.slice(0, 5).map((order, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                   <Clock size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t('common.orders')} #{order.id.substring(0, 8)}</p>
                  <p className="text-xs text-slate-500">{new Date(order.updatedAt || order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">+${(Number(order.deliveryFee) || 10).toFixed(2)}</p>
                <p className="text-xs text-slate-500">{t('orders.status.delivered')}</p>
              </div>
            </div>
          ))}
          {completedOrders.length === 0 && <p className="text-slate-500 text-center py-4">{t('common.no_data')}</p>}
        </div>
      </GlassCard>
    </div>
  );
};

export default DriverDashboard;
