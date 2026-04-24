import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Loader2 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { orderService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', trend: '0%', isUp: true, icon: DollarSign, color: 'emerald' },
    { label: 'Total Orders', value: '0', trend: '0%', isUp: true, icon: Package, color: 'primary' },
    { label: 'Active Drivers', value: '0', trend: '0%', isUp: true, icon: Users, color: 'blue' },
    { label: 'Growth Rate', value: '0%', trend: '0%', isUp: true, icon: TrendingUp, color: 'violet' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await orderService.getAllOrders();
        const ordersData = response.data.data || response.data; // Handle both direct array or paginated response
        setOrders(ordersData);
        
        // Calculate basic stats
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((acc: number, order: any) => acc + (order.totalPrice || 0), 0);
        
        setStats([
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+12.5%', isUp: true, icon: DollarSign, color: 'emerald' },
          { label: 'Total Orders', value: totalOrders.toString(), trend: '+8.2%', isUp: true, icon: Package, color: 'primary' },
          { label: 'Active Drivers', value: '12', trend: '+2.4%', isUp: true, icon: Users, color: 'blue' },
          { label: 'Growth Rate', value: '24.8%', trend: '+4.1%', isUp: true, icon: TrendingUp, color: 'violet' },
        ]);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-600 to-indigo-900 p-8 text-white">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Hello, Admin! 👋</h1>
          <p className="text-primary-100 text-lg mb-8">Your delivery network is performing 15% better than last month. Keep it up!</p>
          <div className="flex gap-4">
            <Button variant="secondary" className="bg-white text-primary-900 border-none hover:bg-primary-50">Download Reports</Button>
            <Button variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/10">View Logistics</Button>
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
            <h2 className="text-xl font-bold">Recent Logistics Activity</h2>
            <button className="text-sm text-primary-400 font-bold hover:underline">View All Logs</button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Package size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">Order #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-slate-500">{order.status} • {order.items?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">{order.totalPrice ? `$${order.totalPrice}` : 'N/A'}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-500 text-center py-4">No recent orders found.</p>}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold mb-8">Vendor Performance</h2>
          <div className="space-y-6">
            {[
              { name: 'Sushi Zen', orders: 142, rating: 4.9 },
              { name: 'Burger Lab', orders: 98, rating: 4.7 },
              { name: 'Pizza Master', orders: 84, rating: 4.5 },
              { name: 'Taco Haven', orders: 76, rating: 4.8 },
            ].map((vendor, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                  {vendor.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{vendor.name}</p>
                  <p className="text-xs text-slate-500">{vendor.orders} orders this week</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-400 text-sm">★ {vendor.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
