import React, { useEffect, useState } from 'react';
import { Package, Plus, ClipboardList, TrendingUp, Clock, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Modules
import { orderRepository } from '../modules/orders/infrastructure/order.repository';

const VendorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await orderRepository.getVendorOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch vendor orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const incomingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const activeDeliveriesCount = orders.filter(o => ['ACCEPTED', 'PICKED_UP'].includes(o.status)).length;
  const totalEarnings = orders.reduce((acc, o) => acc + (Number(o.price) || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('common.shop_dashboard')}</h1>
          <p className="text-slate-500">{t('dashboard.welcome.vendor', { count: incomingOrdersCount })}</p>
        </div>
        <Button icon={Plus} onClick={() => window.location.href='/inventory'}>
          {t('inventory.add_item')}
        </Button>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/40 border-emerald-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-lg font-bold">{t('common.new_orders')}</h3>
          </div>
          <p className="text-3xl font-black text-emerald-400 mb-2">{incomingOrdersCount}</p>
          <p className="text-sm text-slate-400">{t('dashboard.welcome.vendor', { count: incomingOrdersCount })}</p>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-primary-600/20 to-primary-900/40 border-primary-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-bold">{t('dashboard.stats.active_orders')}</h3>
          </div>
          <p className="text-3xl font-black text-primary-400 mb-2">{activeDeliveriesCount}</p>
          <p className="text-sm text-slate-400">{t('dashboard.stats.completed_deliveries')}</p>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-violet-600/20 to-violet-900/40 border-violet-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold">{t('dashboard.stats.total_earned')}</h3>
          </div>
          <p className="text-3xl font-black text-violet-400 mb-2">${totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-slate-400">{t('dashboard.stats.total_revenue')}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Live Orders Section */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-primary-400" size={24} />
              {t('common.recent_activity')}
            </h2>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.status !== 'DELIVERED').slice(0, 5).map((order, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{t('common.orders')} #{order.id.substring(0, 8)}</h4>
                    <p className="text-sm text-slate-400">{order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || t('common.no_data')}</p>
                  </div>
                  <Badge variant={order.status === 'PENDING' ? 'warning' : 'primary'}>{t(`orders.status.${order.status.toLowerCase()}`, { defaultValue: order.status })}</Badge>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-300">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${order.driver ? 'text-primary-400' : 'text-slate-500'}`}>
                    <MapPin size={16} />
                    <span className="text-sm">{order.driver ? t('orders.driver_assigned') || 'Driver Assigned' : t('orders.looking_for_driver') || 'Looking for Driver'}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-500 text-center py-4">{t('common.no_data')}</p>}
          </div>
        </GlassCard>

        {/* Inventory Overview (Static for now) */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Popular Items</h2>
            <button className="text-sm text-primary-400 font-bold hover:underline" onClick={() => window.location.href='/inventory'}>{t('common.manage')} Menu</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Cheeseburger', sales: 48, price: '$12.50', image: '🍔' },
              { name: 'Chicken Wings', sales: 32, price: '$14.00', image: '🍗' },
              { name: 'Veggie Pizza', sales: 28, price: '$16.50', image: '🍕' },
              { name: 'Caesar Salad', sales: 24, price: '$10.00', image: '🥗' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center min-w-0">
                <div className="text-3xl mb-2">{item.image}</div>
                <h4 className="font-semibold text-xs mb-1 truncate w-full">{item.name}</h4>
                <p className="text-[10px] text-slate-500 mb-2">{item.sales} sold</p>
                <p className="text-primary-400 font-bold text-sm">{item.price}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default VendorDashboard;
