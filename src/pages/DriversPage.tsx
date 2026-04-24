import React, { useEffect, useState } from 'react';
import { Truck, Search, Phone, Shield, Star, MapPin, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { userService } from '../services/api';

const DriversPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold">Driver Network</h1>
          <p className="text-slate-500">Monitor and manage all delivery personnel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Shield}>Compliance Check</Button>
          <Button icon={Truck}>Add Driver</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <GlassCard key={driver.id} className="relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden border-2 border-white/10">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} 
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">{driver.name}</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{driver.vehicle}</p>
              </div>
              <div className="ml-auto">
                <Badge variant={driver.status === 'ONLINE' ? 'success' : driver.status === 'BUSY' ? 'warning' : 'secondary'}>
                  {driver.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Rating</p>
                <div className="flex items-center gap-1 text-primary-400 font-bold">
                  <Star size={12} fill="currentColor" />
                  {driver.rating}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Deliveries</p>
                <p className="text-slate-100 font-bold">{driver.deliveries}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-400">
                <Phone size={16} />
                <span className="text-sm">{driver.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin size={16} />
                <span className="text-sm">Last active: 2 mins ago</span>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="secondary" className="w-full">Track Live Location</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DriversPage;
