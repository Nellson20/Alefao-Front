import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package } from 'lucide-react';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import OrderForm from '../modules/orders/ui/OrderForm';
import { useOrderActions } from '../modules/orders/application/useOrderActions';

const CreateOrderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createOrder, isSubmitting } = useOrderActions(() => {
    navigate('/vendor/orders');
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{t('orders.create_order')}</h1>
            <p className="text-slate-500">{t('orders.create_order_subtitle') || 'Follow the steps to create a new delivery'}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-primary-400">
          <Package size={20} />
          <span className="font-bold text-sm tracking-widest uppercase">New Order</span>
        </div>
      </div>

      <GlassCard className="p-8 sticky top-0">
        <OrderForm 
          onSubmit={createOrder}
          isSubmitting={isSubmitting}
          buttonLabel={t('orders.confirm_creation') || 'Confirm and Create Order'}
          isMultiStep={true}
        />
      </GlassCard>
    </div>
  );
};

export default CreateOrderPage;
