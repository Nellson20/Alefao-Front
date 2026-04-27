import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

// Modules
import { orderRepository } from '../modules/orders/infrastructure/order.repository';
import { userRepository } from '../modules/users/infrastructure/user.repository';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: t('dashboard.stats.total_revenue'), value: '$0', trend: '0%', isUp: true, icon: DollarSign, color: 'emerald' },
    { label: t('dashboard.stats.total_orders'), value: '0', trend: '0%', isUp: true, icon: Package, color: 'primary' },
    { label: t('dashboard.stats.active_drivers'), value: '0', trend: '0%', isUp: true, icon: Users, color: 'blue' },
    { label: t('dashboard.stats.growth_rate'), value: '0%', trend: '0%', isUp: true, icon: TrendingUp, color: 'violet' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, vendorsData] = await Promise.all([
          orderRepository.getAll(),
          userRepository.getVendors()
        ]);
        
        setOrders(ordersData);
        setVendors(vendorsData);
        
        // Calculate basic stats
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((acc: number, order: any) => acc + (Number(order.price) || 0), 0);
        
        setStats([
          { label: t('dashboard.stats.total_revenue'), value: `$${totalRevenue.toLocaleString()}`, trend: '+12.5%', isUp: true, icon: DollarSign, color: 'emerald' },
          { label: t('dashboard.stats.total_orders'), value: totalOrders.toString(), trend: '+8.2%', isUp: true, icon: Package, color: 'primary' },
          { label: t('dashboard.stats.active_drivers'), value: '12', trend: '+2.4%', isUp: true, icon: Users, color: 'blue' },
          { label: t('dashboard.stats.growth_rate'), value: '24.8%', trend: '+4.1%', isUp: true, icon: TrendingUp, color: 'violet' },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-600 to-indigo-900 p-6 md:p-10 text-white">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">{t('common.hello', { name: 'Admin' })}</h1>
          <p className="text-primary-100 text-base md:text-xl mb-8 leading-relaxed font-medium opacity-90">{t('dashboard.welcome.admin')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" className="bg-white text-primary-900 border-none hover:bg-primary-50 px-8 py-4">{t('common.download_reports')}</Button>
            <Button variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/10 px-8 py-4">{t('common.view_logistics')}</Button>
          </div>
        </div>
        <div className="absolute right-[-10%] top-[-50%] w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px]" />
        <div className="absolute left-[-5%] bottom-[-30%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Tables/Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">{t('common.recent_activity')}</h2>
            <button className="text-sm text-primary-400 font-bold hover:underline">{t('common.view_all')}</button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Package size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">{t('common.orders')} #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-slate-500">{t(`orders.status.${order.status.toLowerCase()}`, { defaultValue: order.status })} • {order.items?.length || 0} {t('orders.items').toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">{order.price ? `$${order.price}` : 'N/A'}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-500 text-center py-4">{t('common.no_data')}</p>}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold mb-8">{t('dashboard.performance.vendor')}</h2>
          <div className="space-y-6">
            {vendors.slice(0, 4).map((vendor, i) => (
              <div key={vendor.id || i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                  {(vendor.vendorProfile?.shopName || vendor.fullName || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{vendor.vendorProfile?.shopName || vendor.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {t('dashboard.performance.weekly_orders', { count: vendor.vendorProfile?.orders?.length || 0 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-400 text-sm">★ {vendor.vendorProfile?.rating || '5.0'}</p>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <p className="text-slate-500 text-center py-4">{t('common.no_data')}</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
