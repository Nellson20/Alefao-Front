import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';

// Modules
import { useOrders } from '../modules/orders/application/useOrders';
import { useOrderActions } from '../modules/orders/application/useOrderActions';
import OrderList from '../modules/orders/ui/OrderList';
import OrderForm from '../modules/orders/ui/OrderForm';
import DeleteOrderModal from '../modules/orders/ui/DeleteOrderModal';
import type { Order } from '../modules/orders/domain/types';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Hooks
  const { orders, isLoading, refresh } = useOrders(user?.role);
  const { updateOrder, deleteOrder, isSubmitting } = useOrderActions(refresh);

  // States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleNavigateToCreate = () => {
    const basePath = user?.role === 'admin' ? '/admin/orders' : '/vendor/orders';
    navigate(`${basePath}/create`);
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleOpenDeleteModal = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateSubmit = async (formData: any) => {
    if (!selectedOrder) return;
    await updateOrder(selectedOrder.id, formData);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null);
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
          <p className="text-slate-500">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-3">
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
          {user?.role === 'vendor' && (
            <Button icon={Plus} onClick={handleNavigateToCreate}>{t('orders.create_new')}</Button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Order List */}
        <div className={`flex-1 w-full transition-all duration-300 ${selectedOrder ? 'lg:w-2/3' : 'w-full'}`}>
          <OrderList 
            orders={filteredOrders}
            userRole={user?.role}
            selectedOrderId={selectedOrder?.id}
            onSelect={handleSelectOrder}
            onEdit={handleSelectOrder}
            onDelete={handleOpenDeleteModal}
            onViewDetails={handleSelectOrder}
          />
        </div>

        {/* Right Side: Edit Panel (Sticky) */}
        {selectedOrder && (
          <aside className="w-full lg:w-[40%] sticky top-6 p-0 z-10 hidden lg:block">
            <GlassCard className="border-primary-500/20 ring-1 ring-primary-500/10 flex flex-col shadow-2xl shadow-black/50 overflow-hidden">
              <div className="border-b pb-6 border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">{t('orders.edit_order')}</h2>
                    <p className="text-[10px] text-slate-500 font-mono">#{selectedOrder.id.substring(0, 8)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="pt-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
                <OrderForm 
                  initialData={selectedOrder}
                  onSubmit={handleUpdateSubmit}
                  isSubmitting={isSubmitting}
                  buttonLabel={t('orders.update_order') || 'Update Order'}
                  showCancel={true}
                  onCancel={() => setSelectedOrder(null)}
                  isMultiStep={false}
                />
              </div>
            </GlassCard>
          </aside>
        )}
      </div>

      {/* Modals (for mobile and deletion) */}
      <DeleteOrderModal 
        order={orderToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default OrdersPage;
