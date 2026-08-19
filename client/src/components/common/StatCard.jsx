import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/* Editorial palette color map */
const colorMap = {
  gold: {
    bg: 'rgba(201,161,90,0.08)',
    border: 'rgba(201,161,90,0.2)',
    iconBg: 'rgba(201,161,90,0.12)',
    iconColor: '#C9A15A',
    text: '#C9A15A',
  },
  crimson: {
    bg: 'rgba(255,75,43,0.08)',
    border: 'rgba(255,75,43,0.2)',
    iconBg: 'rgba(255,75,43,0.12)',
    iconColor: '#FF4B2B',
    text: '#FF4B2B',
  },
  teal: {
    bg: 'rgba(79,209,197,0.08)',
    border: 'rgba(79,209,197,0.2)',
    iconBg: 'rgba(79,209,197,0.12)',
    iconColor: '#4FD1C5',
    text: '#4FD1C5',
  },
  emerald: {
    bg: 'rgba(111,190,140,0.08)',
    border: 'rgba(111,190,140,0.2)',
    iconBg: 'rgba(111,190,140,0.12)',
    iconColor: '#6FBE8C',
    text: '#6FBE8C',
  },
  // legacy aliases
  cyan: {
    bg: 'rgba(79,209,197,0.08)',
    border: 'rgba(79,209,197,0.2)',
    iconBg: 'rgba(79,209,197,0.12)',
    iconColor: '#4FD1C5',
    text: '#4FD1C5',
  },
  amber: {
    bg: 'rgba(201,161,90,0.08)',
    border: 'rgba(201,161,90,0.2)',
    iconBg: 'rgba(201,161,90,0.12)',
    iconColor: '#C9A15A',
    text: '#C9A15A',
  },
  rose: {
    bg: 'rgba(255,75,43,0.08)',
    border: 'rgba(255,75,43,0.2)',
    iconBg: 'rgba(255,75,43,0.12)',
    iconColor: '#FF4B2B',
    text: '#FF4B2B',
  },
  purple: {
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: '#A78BFA',
    text: '#A78BFA',
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  accentColor = 'gold',
  badgeText,
}) => {
  const scheme = colorMap[accentColor] || colorMap.gold;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: `linear-gradient(135deg, ${scheme.bg} 0%, rgba(24,23,15,0.8) 100%)`,
        border: `1px solid ${scheme.border}`,
        backgroundColor: '#18170F',
      }}
    >
      {/* Corner accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${scheme.text}40, transparent)` }} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase" style={{ color: scheme.text + '99' }}>{title}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-slate-50 font-mono tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div className="p-2.5 rounded-xl" style={{ background: scheme.iconBg }}>
              <Icon className="w-5 h-5" style={{ color: scheme.iconColor }} />
            </div>
          )}
          {badgeText && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6B7280' }}>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {trend !== undefined ? (
            <div className="flex items-center gap-1">
              <span className={`font-bold flex items-center font-mono ${trend >= 0 ? 'text-[#6FBE8C]' : 'text-[#FF4B2B]'}`}>
                {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(trend)}%
              </span>
              <span className="text-slate-600 text-[11px]">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-xs">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
