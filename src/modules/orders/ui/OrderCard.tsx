import React from 'react';
import { Package, MapPin, User, Clock, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../components/ui/GlassCard';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import type { Order } from '../domain/types';

interface OrderCardProps {
  order: Order;
  userRole?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, userRole, isSelected, onClick, onEdit, onDelete, onViewDetails }) => {
  const { t } = useTranslation();

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED': return 'secondary';
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'primary';
      case 'ASSIGNED': return 'primary';
      case 'PICKED_UP': return 'primary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <GlassCard 
      onClick={onClick}
      className={`hover:border-white/10 transition-all group cursor-pointer ${
        isSelected ? 'border-primary-500/50 bg-primary-500/5 ring-1 ring-primary-500/20 shadow-lg shadow-primary-500/10' : ''
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
        {/* Order ID & Badge */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="font-bold text-lg">#{order.id.substring(0, 8)}</span>
          </div>
          <Badge variant={getStatusVariant(order.status)}>
            {t(`orders.status.${order.status.toLowerCase()}`, { defaultValue: order.status })}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.delivery')}</p>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={14} className="text-primary-400" />
              <span className="text-sm font-medium truncate max-w-[150px]">{order.deliveryAddress}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.vendor')}</p>
            <div className="flex items-center gap-2 text-slate-300">
              <User size={14} className="text-emerald-400" />
              <span className="text-sm font-medium">{order.vendor?.shopName || t('common.no_data')}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('common.date')}</p>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock size={14} className="text-violet-400" />
              <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('orders.amount')}</p>
            <p className="text-lg font-black text-slate-100">${Number(order.price).toFixed(2)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {(userRole === 'admin' || (userRole === 'vendor' && order.status === 'CREATED')) && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(order); }}
                className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(order); }}
                className="p-3 rounded-xl hover:bg-rose-500/10 transition-colors text-rose-400"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          <Button 
            variant="secondary" 
            className="group-hover:bg-primary-500 group-hover:text-white transition-all"
            onClick={(e) => { e.stopPropagation(); onViewDetails?.(order); }}
          >
            {t('orders.details')}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default OrderCard;
