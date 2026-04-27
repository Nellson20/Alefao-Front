import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Save, Loader2, Globe, Bell, Moon, Sun, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Modules
import { userRepository } from '../modules/users/infrastructure/user.repository';

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    vendorProfile: {
      shopName: '',
      shopAddress: '',
      description: '',
      latitude: 0,
      longitude: 0,
      notificationRadius: 5,
    },
    driverProfile: {
      vehicleType: '',
      licenseNumber: '',
      lastLat: 0,
      lastLng: 0,
      notificationRadius: 5,
    },
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const detectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (profile.role === 'VENDOR') {
          setFormData(prev => ({
            ...prev,
            vendorProfile: { ...prev.vendorProfile, latitude, longitude }
          }));
        } else if (profile.role === 'DRIVER') {
          setFormData(prev => ({
            ...prev,
            driverProfile: { ...prev.driverProfile, lastLat: latitude, lastLng: longitude }
          }));
        }
        setMessage({ type: 'success', text: t('profile.location_detected') || 'Position détectée avec succès !' });
        setIsDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setMessage({ type: 'error', text: t('profile.location_denied') || 'Veuillez autoriser la localisation.' });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userRepository.getMe();
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          vendorProfile: {
            shopName: data.vendorProfile?.shopName || '',
            shopAddress: data.vendorProfile?.shopAddress || '',
            description: data.vendorProfile?.description || '',
            latitude: Number(data.vendorProfile?.latitude) || 0,
            longitude: Number(data.vendorProfile?.longitude) || 0,
            notificationRadius: data.vendorProfile?.notificationRadius || 5,
          },
          driverProfile: {
            vehicleType: data.driverProfile?.vehicleType || '',
            licenseNumber: data.driverProfile?.licenseNumber || '',
            lastLat: Number(data.driverProfile?.lastLat) || 0,
            lastLng: Number(data.driverProfile?.lastLng) || 0,
            notificationRadius: data.driverProfile?.notificationRadius || 5,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('vendor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vendorProfile: { ...prev.vendorProfile, [field]: field === 'notificationRadius' ? parseInt(value) : value }
      }));
    } else if (name.startsWith('driver.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        driverProfile: { ...prev.driverProfile, [field]: field === 'notificationRadius' ? parseInt(value) : value }
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

      await userRepository.updateProfile(updateData);
      setMessage({ type: 'success', text: t('profile.updated_success') || 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: t('profile.updated_error') || 'Failed to update profile. Please try again.' });
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

  if (!profile) {
     return <div className="text-center py-20 text-slate-500">{t('common.no_data')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-slate-500">Manage your personal information and preferences</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'profile' 
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User size={18} />
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'notifications' 
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info - Always visible */}
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
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">{t('profile.preferences')}</h4>
              <button type="button" onClick={toggleLanguage} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">{t('profile.language')}</span>
                </div>
                <span className="text-xs font-bold text-primary-400 uppercase">{i18n.language === 'en' ? t('profile.english') : t('profile.french')}</span>
              </button>
              <button type="button" onClick={toggleTheme} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-400" />}
                  <span className="text-sm font-medium">{t('profile.theme')}</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary-500' : 'bg-slate-400'}`}>
                   <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </GlassCard>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'profile' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <GlassCard>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-primary-400" />
                    {t('profile.general_info')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.full_name')}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder={t('profile.full_name')}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.phone')}</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder={t('profile.phone')}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {profile.role === 'VENDOR' && (
                  <GlassCard>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <MapPin size={20} className="text-emerald-400" />
                      {t('profile.store_details')}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.shop_name')}</label>
                        <input 
                          type="text" 
                          name="vendor.shopName"
                          value={formData.vendorProfile.shopName}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.shop_address')}</label>
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
                      {t('profile.vehicle_info')}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 ml-1">{t('profile.vehicle_type')}</label>
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
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <GlassCard>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-amber-400" />
                    {t('profile.notifications_area') || 'Zone de Notification'}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 ml-1">
                        {t('profile.radius') || 'Rayon de couverture (km)'}
                      </label>
                      <select 
                        name={profile.role === 'VENDOR' ? 'vendor.notificationRadius' : 'driver.notificationRadius'}
                        value={profile.role === 'VENDOR' ? formData.vendorProfile.notificationRadius : formData.driverProfile.notificationRadius}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary-500/50 transition-all appearance-none"
                      >
                        {[1, 2, 3, 5, 10, 15, 20, 50].map(r => (
                          <option key={r} value={r} className="bg-slate-900">{r} km</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 ml-1 italic">
                        {t('profile.radius_hint') || 'Vous ne recevrez que les notifications concernant cette zone.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-400 ml-1">
                        {t('profile.location_center') || 'Centre de la zone (Ma Position)'}
                      </label>
                      
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 border-dashed">
                        <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
                          <Navigation size={32} className={isDetecting ? 'animate-pulse' : ''} />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold text-white mb-1">
                            {profile.role === 'VENDOR' 
                              ? (formData.vendorProfile.latitude ? `${formData.vendorProfile.latitude.toFixed(6)}, ${formData.vendorProfile.longitude.toFixed(6)}` : 'Position non définie')
                              : (formData.driverProfile.lastLat ? `${formData.driverProfile.lastLat.toFixed(6)}, ${formData.driverProfile.lastLng.toFixed(6)}` : 'Position non définie')
                            }
                          </p>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            {t('profile.location_hint') || 'Cliquez sur le bouton ci-dessous pour mettre à jour votre centre de notification avec votre position GPS actuelle.'}
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          variant="primary" 
                          onClick={detectLocation} 
                          icon={isDetecting ? Loader2 : Navigation}
                          className={isDetecting ? 'animate-pulse' : 'shadow-xl shadow-primary-500/20'}
                        >
                          {isDetecting ? 'Détection...' : 'Mettre à jour ma position'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                icon={isSaving ? Loader2 : Save} 
                className={`min-w-[200px] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? t('profile.saving') : t('profile.save_changes')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
