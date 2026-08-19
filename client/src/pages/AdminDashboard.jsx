import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  DollarSign,
  AlertTriangle,
  QrCode,
  RefreshCw,
  Clock,
  Dumbbell,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import RevenueChart from '../components/charts/RevenueChart';
import AttendanceChart from '../components/charts/AttendanceChart';
import PlanDoughnutChart from '../components/charts/PlanDoughnutChart';

/* ── Corner brackets ── */
const Corners = ({ size = 14, color = '#C9A15A', thickness = 1.5 }) => (
  <div className="absolute inset-0 pointer-events-none">
    <span style={{ position:'absolute', top:0, left:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', top:0, right:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, left:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, right:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
  </div>
);

const card = { background: '#18170F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' };

/* ── Quick Navigation Card ── */
const QuickNavCard = ({ icon: Icon, label, desc, to, color, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className="relative p-5 text-left w-full transition cursor-pointer group"
    style={card}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + '40';
      e.currentTarget.style.background = color + '08';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      e.currentTarget.style.background = '#18170F';
    }}
  >
    <Corners size={10} color={color + '60'} thickness={1} />
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 rounded-xl" style={{ background: color + '15', border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: color + '60' }} />
    </div>
    <p className="font-bold text-sm text-slate-100">{label}</p>
    <p className="text-[11px] text-slate-500 mt-1 font-mono leading-relaxed">{desc}</p>
  </button>
);

const AdminDashboard = () => {
  const { showToast, setIsKioskOpen } = useGym();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/api/admin/dashboard-stats'),
        api.get('/api/analytics/detailed'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (analyticsRes.data.success) setDetailedAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRenew = async (memberId) => {
    try {
      const newExpiry = new Date();
      newExpiry.setMonth(newExpiry.getMonth() + 1);
      await api.put(`/api/admin/members/${memberId}`, { membershipStatus: 'Active', expiryDate: newExpiry });
      showToast('Membership renewed for 30 days!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Renewal failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/50 uppercase">Admin // Overview</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Gym Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time KPIs, financial metrics, and facility telemetry at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsKioskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,161,90,0.12)'}
          >
            <QrCode className="w-4 h-4" />
            <span>Launch QR Kiosk</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}
            title="Refresh Live Data"
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A15A'; e.currentTarget.style.borderColor = 'rgba(201,161,90,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Members" value={stats?.activeMembers ?? 0} subtitle={`Total: ${stats?.totalMembers ?? 0}`} icon={Users} accentColor="teal" trend={12.4} />
        <StatCard title="Today's Check-Ins" value={stats?.todayAttendanceCount ?? 0} subtitle="QR & Kiosk Scans" icon={CalendarCheck} accentColor="emerald" trend={8.2} />
        <StatCard title="Monthly Revenue" value={`$${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}`} subtitle="All Active Subscriptions" icon={DollarSign} accentColor="gold" trend={15.8} />
        <StatCard title="Expiring This Week" value={stats?.upcomingExpirations?.length ?? 0} subtitle="Requires Renewal" icon={AlertTriangle} accentColor="crimson" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="relative lg:col-span-2 p-5 space-y-4" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-white">Revenue & Membership Trajectory</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Past 6 months income trends and new signups</p>
            </div>
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg" style={{ color: '#4FD1C5', background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.2)' }}>
              Revenue Chart
            </span>
          </div>
          <RevenueChart data={detailedAnalytics?.monthlyRevenue || []} />
        </div>

        <div className="relative p-5 space-y-4 flex flex-col justify-between" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div>
            <h3 className="font-display text-sm font-bold text-white">Membership Tiers</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Distribution by active subscription tier</p>
          </div>
          <PlanDoughnutChart planDistribution={stats?.planDistribution || {}} />
        </div>
      </div>

      {/* ── Peak Hours + Upcoming Renewals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="relative lg:col-span-2 p-5 space-y-4" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-white">Gym Peak Check-In Hours (6:00 – 22:00)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Traffic distribution to optimize floor capacity</p>
            </div>
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#6FBE8C' }}>
              <Clock className="w-3.5 h-3.5" /> Live Sensor
            </span>
          </div>
          <AttendanceChart hourlyData={detailedAnalytics?.hourlyDistribution || []} type="hourly" />
        </div>

        <div className="relative p-5 space-y-4" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#FF4B2B' }} />
              <span>Renewals Needed (Next 7 Days)</span>
            </h3>
          </div>

          {!stats?.upcomingExpirations || stats.upcomingExpirations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-600">
              No memberships expiring in the next 7 days. Great retention! 🎉
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
              {stats.upcomingExpirations.map((expUser) => (
                <div key={expUser._id} className="p-3 rounded-xl flex items-center justify-between gap-2 text-xs"
                  style={{ background: 'rgba(255,75,43,0.06)', border: '1px solid rgba(255,75,43,0.2)' }}>
                  <div>
                    <p className="font-semibold text-slate-200">{expUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {expUser.membership?.planName} · Exp: <span style={{ color: '#FF4B2B' }}>{new Date(expUser.membership?.expiryDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRenew(expUser._id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer"
                    style={{ background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,161,90,0.12)'}
                  >
                    +1 Month
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 7-Day Attendance Trend ── */}
      <div className="relative p-5 space-y-4" style={card}>
        <Corners size={14} color="#C9A15A" thickness={1} />
        <div>
          <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#C9A15A' }} />
            <span>7-Day Attendance Trend</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Daily check-in volume for the past week</p>
        </div>
        <AttendanceChart trendData={stats?.attendanceTrend?.map(d => ({ label: d.day, count: d.count })) || []} type="trend" />
      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Manage
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickNavCard
            icon={Users}
            label="Member Management"
            desc="Add, edit, renew memberships and assign trainers to athletes."
            to="/members"
            color="#4FD1C5"
            navigate={navigate}
          />
          <QuickNavCard
            icon={Dumbbell}
            label="Trainer Management"
            desc="View coach profiles, client allocations, and manage whitelist access."
            to="/trainers"
            color="#C9A15A"
            navigate={navigate}
          />
          <QuickNavCard
            icon={CalendarCheck}
            label="Attendance Reports"
            desc="Review all check-in logs, filter by date and member."
            to="/attendance"
            color="#6FBE8C"
            navigate={navigate}
          />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
