import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Truck, Store, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';

// Modules
import { useLogin } from '../modules/auth/application/useLogin';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'vendor' | 'driver'>('admin');
  
  const { login, isLoading, error, fieldErrors } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password }, role);
    if (result.success) {
      navigate(`/${result.role}`);
    }
  };

  const roles = [
    { id: 'admin', label: t('common.user'), icon: Shield, color: 'text-primary-400' },
    { id: 'vendor', label: t('common.vendors'), icon: Store, color: 'text-emerald-400' },
    { id: 'driver', label: t('common.drivers'), icon: Truck, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b15] relative overflow-hidden p-6">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="glass w-full max-w-lg rounded-[40px] p-10 md:p-14 relative z-10 animate-slide-up border-white/5">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="w-25 h-25" />
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Alefao <span className="text-primary-500">Express</span></h1>
          <p className="text-slate-400 font-medium">{t('auth.login_subtitle')}</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-10">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                role === r.id 
                  ? 'bg-primary-500/10 border-primary-500/50 text-white' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              <r.icon size={24} className={role === r.id ? r.color : 'text-slate-500'} />
              <span className="text-xs font-bold uppercase tracking-wider">{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">{t('auth.email')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="email"
                className={`input-field pl-12 ${fieldErrors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                placeholder="name@alefao.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {fieldErrors.email && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="password"
                className={`input-field pl-12 ${fieldErrors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {fieldErrors.password && <p className="text-rose-400 text-xs font-medium mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg shadow-2xl shadow-primary-500/20"
            isLoading={isLoading}
          >
            {t('auth.login')}
          </Button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          {t('auth.dont_have_account')} 
          <Link to="/register" className="text-primary-400 hover:underline ml-2 font-bold">{t('auth.register_now')}</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
