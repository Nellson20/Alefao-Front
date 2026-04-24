import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Truck, Store, User, Phone, MapPin } from 'lucide-react';
import { authService } from '../services/api';
import Button from '../components/ui/Button';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'vendor' as 'vendor' | 'driver' | 'admin',
    shopName: '',
    address: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const payload: any = {
      email: formData.email,
      password: formData.password,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      role: formData.role.toUpperCase(),
    };

    if (formData.role === 'vendor') {
      payload.vendorProfile = {
        shopName: formData.shopName,
        address: formData.address,
        phoneNumber: formData.phoneNumber || undefined,
      };
    } else if (formData.role === 'driver') {
      if (formData.phoneNumber) {
        payload.driverProfile = {
          phoneNumber: formData.phoneNumber,
        };
      }
    }

    try {
      await authService.register(payload);
      // After registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorData = err.response?.data?.message;
      
      if (Array.isArray(errorData)) {
        const newErrors: Record<string, string> = {};
        errorData.forEach((msg: string) => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('email')) newErrors.email = msg;
          else if (lowerMsg.includes('password') || lowerMsg.includes('mot de passe')) newErrors.password = msg;
          else if (lowerMsg.includes('shop') || lowerMsg.includes('boutique')) newErrors.shopName = msg;
          else if (lowerMsg.includes('name') || lowerMsg.includes('nom complet')) newErrors.firstName = msg;
          else if (lowerMsg.includes('address') || lowerMsg.includes('adresse')) newErrors.address = msg;
          else if (lowerMsg.includes('phone') || lowerMsg.includes('téléphone')) newErrors.phoneNumber = msg;
        });
        setFieldErrors(newErrors);
        setError('Please fix the errors below.');
      } else {
        setError(errorData || 'Failed to create account. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'vendor', label: 'Vendor', icon: Store, color: 'text-emerald-400' },
    { id: 'driver', label: 'Driver', icon: Truck, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b15] relative overflow-hidden p-6">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="glass w-full max-w-2xl rounded-[40px] p-10 md:p-14 relative z-10 animate-slide-up border-white/5">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/40 mb-6 transform rotate-6">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Join <span className="text-primary-500">Alefao</span></h1>
          <p className="text-slate-400 font-medium">Create your account and start delivering</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-10">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setFormData({ ...formData, role: r.id as any })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                formData.role === r.id 
                  ? 'bg-primary-500/10 border-primary-500/50 text-white' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              <r.icon size={24} className={formData.role === r.id ? r.color : 'text-slate-500'} />
              <span className="text-xs font-bold uppercase tracking-wider">{r.label} Account</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">First Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                  type="text"
                  className={`input-field pl-12 ${fieldErrors.firstName ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              {fieldErrors.firstName && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Last Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                  type="text"
                  className={`input-field pl-12 ${fieldErrors.lastName ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              {fieldErrors.lastName && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="email"
                className={`input-field pl-12 ${fieldErrors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {fieldErrors.email && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="password"
                className={`input-field pl-12 ${fieldErrors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            {fieldErrors.password && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          {formData.role === 'vendor' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Shop Name</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input
                    type="text"
                    className={`input-field pl-12 ${fieldErrors.shopName ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    placeholder="Pizza Palace"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  />
                </div>
                {fieldErrors.shopName && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.shopName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Shop Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input
                    type="text"
                    className={`input-field pl-12 ${fieldErrors.address ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                {fieldErrors.address && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.address}</p>}
              </div>
            </>
          )}

          {(formData.role === 'vendor' || formData.role === 'driver') && (
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Phone Number (Optional)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input
                  type="tel"
                  className={`input-field pl-12 ${fieldErrors.phoneNumber ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  placeholder="+1 555-0123"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              {fieldErrors.phoneNumber && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.phoneNumber}</p>}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-4 text-lg shadow-2xl shadow-primary-500/20"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          Already have an account? 
          <Link to="/login" className="text-primary-400 hover:underline ml-2 font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
