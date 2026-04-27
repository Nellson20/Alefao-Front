import React from 'react';
import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../components/ui/GlassCard';
import type { Order } from '../domain/types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  userRole?: string;
  selectedOrderId?: string | null;
  onSelect?: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  userRole, 
  selectedOrderId,
  onSelect,
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <GlassCard className="py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <Package size={40} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t('orders.empty_title')}</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          {t('orders.empty_subtitle')}
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {orders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order} 
          userRole={userRole}
          isSelected={selectedOrderId === order.id}
          onClick={() => onSelect?.(order)}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default OrderList;
