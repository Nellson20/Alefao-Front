import React from 'react';
import { Users, Search, Filter, Mail, Phone, MapPin, Loader2, Star } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { userService } from '../services/api';

const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await userService.getVendors();
        setVendors(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

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
          <h1 className="text-3xl font-bold">Registered Vendors</h1>
          <p className="text-slate-500">Manage all store partners in the network</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all w-full md:w-64"
            />
          </div>
          <Button variant="secondary">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <GlassCard key={vendor.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-2xl">
                {vendor.shopName[0]}
              </div>
              <Badge variant={vendor.status === 'ACTIVE' ? 'success' : 'danger'}>{vendor.status}</Badge>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">{vendor.shopName}</h3>
              <div className="flex items-center gap-2 text-primary-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold">{vendor.rating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={16} />
                <span className="text-sm">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone size={16} />
                <span className="text-sm">{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin size={16} />
                <span className="text-sm truncate">{vendor.address}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" className="flex-1">View Store</Button>
              <Button className="flex-1">Edit</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default VendorsPage;
