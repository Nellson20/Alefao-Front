import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import MapSelector from '../../../components/ui/MapSelector';
import type { Order } from '../domain/types';

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  buttonLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  isMultiStep?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  buttonLabel, 
  showCancel, 
  onCancel,
  isMultiStep = false
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    pickupAddress: '',
    deliveryAddress: '',
    pickupLat: '',
    pickupLng: '',
    deliveryLat: '',
    deliveryLng: '',
    clientName: '',
    clientPhone: '',
    clientNote: '',
    weight: '',
    packageType: 'OTHER',
    description: '',
    deliveryType: 'STANDARD',
    paymentMethod: 'CASH',
    price: '',
    requestedAt: new Date().toISOString().split('T')[0],
    attachments: [],
  });

  const [mapModal, setMapModal] = useState<{ isOpen: boolean, field: 'pickup' | 'delivery' }>({
    isOpen: false,
    field: 'pickup'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        price: initialData.price?.toString() || '',
        requestedAt: initialData.requestedAt ? new Date(initialData.requestedAt).toISOString().split('T')[0] : formData.requestedAt,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMultiStep && step < 3) {
      setStep(step + 1);
      return;
    }
    onSubmit(formData);
  };

  const renderStepIndicator = () => {
    if (!isMultiStep) return null;
    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
              step === s ? 'bg-primary-500 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderStepIndicator()}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {(!isMultiStep || step === 1) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-black text-primary-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> {t('orders.customer_info')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_name')}</label>
                <input 
                  type="text" required value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_phone')}</label>
                <input 
                  type="text" required value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="+212 ..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.client_note')}</label>
                <textarea 
                  value={formData.clientNote}
                  onChange={(e) => setFormData({...formData, clientNote: e.target.value})}
                  placeholder="e.g. Call before arrival"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all h-20"
                />
              </div>
            </div>
          </div>
        )}

        {(!isMultiStep || step === 2) && (
          <div className="space-y-4 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> {t('orders.route_info')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('orders.pickup')}</label>
                  <button 
                    type="button"
                    onClick={() => setMapModal({ isOpen: true, field: 'pickup' })}
                    className="text-[10px] font-bold text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin size={10} /> {t('common.select_on_map')}
                  </button>
                </div>
                <input 
                  type="text" required value={formData.pickupAddress}
                  onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" step="any" required placeholder="Pickup Lat"
                  value={formData.pickupLat}
                  onChange={(e) => setFormData({...formData, pickupLat: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <input 
                  type="number" step="any" required placeholder="Pickup Lng"
                  value={formData.pickupLng}
                  onChange={(e) => setFormData({...formData, pickupLng: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('orders.delivery')}</label>
                  <button 
                    type="button"
                    onClick={() => setMapModal({ isOpen: true, field: 'delivery' })}
                    className="text-[10px] font-bold text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin size={10} /> {t('common.select_on_map')}
                  </button>
                </div>
                <input 
                  type="text" required value={formData.deliveryAddress}
                  onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" step="any" required placeholder="Delivery Lat"
                  value={formData.deliveryLat}
                  onChange={(e) => setFormData({...formData, deliveryLat: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <input 
                  type="number" step="any" required placeholder="Delivery Lng"
                  value={formData.deliveryLng}
                  onChange={(e) => setFormData({...formData, deliveryLng: e.target.value})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {(!isMultiStep || step === 3) && (
          <div className="space-y-4 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Package size={16} /> {t('orders.package_details')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.weight_kg')}</label>
                <input 
                  type="number" step="0.1" value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.package_type')}</label>
                <select 
                  value={formData.packageType}
                  onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                >
                  <option value="DOCUMENT">Document</option>
                  <option value="FOOD">Food</option>
                  <option value="FRAGILE">Fragile</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('vendors.description')}</label>
                <input 
                  type="text" value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">{t('orders.amount')} ($)</label>
                <input 
                  type="number" step="0.01" required value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {isMultiStep && step > 1 && (
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
              {t('common.back')}
            </Button>
          )}
          {showCancel && (
            <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" className="flex-1" icon={isSubmitting ? Loader2 : (isMultiStep && step < 3 ? undefined : Save)} disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : (isMultiStep && step < 3 ? t('common.next') : (buttonLabel || t('common.save')))}
          </Button>
        </div>
      </form>

      <MapSelector 
        isOpen={mapModal.isOpen}
        onClose={() => setMapModal({ ...mapModal, isOpen: false })}
        title={mapModal.field === 'pickup' ? t('orders.pickup') : t('orders.delivery')}
        initialLat={mapModal.field === 'pickup' ? (parseFloat(formData.pickupLat) || -18.8792) : (parseFloat(formData.deliveryLat) || -18.8792)}
        initialLng={mapModal.field === 'pickup' ? (parseFloat(formData.pickupLng) || 47.5079) : (parseFloat(formData.deliveryLng) || 47.5079)}
        onSelect={(lat, lng, address) => {
          if (mapModal.field === 'pickup') {
            setFormData({
              ...formData,
              pickupLat: lat.toString(),
              pickupLng: lng.toString(),
              pickupAddress: address
            });
          } else {
            setFormData({
              ...formData,
              deliveryLat: lat.toString(),
              deliveryLng: lng.toString(),
              deliveryAddress: address
            });
          }
        }}
      />
    </div>
  );
};

export default OrderForm;
