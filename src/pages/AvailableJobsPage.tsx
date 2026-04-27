import React, { useEffect, useState } from 'react';
import { Package, MapPin, Clock, ChevronRight, Loader2, Navigation, X, Truck, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { driverService } from '../services/api';

// Fix Leaflet default icon
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
L.Marker.prototype.options.icon = DefaultIcon;

const SelectedIcon = L.divIcon({
  className: '',
  html: `<div style="background:#6366f1;border:3px solid #fff;width:18px;height:18px;border-radius:50%;box-shadow:0 0 0 4px rgba(99,102,241,0.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const OtherIcon = L.divIcon({
  className: '',
  html: `<div style="background:#64748b;border:2px solid rgba(255,255,255,0.3);width:12px;height:12px;border-radius:50%"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Component to animate map to a new center
const FlyToLocation = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
};

const AvailableJobsPage: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

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

  const jobsWithCoords = jobs.filter(j => j.pickupLat && j.pickupLng);
  const mapCenter: [number, number] = selectedJob?.pickupLat && selectedJob?.pickupLng
    ? [Number(selectedJob.pickupLat), Number(selectedJob.pickupLng)]
    : jobsWithCoords.length > 0
      ? [Number(jobsWithCoords[0].pickupLat), Number(jobsWithCoords[0].pickupLng)]
      : [-18.8792, 47.5079]; // Antananarivo fallback

  return (
    <div className="flex gap-6 items-start">

      {/* LEFT: Job List — natural scroll, no height constraint */}
      <div className="flex flex-col gap-4 flex-1 min-w-0 pb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('common.available_jobs')}</h1>
          <p className="text-slate-500">{t('dashboard.welcome.driver')}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-500" size={48} />
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <GlassCard
              key={job.id}
              className={`group cursor-pointer transition-all duration-300 ${
                selectedJob?.id === job.id
                  ? 'border-primary-500/50 shadow-lg shadow-primary-500/10 scale-[1.01]'
                  : 'hover:border-white/20'
              }`}
              onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl transition-colors ${selectedJob?.id === job.id ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-400'}`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">#{job.id?.substring(0, 8)}</p>
                      <Badge variant="warning">{job.packageType || 'OTHER'}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">+${Number(job.deliveryFee || job.price || 12).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('orders.amount')}</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-5 flex-1">
                  <div className="flex flex-col items-center pt-1 gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="w-px flex-1 bg-white/10 min-h-[24px]" />
                    <MapPin size={14} className="text-rose-500 flex-shrink-0" />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('orders.pickup')}</p>
                      <p className="text-sm font-semibold truncate">{job.pickupAddress || job.vendor?.shopName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('orders.delivery')}</p>
                      <p className="text-sm font-semibold truncate">{job.deliveryAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    variant={selectedJob?.id === job.id ? 'primary' : 'secondary'}
                    className="flex-1"
                    icon={selectedJob?.id === job.id ? X : Navigation}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedJob(selectedJob?.id === job.id ? null : job); }}
                  >
                    {selectedJob?.id === job.id ? 'Fermer' : t('common.view')}
                  </Button>
                  <Button className="flex-1" icon={ChevronRight}>
                    {t('orders.accept')}
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('common.no_data')}</h3>
            <p className="text-slate-500">{t('dashboard.welcome.driver_no_active')}</p>
          </GlassCard>
        )}
      </div>

      {/* RIGHT: Sticky Map — full viewport height */}
      <div
        className="hidden h-[calc(100vh-3rem)] lg:flex flex-col w-[50%] flex-shrink-0 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 sticky top-6"
      
      >
        {/* Map Header */}
        {/* Map */}
        <div className="flex-1">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedJob?.pickupLat && selectedJob?.pickupLng && (
              <FlyToLocation lat={Number(selectedJob.pickupLat)} lng={Number(selectedJob.pickupLng)} />
            )}
            {jobsWithCoords.map((job) => (
              <Marker
                key={job.id}
                position={[Number(job.pickupLat), Number(job.pickupLng)]}
                icon={selectedJob?.id === job.id ? SelectedIcon : OtherIcon}
                eventHandlers={{ click: () => setSelectedJob(job) }}
              >
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-1">#{job.id?.substring(0, 8)}</p>
                    <p className="font-semibold text-sm text-white mb-1">{job.pickupAddress}</p>
                    <p className="text-xs text-slate-400">→ {job.deliveryAddress}</p>
                    <p className="text-emerald-400 font-black mt-2">+${Number(job.deliveryFee || job.price || 12).toFixed(2)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected job footer */}
        {selectedJob && (
          <div className="px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-t border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Truck size={18} className="text-primary-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{selectedJob.pickupAddress}</p>
                  <p className="text-xs text-slate-500 truncate">→ {selectedJob.deliveryAddress}</p>
                </div>
              </div>
              <Button icon={ChevronRight}>{t('orders.accept')}</Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AvailableJobsPage;
