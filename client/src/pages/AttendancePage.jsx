import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useGym } from '../context/GymContext';
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import ExportButton from '../components/common/ExportButton';
import AttendanceChart from '../components/charts/AttendanceChart';

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
const inputStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' };

const AttendancePage = () => {
  const { user } = useAuth();
  const { showToast, setIsScannerOpen } = useGym();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchMember, setSearchMember] = useState('');

  const isAdminOrTrainer = user?.role === 'admin' || user?.role === 'trainer';

  useEffect(() => { fetchLogs(); }, [selectedDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (isAdminOrTrainer) {
        const params = new URLSearchParams();
        if (selectedDate) params.append('date', selectedDate);
        const { data } = await api.get(`/api/attendance/logs?${params.toString()}`);
        if (data.success) setLogs(data.logs);
      } else {
        const { data } = await api.get('/api/attendance/my-logs');
        if (data.success) setLogs(data.logs);
      }
    } catch (err) {
      showToast('Failed to fetch attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchMember) return true;
    const name = log.member?.name?.toLowerCase() || '';
    const email = log.member?.email?.toLowerCase() || '';
    const q = searchMember.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const exportData = filteredLogs.map((l) => ({
    'Log ID': l._id,
    'Member Name': l.member?.name || user?.name,
    'Member Email': l.member?.email || user?.email,
    'Plan': l.member?.membership?.planName || user?.membership?.planName || 'Basic',
    'Date': l.date,
    'Check-In Time': new Date(l.checkInTime).toLocaleTimeString(),
    'Verification Method': l.method,
    'Status': l.status,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/50 uppercase">Gym // Attendance Log</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarCheck className="w-7 h-7" style={{ color: '#4FD1C5' }} />
            <span>Attendance & Check-In Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Timestamped biometric and QR records verifying gym floor presence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'member' && (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
              style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(111,190,140,0.12)'}
            >
              <QrCode className="w-4 h-4" />
              <span>Self Check-In</span>
            </button>
          )}

          <ExportButton data={exportData} filename="gym_attendance_records" title="Smart Gym Verified Attendance Report" />

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7280' }}
            title="Refresh"
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A15A'; e.currentTarget.style.borderColor = 'rgba(201,161,90,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="relative p-4 flex flex-wrap items-center justify-between gap-4" style={card}>
        <Corners size={12} color="#C9A15A" thickness={1} />
        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrTrainer && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search athlete..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition"
                style={{ ...inputStyle, width: '180px' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}

          {isAdminOrTrainer && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-mono">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              {selectedDate && (
                <button onClick={() => setSelectedDate('')}
                  className="text-xs font-semibold hover:underline cursor-pointer transition"
                  style={{ color: '#C9A15A' }}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <span className="font-mono text-[11px] text-slate-600">
          Showing <strong className="text-slate-400">{filteredLogs.length}</strong> check-in entries
        </span>
      </div>

      {/* ── Logs Table ── */}
      <div className="relative p-5" style={card}>
        <Corners size={14} color="#C9A15A" thickness={1} />
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-xs text-slate-600">No check-in records found for the selected query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-600 text-[10px] uppercase font-bold tracking-wider font-mono" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location / Session</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const memberObj = log.member || user;
                  return (
                    <tr key={log._id} className="transition"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={memberObj?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberObj?.name || 'M')}&background=1a1810&color=C9A15A`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                            style={{ border: '1.5px solid rgba(255,255,255,0.08)' }}
                          />
                          <div>
                            <p className="font-semibold text-slate-100">{memberObj?.name}</p>
                            <p className="text-[10px] text-slate-500">{memberObj?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-mono flex items-center gap-1.5" style={{ color: '#4FD1C5' }}>
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono"
                          style={{ background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }}>
                          {log.method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 font-semibold text-[11px]" style={{ color: '#6FBE8C' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{log.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                        {log.notes || log.qrSessionId || 'Gate A Sensor'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
