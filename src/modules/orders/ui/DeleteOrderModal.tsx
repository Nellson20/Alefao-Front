import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../../components/ui/GlassCard';
import Button from '../../../components/ui/Button';
import type { Order } from '../domain/types';

interface DeleteOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({ order, isOpen, onClose, onConfirm, isSubmitting }) => {
  const { t } = useTranslation();

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <GlassCard className="relative w-full max-w-md z-10 animate-fade-in-up border-rose-500/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent" />
        
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black mb-2">{t('orders.delete_title')}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {t('orders.delete_warning', { id: order.id.substring(0, 8) })}
          </p>

          <div className="flex gap-4 w-full">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              className="flex-1 !bg-rose-500 hover:!bg-rose-600 !text-white shadow-lg shadow-rose-500/20"
              onClick={onConfirm}
              icon={isSubmitting ? Loader2 : Trash2}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default DeleteOrderModal;
