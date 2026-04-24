import React from 'react';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  isUp?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, isUp, color = 'primary' }) => {
  return (
    <GlassCard className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-${color}-400`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 ${
              isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;
