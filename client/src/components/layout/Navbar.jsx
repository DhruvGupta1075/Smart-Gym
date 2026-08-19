import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGym } from '../../context/GymContext';
import {
  QrCode,
  LogOut,
  User as UserIcon,
  Clock,
  ShieldCheck,
  Dumbbell,
  Sparkles,
  Menu,
  Flame,
} from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { setIsScannerOpen, setIsKioskOpen } = useGym();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center gap-1"
            style={{ background: 'rgba(255,75,43,0.12)', border: '1px solid rgba(255,75,43,0.3)', color: '#FF4B2B' }}>
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'trainer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center gap-1"
            style={{ background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }}>
            <Dumbbell className="w-3 h-3" /> Trainer
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center gap-1"
            style={{ background: 'rgba(201,161,90,0.1)', border: '1px solid rgba(201,161,90,0.25)', color: '#C9A15A' }}>
            <Flame className="w-3 h-3" /> Member
          </span>
        );
    }
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 px-4 lg:px-8 flex items-center justify-between"
      style={{
        background: 'rgba(13,12,8,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,161,90,0.3), transparent)' }} />

      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}
            aria-label="Toggle Sidebar"
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A15A'; e.currentTarget.style.borderColor = 'rgba(201,161,90,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo */}
        <Logo size="md" badgeText="PRO" subtitle="Analytics & Operations Platform" to="/dashboard" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7280' }}>
          <Clock className="w-3.5 h-3.5 animate-pulse" style={{ color: '#4FD1C5' }} />
          <span style={{ color: '#94A3B8' }}>{timeStr}</span>
        </div>

        {/* QR Actions */}
        {user?.role === 'admin' ? (
          <button
            onClick={() => setIsKioskOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,161,90,0.12)'}
            title="Display Gym Check-In QR Kiosk"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Launch QR Kiosk</span>
          </button>
        ) : (
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(111,190,140,0.12)'}
            title="Scan Daily Gym QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span>Self Check-In</span>
          </button>
        )}

        {/* User + Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a1810&color=C9A15A&bold=true`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: '1.5px solid rgba(201,161,90,0.35)' }}
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg transition cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7280' }}
              title="Sign Out"
              onMouseEnter={e => { e.currentTarget.style.color = '#FF4B2B'; e.currentTarget.style.background = 'rgba(255,75,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,43,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
