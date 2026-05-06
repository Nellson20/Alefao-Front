import React, { useState } from 'react';
import { Search, Loader2, Package, Truck, CheckCircle2, History, XCircle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Modules
import { useOrders } from '../modules/orders/application/useOrders';
import { orderRepository } from '../modules/orders/infrastructure/order.repository';
import OrderCard from '../modules/orders/ui/OrderCard';
import type { Order } from '../modules/orders/domain/types';

const DriverOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { orders, isLoading, refresh } = useOrders(user?.role);

  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status filter
    if (activeTab === 'active') {
      return ['ASSIGNED', 'PICKED_UP', 'IN_DELIVERY'].includes(order.status);
    } else if (activeTab === 'completed') {
      return order.status === 'DELIVERED';
    } else if (activeTab === 'cancelled') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  const handlePickup = async () => {
    if (!selectedOrder || !otpCode) return;
    setIsSubmitting(true);
    try {
      await orderRepository.pickup(selectedOrder.id, otpCode);
      setOtpCode('');
      refresh();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Pickup failed:', error);
      alert('Code invalide ou erreur lors du ramassage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliver = async () => {
    if (!selectedOrder || !otpCode) return;
    setIsSubmitting(true);
    try {
      await orderRepository.deliver(selectedOrder.id, otpCode);
      setOtpCode('');
      refresh();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Delivery failed:', error);
      alert('Code invalide ou erreur lors de la livraison.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'active', label: t('orders.status.active') || 'Active', icon: Truck },
    { id: 'completed', label: t('orders.status.delivered') || 'Completed', icon: CheckCircle2 },
    { id: 'cancelled', label: t('orders.status.cancelled') || 'Cancelled', icon: XCircle },
    { id: 'all', label: t('common.all') || 'All', icon: History },
  ];

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">{t('common.my_deliveries') || 'My Deliveries'}</h1>
          <p className="text-slate-500">{t('orders.manage_deliveries') || 'Manage and track your delivery history'}</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all w-full md:w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedOrder(null);
            }}
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
              {orders.filter(o => {
                if (tab.id === 'active') return ['ASSIGNED', 'PICKED_UP', 'IN_DELIVERY'].includes(o.status);
                if (tab.id === 'completed') return o.status === 'DELIVERED';
                if (tab.id === 'cancelled') return o.status === 'CANCELLED';
                return true;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Order List */}
        <div className={`flex-1 w-full transition-all duration-300 ${selectedOrder ? 'lg:w-[60%]' : 'w-full'}`}>
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  userRole={user?.role}
                  isSelected={selectedOrder?.id === order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setOtpCode('');
                  }}
                  onEdit={() => {}} 
                  onDelete={() => {}} 
                  onViewDetails={(order) => {
                    setSelectedOrder(order);
                    setOtpCode('');
                  }}
                />
              ))
            ) : (
              <GlassCard className="py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('orders.empty_title')}</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {t('orders.empty_subtitle')}
                </p>
                {activeTab === 'active' && (
                  <Button 
                    variant="primary" 
                    className="mt-6"
                    onClick={() => window.location.href='/driver/jobs'}
                  >
                    {t('common.available_jobs')}
                  </Button>
                )}
              </GlassCard>
            )}
          </div>
        </div>

        {/* Right Side: Details Panel (Sticky) */}
        {selectedOrder && (
          <aside className="w-full lg:w-[40%] sticky top-6 p-0 z-10 hidden lg:block animate-in fade-in slide-in-from-right-4 duration-300">
            <GlassCard className="border-primary-500/20 ring-1 ring-primary-500/10 flex flex-col shadow-2xl shadow-black/50 overflow-hidden">
              <div className="border-b pb-6 border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <Package size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{t('orders.order_details')}</h2>
                    <p className="text-xs text-slate-500 font-mono">#{selectedOrder.id.substring(0, 8)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setOtpCode('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="pt-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
                <div className="space-y-6">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('orders.status_title') || 'Status'}</p>
                      <Badge variant="primary">{t(`orders.status.${selectedOrder.status.toLowerCase()}`)}</Badge>
                   </div>

                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary-500" />
                            <div className="w-0.5 h-12 bg-white/10" />
                            <MapPin className="text-rose-500" size={18} />
                         </div>
                         <div className="flex-1 space-y-4">
                            <div>
                               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('orders.pickup')}</p>
                               <p className="text-sm font-bold text-slate-200">{selectedOrder.pickupAddress}</p>
                               <p className="text-xs text-slate-500 mt-1">{selectedOrder.vendor?.shopName}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('orders.delivery')}</p>
                               <p className="text-sm font-bold text-slate-200">{selectedOrder.deliveryAddress}</p>
                               <p className="text-xs text-slate-500 mt-1">{selectedOrder.clientName} • {selectedOrder.clientPhone}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('orders.package_type')}</p>
                         <p className="text-sm font-bold text-slate-200">{selectedOrder.packageType}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('orders.amount')}</p>
                         <p className="text-sm font-bold text-emerald-400">${Number(selectedOrder.price).toFixed(2)}</p>
                      </div>
                   </div>

                   {selectedOrder.clientNote && (
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                         <p className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-2">{t('orders.client_note')}</p>
                         <p className="text-sm text-amber-200/80 italic">"{selectedOrder.clientNote}"</p>
                      </div>
                   )}

                   {/* Action Section */}
                   <div className="pt-6 border-t border-white/5 space-y-4">
                      {selectedOrder.status === 'ASSIGNED' && (
                         <div className="space-y-3">
                            <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">{t('orders.pickup_action') || 'Pickup Validation'}</p>
                            <input 
                               type="text" 
                               value={otpCode}
                               onChange={(e) => setOtpCode(e.target.value)}
                               placeholder={t('orders.enter_pickup_code') || 'Enter Pickup OTP'} 
                               className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50"
                            />
                            <Button 
                              className="w-full py-4" 
                              variant="primary"
                              onClick={handlePickup}
                              disabled={!otpCode || isSubmitting}
                              icon={isSubmitting ? Loader2 : undefined}
                            >
                              {isSubmitting ? '...' : (t('orders.confirm_pickup') || 'Confirm Pickup')}
                            </Button>
                         </div>
                      )}
                      {(selectedOrder.status === 'PICKED_UP' || selectedOrder.status === 'IN_DELIVERY') && (
                         <div className="space-y-3">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('orders.delivery_action') || 'Delivery Validation'}</p>
                            <input 
                               type="text" 
                               value={otpCode}
                               onChange={(e) => setOtpCode(e.target.value)}
                               placeholder={t('orders.enter_delivery_code') || 'Enter Delivery OTP'} 
                               className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500/50"
                            />
                            <Button 
                              className="w-full py-4" 
                              variant="primary" 
                              style={{ backgroundColor: '#10b981' }}
                              onClick={handleDeliver}
                              disabled={!otpCode || isSubmitting}
                              icon={isSubmitting ? Loader2 : undefined}
                            >
                              {isSubmitting ? '...' : (t('orders.confirm_delivery') || 'Confirm Delivery')}
                            </Button>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </GlassCard>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DriverOrdersPage;
