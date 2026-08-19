import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import RevenueChart from '../components/charts/RevenueChart';
import AttendanceChart from '../components/charts/AttendanceChart';
import PlanDoughnutChart from '../components/charts/PlanDoughnutChart';
import StatCard from '../components/common/StatCard';

/* ── Shared card style matching rest of the app ── */
const card = {
  background: '#18170F',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

/* ── Corner brackets ── */
const Corners = ({ size = 14, color = '#C9A15A', thickness = 1.5 }) => (
  <div className="absolute inset-0 pointer-events-none">
    <span style={{ position:'absolute', top:0, left:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', top:0, right:0, width:size, height:size, borderTop:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, left:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderLeft:`${thickness}px solid ${color}` }} />
    <span style={{ position:'absolute', bottom:0, right:0, width:size, height:size, borderBottom:`${thickness}px solid ${color}`, borderRight:`${thickness}px solid ${color}` }} />
  </div>
);

const AnalyticsPage = () => {
  const { showToast } = useGym();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/analytics/detailed');
      if (data.success) {
        setData(data.analytics);
      }
    } catch (err) {
      showToast('Failed to load deep analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const weekdayTrend = data?.weekdayDistribution?.map((w) => ({
    label: w.day.substring(0, 3),
    count: w.count,
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(201,161,90,0.5)' }}>
            Gym // Analytics & Telemetry
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
          <LineChartIcon className="w-7 h-7" style={{ color: '#4FD1C5' }} />
          <span>Operational Analytics & Telemetry</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Interactive visualizations for facility traffic, peak hours, revenue models, and trainer bandwidth.
        </p>
      </div>

      {/* ── Row 1: Revenue + Tier Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 relative p-5 space-y-4" style={card}>
          <Corners color="rgba(201,161,90,0.25)" thickness={1} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Revenue & Membership Trajectory</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Historical & projected growth model</p>
            </div>
            <span
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(79,209,197,0.08)', border: '1px solid rgba(79,209,197,0.2)', color: '#4FD1C5' }}
            >
              6-Month Rolling
            </span>
          </div>
          <RevenueChart data={data?.monthlyRevenue || []} />
        </div>

        {/* Plan Doughnut */}
        <div className="relative p-5 space-y-4" style={card}>
          <Corners color="rgba(201,161,90,0.25)" thickness={1} />
          <div>
            <h3 className="text-sm font-bold text-slate-200">Membership Tier Breakdown</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Revenue contribution per tier</p>
          </div>
          <PlanDoughnutChart planDistribution={data?.planCounts || {}} />
        </div>
      </div>

      {/* ── Row 2: Peak Hours & Weekday Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Peak Hours */}
        <div className="relative p-5 space-y-4" style={card}>
          <Corners color="rgba(201,161,90,0.25)" thickness={1} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#4FD1C5' }} />
                <span>Peak Check-In Hours (6:00 – 22:00)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Identify rush hours to optimize staff coverage</p>
            </div>
          </div>
          <AttendanceChart hourlyData={data?.hourlyDistribution || []} type="hourly" />
        </div>

        {/* Weekday Trend */}
        <div className="relative p-5 space-y-4" style={card}>
          <Corners color="rgba(201,161,90,0.25)" thickness={1} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#6FBE8C' }} />
                <span>Day of Week Attendance Volume</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Weekly traffic patterns</p>
            </div>
          </div>
          <AttendanceChart trendData={weekdayTrend} type="trend" />
        </div>
      </div>

      {/* ── Row 3: Trainer Workload ── */}
      <div className="relative p-5 space-y-4" style={card}>
        <Corners color="rgba(201,161,90,0.25)" thickness={1} />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: '#A78BFA' }} />
          <span>Trainer Client Allocations & Workload</span>
        </h3>

        {!data?.trainerWorkload || data.trainerWorkload.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600">No trainer data available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.trainerWorkload.map((t, idx) => (
              <div
                key={idx}
                className="relative p-4 flex items-center justify-between transition"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(201,161,90,0.25)';
                  e.currentTarget.style.background = 'rgba(201,161,90,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                }}
              >
                <div>
                  <p className="text-xs font-bold text-slate-200">{t.trainerName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Certified Strength Coach</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono" style={{ color: '#C9A15A' }}>
                    {t.clientCount}
                  </span>
                  <p className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide">Active Clients</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
