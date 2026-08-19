import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  Apple,
  CalendarCheck,
  Activity,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  Flame,
  Scale,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import WorkoutBuilderModal from '../components/workout/WorkoutBuilderModal';
import NutritionBuilderModal from '../components/nutrition/NutritionBuilderModal';

/* ── Corner brackets ── */
const Corners = ({ size = 14, color = '#C9A15A', thickness = 1.5 }) => (
  <div className="absolute inset-0 pointer-events-none">
    <span style={{ position:'absolute', top:0, left:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', top:0, right:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, left:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, right:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
  </div>
);

const card = {
  background: '#18170F',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

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

const TrainerDashboard = () => {
  const { showToast } = useGym();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  useEffect(() => { fetchTrainerData(); }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/api/trainer/dashboard');
      if (res.success) setData(res);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load coaching overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clients = data?.clients || [];
  const todayCheckIns = data?.todayCheckIns || [];
  const recentProgress = data?.recentProgress || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/50 uppercase">Trainer // Workspace</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="w-7 h-7" style={{ color: '#4FD1C5' }} />
            <span>Coaching Operations Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            High-level telemetry, athlete check-ins, program statistics, and recent progress updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'rgba(79,209,197,0.12)', border: '1px solid rgba(79,209,197,0.3)', color: '#4FD1C5' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,209,197,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,209,197,0.12)'}
          >
            <Plus className="w-4 h-4" />
            <span>New Workout Split</span>
          </button>

          <button
            onClick={() => setIsNutritionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(111,190,140,0.12)'}
          >
            <Plus className="w-4 h-4" />
            <span>New Nutrition Plan</span>
          </button>

          <button
            onClick={fetchTrainerData}
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
        <StatCard
          title="Assigned Athletes"
          value={data?.stats?.totalClients ?? clients.length}
          subtitle="Active roster count"
          icon={Users}
          accentColor="teal"
        />
        <StatCard
          title="Active Workout Splits"
          value={data?.stats?.activeWorkoutPlans ?? 0}
          subtitle="Custom & template splits"
          icon={Dumbbell}
          accentColor="gold"
        />
        <StatCard
          title="Active Diets"
          value={data?.stats?.activeNutritionPlans ?? 0}
          subtitle="Macro regimens deployed"
          icon={Apple}
          accentColor="emerald"
        />
        <StatCard
          title="Today's Client Attendance"
          value={data?.stats?.todayClientAttendanceCount ?? todayCheckIns.length}
          subtitle="Clients trained at gym today"
          icon={CalendarCheck}
          accentColor="crimson"
        />
      </div>

      {/* ── Activity Summaries (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Column 1: Today's Athlete Attendance */}
        <div className="relative p-5 space-y-4" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" style={{ color: '#6FBE8C' }} />
              <h3 className="font-display text-sm font-bold text-white">
                Today's Athlete Check-Ins ({todayCheckIns.length})
              </h3>
            </div>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(111,190,140,0.1)', border: '1px solid rgba(111,190,140,0.25)', color: '#6FBE8C' }}
            >
              LIVE
            </span>
          </div>

          {todayCheckIns.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-xs text-slate-500">None of your assigned athletes have scanned in yet today.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {todayCheckIns.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl flex items-center justify-between transition"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.member?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.member?.name || 'M')}&background=1a1810&color=C9A15A`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: '1.5px solid rgba(111,190,140,0.35)' }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{item.member?.name}</p>
                      <p className="text-[10.5px] text-slate-500 font-mono">{item.notes || 'QR Verified'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs flex items-center gap-1 font-semibold" style={{ color: '#4FD1C5' }}>
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: '#6FBE8C' }}>
                      ✓ {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Recent Athlete Progress Feed */}
        <div className="relative p-5 space-y-4" style={card}>
          <Corners size={14} color="#C9A15A" thickness={1} />
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#4FD1C5' }} />
              <h3 className="font-display text-sm font-bold text-white">
                Recent Athlete Progress Logs ({recentProgress.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/clients')}
              className="text-[11px] font-semibold transition cursor-pointer hover:underline"
              style={{ color: '#4FD1C5' }}
            >
              View Roster →
            </button>
          </div>

          {recentProgress.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Activity className="w-8 h-8 mx-auto" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-xs text-slate-500">No recent progress logs submitted by athletes.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {recentProgress.map((prog) => (
                <div
                  key={prog._id}
                  className="p-3.5 rounded-xl flex items-center justify-between transition"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prog.member?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prog.member?.name || 'M')}&background=1a1810&color=C9A15A`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                      style={{ border: '1.5px solid rgba(201,161,90,0.35)' }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{prog.member?.name}</p>
                      <p className="text-[10.5px] text-slate-500 font-mono">
                        {new Date(prog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {prog.notes ? ` · "${prog.notes}"` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-xs font-bold" style={{ color: '#4FD1C5' }}>
                      {prog.weightKg} kg
                    </p>
                    {prog.bodyFatPercentage && (
                      <p className="text-[10.5px]" style={{ color: '#FF4B2B' }}>
                        {prog.bodyFatPercentage}% BF
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Quick Navigation Section ── */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Detailed Workspaces
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickNavCard
            icon={Users}
            label="My Clients"
            desc="Inspect athlete profiles, view body recomposition charts, and log progress."
            to="/clients"
            color="#4FD1C5"
            navigate={navigate}
          />
          <QuickNavCard
            icon={Dumbbell}
            label="Workout Programs"
            desc="Author, schedule, and assign custom workout splits & master templates."
            to="/plans/workouts"
            color="#C9A15A"
            navigate={navigate}
          />
          <QuickNavCard
            icon={Apple}
            label="Nutrition & Diets"
            desc="Manage daily macro splits, prescribed meal schedules, and dietary rules."
            to="/plans/nutrition"
            color="#6FBE8C"
            navigate={navigate}
          />
        </div>
      </div>

      {/* Modals for quick creations */}
      <WorkoutBuilderModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        initialData={null}
        memberList={clients}
        onSuccess={fetchTrainerData}
      />
      <NutritionBuilderModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
        initialData={null}
        memberList={clients}
        onSuccess={fetchTrainerData}
      />
    </div>
  );
};

export default TrainerDashboard;
