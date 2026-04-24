import React, { useEffect, useState } from 'react';
import { Package, Plus, ClipboardList, TrendingUp, Clock, MapPin, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { orderService } from '../services/api';

const VendorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await orderService.getVendorOrders();
        setOrders(response.data.data || response.data);
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
  const totalEarnings = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

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
          <h1 className="text-3xl font-bold">Store Management</h1>
          <p className="text-slate-500">Manage your menu, orders, and delivery status</p>
        </div>
        <Button icon={Plus}>
          Add New Product
        </Button>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/40 border-emerald-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-lg font-bold">Incoming Orders</h3>
          </div>
          <p className="text-3xl font-black text-emerald-400 mb-2">{incomingOrdersCount}</p>
          <p className="text-sm text-slate-400">Ready for preparation</p>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-primary-600/20 to-primary-900/40 border-primary-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-bold">Active Deliveries</h3>
          </div>
          <p className="text-3xl font-black text-primary-400 mb-2">{activeDeliveriesCount}</p>
          <p className="text-sm text-slate-400">Drivers on their way</p>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-violet-600/20 to-violet-900/40 border-violet-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold">Total Earnings</h3>
          </div>
          <p className="text-3xl font-black text-violet-400 mb-2">${totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-slate-400">Lifetime store revenue</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Live Orders Section */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-primary-400" size={24} />
              Live Preparations
            </h2>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.status !== 'DELIVERED').slice(0, 5).map((order, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">Order #{order.id.substring(0, 8)}</h4>
                    <p className="text-sm text-slate-400">{order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') || 'No items listed'}</p>
                  </div>
                  <Badge variant={order.status === 'PENDING' ? 'warning' : 'primary'}>{order.status}</Badge>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-300">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${order.driver ? 'text-primary-400' : 'text-slate-500'}`}>
                    <MapPin size={16} />
                    <span className="text-sm">{order.driver ? 'Driver Assigned' : 'Looking for Driver'}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-500 text-center py-4">No active preparations.</p>}
          </div>
        </GlassCard>

        {/* Inventory Overview (Static for now) */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Popular Items</h2>
            <button className="text-sm text-primary-400 font-bold hover:underline">Manage Menu</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Cheeseburger', sales: 48, price: '$12.50', image: '🍔' },
              { name: 'Chicken Wings', sales: 32, price: '$14.00', image: '🍗' },
              { name: 'Veggie Pizza', sales: 28, price: '$16.50', image: '🍕' },
              { name: 'Caesar Salad', sales: 24, price: '$10.00', image: '🥗' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-4xl mb-3">{item.image}</div>
                <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{item.sales} sold today</p>
                <p className="text-primary-400 font-bold">{item.price}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default VendorDashboard;
