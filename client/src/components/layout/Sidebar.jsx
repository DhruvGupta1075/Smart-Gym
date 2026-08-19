import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarCheck,
  LineChart,
  Apple,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'member';

  const adminLinks = [
    { to: '/dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { to: '/members', label: 'Member Management', icon: Users },
    { to: '/trainers', label: 'Trainer Management', icon: Dumbbell },
    { to: '/attendance', label: 'Attendance Reports', icon: CalendarCheck },
    { to: '/analytics', label: 'Revenue & Trends', icon: LineChart },
  ];

  const trainerLinks = [
    { to: '/dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { to: '/clients', label: 'My Clients', icon: Users },
    { to: '/plans/workouts', label: 'Workout Programs', icon: Dumbbell },
    { to: '/plans/nutrition', label: 'Nutrition & Diets', icon: Apple },
  ];

  const memberLinks = [
    { to: '/dashboard', label: 'My Portal', icon: LayoutDashboard },
    { to: '/my-workout', label: 'Assigned Workout', icon: Dumbbell },
    { to: '/my-nutrition', label: 'Nutrition & Macros', icon: Apple },
    { to: '/my-progress', label: 'Body Transformation', icon: Flame },
    { to: '/attendance', label: 'My Attendance Log', icon: CalendarCheck },
  ];

  const links = role === 'admin' ? adminLinks : role === 'trainer' ? trainerLinks : memberLinks;

  /* Role accent colors */
  const roleAccent = role === 'admin' ? '#FF4B2B' : role === 'trainer' ? '#4FD1C5' : '#C9A15A';
  const roleBg     = role === 'admin' ? 'rgba(255,75,43,0.1)' : role === 'trainer' ? 'rgba(79,209,197,0.1)' : 'rgba(201,161,90,0.1)';
  const roleBorder = role === 'admin' ? 'rgba(255,75,43,0.25)' : role === 'trainer' ? 'rgba(79,209,197,0.25)' : 'rgba(201,161,90,0.25)';
  const roleLabel  = role === 'admin' ? 'Admin Portal' : role === 'trainer' ? 'Coach Portal' : 'Member Portal';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(13,12,8,0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${roleAccent}60, transparent)` }} />

        <div className="p-4 space-y-5 overflow-y-auto flex-1">

          {/* User Quick Summary Card */}
          <div className="relative p-3.5 rounded-xl flex items-center gap-3"
            style={{ background: roleBg, border: `1px solid ${roleBorder}` }}>
            {/* Corner accents */}
            <span style={{ position:'absolute', top:0, left:0, width:10, height:10, borderTop:`1.5px solid ${roleAccent}60`, borderLeft:`1.5px solid ${roleAccent}60` }} />
            <span style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderBottom:`1.5px solid ${roleAccent}60`, borderRight:`1.5px solid ${roleAccent}60` }} />

            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: `${roleAccent}20`, border: `1px solid ${roleAccent}40`, color: roleAccent }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] font-mono capitalize" style={{ color: roleAccent }}>{roleLabel}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Navigation
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className="block"
                >
                  {({ isActive }) => (
                    <div
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden"
                      style={isActive ? {
                        background: `${roleAccent}15`,
                        border: `1px solid ${roleAccent}35`,
                        color: roleAccent,
                      } : {
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: '#6B7280',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#94A3B8';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#6B7280';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: roleAccent }} />
                      )}
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Pill */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {role === 'member' ? (
            <div className="p-3 rounded-xl relative"
              style={{ background: 'rgba(201,161,90,0.08)', border: '1px solid rgba(201,161,90,0.2)' }}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#C9A15A' }}>
                  <Flame className="w-4 h-4 fill-[#FF4B2B] text-[#FF4B2B]" />
                  Check-in Streak
                </span>
                <span className="font-extrabold font-mono text-sm text-white">
                  {user?.streakDays || 0} Days
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono">
                Plan: <span className="text-slate-400">{user?.membership?.planName || 'Basic'}</span>
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mb-0.5" style={{ color: roleAccent }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Gym Core</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono">Atlas Cloud Connected</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
