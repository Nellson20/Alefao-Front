import React, { useEffect, useState } from 'react';
import { Package, MapPin, Clock, DollarSign, ChevronRight, Loader2, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { driverService } from '../services/api';

const AvailableJobsPage: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await driverService.getAvailableJobs();
        setJobs(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch available jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('common.available_jobs')}</h1>
        <p className="text-slate-500">{t('dashboard.welcome.driver')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <GlassCard key={job.id} className="group hover:border-primary-500/30 transition-all">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
                      <Package size={24} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-400">+${(job.deliveryFee || 12.00).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('orders.amount')}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                        <div className="w-0.5 h-8 bg-white/10" />
                        <MapPin size={16} className="text-rose-500" />
                      </div>
                      <div className="space-y-4">
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t('orders.pickup')}</p>
                          <p className="text-sm font-semibold truncate">{job.vendor?.shopName || 'Restaurant'}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t('orders.delivery')}</p>
                          <p className="text-sm font-semibold truncate">{job.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button variant="secondary" className="flex-1" icon={Navigation}>{t('common.view')}</Button>
                    <Button className="flex-1">{t('orders.accept')}</Button>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="lg:col-span-2">
              <GlassCard className="py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('common.no_data')}</h3>
                <p className="text-slate-500">{t('dashboard.welcome.driver_no_active')}</p>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableJobsPage;
