import React from 'react';
import { Search, Mail, Phone, MapPin, Loader2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// Modules
import { userRepository } from '../modules/users/infrastructure/user.repository';

const VendorsPage: React.FC = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStore, setSelectedStore] = React.useState<any | null>(null);

  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await userRepository.getVendors();
        setVendors(data);
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete', { item: 'vendor' }))) {
      try {
        await userRepository.deleteUser(id);
        setVendors(vendors.filter(v => v.id !== id));
      } catch (error) {
        console.error('Failed to delete vendor:', error);
        alert(t('common.delete_failed', { item: 'vendor' }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-primary-500">
          <Loader2 size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('vendors.title')}</h1>
          <p className="text-slate-500">{t('vendors.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('vendors.search_placeholder')} 
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all w-full"
            />
          </div>
          <Button variant="secondary" className="whitespace-nowrap">{t('common.export_csv')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <GlassCard key={vendor.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-2xl">
                {(vendor.vendorProfile?.shopName || vendor.fullName || '?')[0].toUpperCase()}
              </div>
              <Badge variant="success">{t('common.active')}</Badge>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">{vendor.vendorProfile?.shopName || vendor.fullName}</h3>
              <div className="flex items-center gap-2 text-primary-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold">5.0 / 5.0</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={16} />
                <span className="text-sm">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone size={16} />
                <span className="text-sm">{vendor.vendorProfile?.phoneNumber || t('vendors.no_phone')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin size={16} />
                <span className="text-sm truncate">{vendor.vendorProfile?.address || t('vendors.no_address')}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedStore(vendor)}>{t('vendors.view_store')}</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 border-none" onClick={() => handleDelete(vendor.id)}>{t('common.delete')}</Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedStore(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-2xl">
                {(selectedStore.vendorProfile?.shopName || selectedStore.fullName || '?')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedStore.vendorProfile?.shopName || selectedStore.fullName}</h2>
                <Badge variant="success" className="mt-1">ACTIVE</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400">{t('vendors.owner')}</span>
                <span className="font-semibold text-slate-200">{selectedStore.fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400">{t('auth.email')}</span>
                <span className="font-semibold text-slate-200">{selectedStore.email}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400">{t('profile.phone')}</span>
                <span className="font-semibold text-slate-200">{selectedStore.vendorProfile?.phoneNumber || t('common.not_available')}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400">{t('profile.shop_address')}</span>
                <span className="font-semibold text-slate-200 text-right max-w-[200px] truncate" title={selectedStore.vendorProfile?.address}>
                  {selectedStore.vendorProfile?.address || t('common.not_available')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400">{t('vendors.rating')}</span>
                <div className="flex items-center gap-1 font-semibold text-primary-400">
                  <Star size={14} fill="currentColor" />
                  <span>5.0 / 5.0</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('vendors.joined')}</span>
                <span className="font-semibold text-slate-200">
                  {new Date(selectedStore.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
              <Button className="flex-1" onClick={() => setSelectedStore(null)}>{t('vendors.close_details')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
