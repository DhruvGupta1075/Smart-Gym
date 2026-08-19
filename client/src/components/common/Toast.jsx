import React from 'react';
import { useGym } from '../../context/GymContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const toastSchemes = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#6FBE8C' }} />,
    background: 'rgba(16, 22, 17, 0.97)',
    border: '1px solid rgba(111,190,140,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(111,190,140,0.1)',
    accentLine: 'linear-gradient(90deg, transparent, rgba(111,190,140,0.5), transparent)',
    color: '#A3D9B1',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#FF4B2B' }} />,
    background: 'rgba(18, 10, 8, 0.97)',
    border: '1px solid rgba(255,75,43,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,75,43,0.1)',
    accentLine: 'linear-gradient(90deg, transparent, rgba(255,75,43,0.5), transparent)',
    color: '#FCA18C',
  },
  info: {
    icon: <Info className="w-5 h-5 shrink-0" style={{ color: '#C9A15A' }} />,
    background: 'rgba(19, 18, 10, 0.97)',
    border: '1px solid rgba(201,161,90,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,161,90,0.1)',
    accentLine: 'linear-gradient(90deg, transparent, rgba(201,161,90,0.5), transparent)',
    color: '#E0C47A',
  },
};

const Toast = () => {
  const { toast, closeToast } = useGym();

  if (!toast) return null;

  const scheme = toastSchemes[toast.type] || toastSchemes.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-md">
      <div
        className="relative flex items-center gap-3 p-4 rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: scheme.background,
          border: scheme.border,
          boxShadow: scheme.boxShadow,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: scheme.accentLine }}
        />

        {scheme.icon}

        <p
          className="text-xs font-semibold leading-relaxed font-sans"
          style={{ color: scheme.color }}
        >
          {toast.message}
        </p>

        <button
          onClick={closeToast}
          className="ml-auto p-1 rounded-md transition cursor-pointer shrink-0"
          style={{ color: '#4A5568' }}
          onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
          onMouseLeave={e => e.currentTarget.style.color = '#4A5568'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
