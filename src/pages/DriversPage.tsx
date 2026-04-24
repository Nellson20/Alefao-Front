import React, { useEffect, useState } from 'react';
import { Truck, Search, Phone, Shield, Star, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { userService } from '../services/api';

const DriversPage: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await userService.getDrivers();
        setDrivers(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete', { item: 'driver' }))) {
      try {
        await userService.deleteUser(id);
        setDrivers(drivers.filter(d => d.id !== id));
      } catch (error) {
        console.error('Failed to delete driver:', error);
        alert(t('common.delete_failed', { item: 'driver' }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('drivers.title')}</h1>
          <p className="text-slate-500">{t('drivers.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="secondary" icon={Shield} className="flex-1 whitespace-nowrap">Compliance Check</Button>
          <Button icon={Truck} className="flex-1 whitespace-nowrap">Add Driver</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <GlassCard key={driver.id} className="relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-xl border-2 border-primary-500/20">
                {(driver.fullName || '?')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold">{driver.fullName}</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{driver.driverProfile?.vehicleType || t('drivers.not_specified')}</p>
              </div>
              <div className="ml-auto">
                <Badge variant={driver.driverProfile?.isOnline ? 'success' : 'neutral'}>
                  {driver.driverProfile?.isOnline ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Rating</p>
                <div className="flex items-center gap-1 text-primary-400 font-bold">
                  <Star size={12} fill="currentColor" />
                  5.0
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('common.deliveries')}</p>
                <p className="text-slate-100 font-bold">0</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 flex-grow">
              <div className="flex items-center gap-3 text-slate-400">
                <Phone size={16} />
                <span className="text-sm">{driver.phoneNumber || t('vendors.no_phone')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin size={16} />
                <span className="text-sm">Location Tracking Active</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3 mt-auto">
              <Button variant="secondary" className="flex-1" onClick={() => alert(`Tracking live location for ${driver.fullName}`)}>Track Live</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 border-none" onClick={() => handleDelete(driver.id)}>{t('common.delete')}</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DriversPage;
