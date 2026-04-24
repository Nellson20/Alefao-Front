import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Save, Loader2, Globe, Bell } from 'lucide-react';
import { userService } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    vendorProfile: {
      shopName: '',
      shopAddress: '',
      description: '',
    },
    driverProfile: {
      vehicleType: '',
      licenseNumber: '',
    },
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        const data = response.data;
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          vendorProfile: {
            shopName: data.vendorProfile?.shopName || '',
            shopAddress: data.vendorProfile?.shopAddress || '',
            description: data.vendorProfile?.description || '',
          },
          driverProfile: {
            vehicleType: data.driverProfile?.vehicleType || '',
            licenseNumber: data.driverProfile?.licenseNumber || '',
          },
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('vendor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vendorProfile: { ...prev.vendorProfile, [field]: value }
      }));
    } else if (name.startsWith('driver.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        driverProfile: { ...prev.driverProfile, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const updateData: any = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      };

      if (profile.role === 'VENDOR') {
        updateData.vendorProfile = formData.vendorProfile;
      } else if (profile.role === 'DRIVER') {
        updateData.driverProfile = formData.driverProfile;
      }

      await userService.updateProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-slate-500">Manage your personal information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <GlassCard className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary-500/10 border-2 border-primary-500/20 mx-auto mb-4 flex items-center justify-center">
                <User size={48} className="text-primary-400" />
              </div>
              <h3 className="font-bold text-lg">{profile.fullName || 'User'}</h3>
              <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
              <Badge variant="primary">{profile.role}</Badge>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Preferences</h4>
              <button type="button" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Language</span>
                </div>
                <span className="text-xs font-bold text-primary-400 uppercase">English</span>
              </button>
              <button type="button" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-amber-400" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <div className="w-8 h-4 bg-primary-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </button>
            </GlassCard>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            <GlassCard>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield size={20} className="text-primary-400" />
                General Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={profile.email}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 ml-1 italic">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Role Specific Settings */}
            {profile.role === 'VENDOR' && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Globe size={20} className="text-emerald-400" />
                  Store Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Shop Name</label>
                    <input 
                      type="text" 
                      name="vendor.shopName"
                      value={formData.vendorProfile.shopName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Shop Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3 text-slate-500" size={18} />
                      <textarea 
                        name="vendor.shopAddress"
                        value={formData.vendorProfile.shopAddress}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all h-24"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {profile.role === 'DRIVER' && (
              <GlassCard>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Globe size={20} className="text-blue-400" />
                  Vehicle Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Vehicle Type</label>
                    <input 
                      type="text" 
                      name="driver.vehicleType"
                      value={formData.driverProfile.vehicleType}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>
              </GlassCard>
            )}

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                icon={isSaving ? Loader2 : Save} 
                className={isSaving ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
