import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  Apple,
  Activity,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Search,
  Flame,
  CalendarCheck,
  Eye,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import ProgressLineChart from '../components/charts/ProgressLineChart';
import ProgressLogModal from '../components/progress/ProgressLogModal';
import Modal from '../components/common/Modal';
import Corners from '../components/common/Corners';

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const statusStyle = (status) => {
  if (status === 'Active') return { background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' };
  if (status === 'Expired') return { background: 'rgba(255,75,43,0.12)', border: '1px solid rgba(255,75,43,0.3)', color: '#FF4B2B' };
  return { background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' };
};

const TrainerClientsPage = () => {
  const { showToast } = useGym();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressTargetId, setProgressTargetId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/trainer/clients');
      if (data.success) {
        setClients(data.clients);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectClient = async (client) => {
    setSelectedClient(client);
    setIsProfileModalOpen(true);
    try {
      const { data } = await api.get(`/api/admin/members/${client._id}`);
      if (data.success) setClientDetails(data);
    } catch (err) {
      showToast('Failed to load athlete profile history', 'error');
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'All') return c.membership?.status === statusFilter;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#4FD1C5]/70 uppercase">Coach // Clients</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7" style={{ color: '#4FD1C5' }} />
            <span>My Clients</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assigned athlete directory, body transformation metrics, and active program assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/plans/workouts')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            style={{ background: 'rgba(79,209,197,0.12)', border: '1px solid rgba(79,209,197,0.3)', color: '#4FD1C5' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,209,197,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,209,197,0.12)'}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Workout Programs →</span>
          </button>

          <button
            onClick={() => navigate('/plans/nutrition')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(111,190,140,0.12)'}
          >
            <Apple className="w-4 h-4" />
            <span>Nutrition &amp; Diets →</span>
          </button>

          <button
            onClick={fetchClients}
            className="p-2 rounded-xl transition cursor-pointer"
            style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.4)', color: '#6B7280' }}
            title="Refresh"
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A15A'; e.currentTarget.style.borderColor = 'rgba(201,161,90,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'; }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Summary KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, color: '#4FD1C5' },
          { label: 'Active Subscriptions', value: clients.filter(c => c.membership?.status === 'Active').length, color: '#6FBE8C' },
          { label: 'With Active Workout', value: clients.filter(c => c.activeWorkout).length, color: '#C9A15A' },
          { label: 'With Active Diet', value: clients.filter(c => c.activeNutrition).length, color: '#FF4B2B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative p-4" >
            <Corners size={10} color={color + '50'} thickness={1} />
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: color + '99' }}>{label}</p>
            <p className="text-2xl font-extrabold font-mono mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Client Directory Table ── */}
      <div className="relative p-5 space-y-5" >
        <Corners size={14} color="#C9A15A" thickness={1} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-display text-sm font-bold text-slate-100">
            Client Directory ({filteredClients.length})
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search athlete..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition"
                style={{ ...inputStyle, width: '180px' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none transition"
              style={{ ...inputStyle, width: '120px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-500 text-[10px] uppercase font-bold tracking-wider font-mono" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <tr>
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Plan &amp; Status</th>
                <th className="py-3 px-4">Active Workout Split</th>
                <th className="py-3 px-4">Active Nutrition Diet</th>
                <th className="py-3 px-4">Latest Weight</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-600">
                    {loading ? 'Loading athletes...' : 'No clients found matching your search.'}
                  </td>
                </tr>
              ) : filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="transition"
                  style={{ borderBottom: '1px solid rgba(74,69,80,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=1a1810&color=C9A15A`}
                        alt={client.name}
                        className="w-9 h-9 rounded-full object-cover"
                        style={{ border: '1.5px solid rgba(74,69,80,0.4)' }}
                      />
                      <div>
                        <p className="font-semibold text-slate-100">{client.name}</p>
                        <p className="text-[11px] text-slate-500">{client.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200 block">{client.membership?.planName || 'Basic'}</span>
                    <span
                      className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                      style={statusStyle(client.membership?.status)}
                    >
                      {client.membership?.status || 'Active'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {client.activeWorkout ? (
                      <button
                        onClick={() => navigate('/plans/workouts')}
                        className="text-left font-mono text-[11px] flex items-center gap-1 group cursor-pointer"
                        style={{ color: '#4FD1C5' }}
                      >
                        <span className="truncate max-w-[150px] group-hover:underline">{client.activeWorkout.title}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    ) : (
                      <span className="text-slate-600 italic text-[11px]">None assigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {client.activeNutrition ? (
                      <button
                        onClick={() => navigate('/plans/nutrition')}
                        className="text-left font-mono text-[11px] flex items-center gap-1 group cursor-pointer"
                        style={{ color: '#6FBE8C' }}
                      >
                        <span className="truncate max-w-[150px] group-hover:underline">{client.activeNutrition.title}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    ) : (
                      <span className="text-slate-600 italic text-[11px]">None assigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {client.latestProgress?.weightKg ? (
                      <span className="text-slate-200 font-bold">
                        {client.latestProgress.weightKg} kg
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="flex items-center gap-1 font-semibold" style={{ color: '#C9A15A' }}>
                      <Flame className="w-3.5 h-3.5" />
                      {client.streakDays || 0}d
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleInspectClient(client)}
                        title="View Profile & Transformation Chart"
                        className="p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        style={{ background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,209,197,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,209,197,0.1)'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => {
                          setProgressTargetId(client._id);
                          setIsProgressModalOpen(true);
                        }}
                        title="Log Progress"
                        className="p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        style={{ background: 'rgba(201,161,90,0.1)', border: '1px solid rgba(201,161,90,0.25)', color: '#C9A15A' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,161,90,0.1)'}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Log</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Inspect Client Full Profile & Transformation Chart ── */}
      {selectedClient && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title={`Athlete Profile: ${selectedClient.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div
              className="p-4 rounded-2xl flex items-center justify-between gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,69,80,0.35)' }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={selectedClient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedClient.name)}&background=1a1810&color=C9A15A`}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: '2px solid rgba(201,161,90,0.35)' }}
                />
                <div>
                  <h4 className="font-display text-base font-bold text-slate-100">{selectedClient.name}</h4>
                  <p className="text-xs text-slate-500">{selectedClient.email} · {selectedClient.phone || 'No phone'}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#4FD1C5' }}>Goal: "{selectedClient.fitnessGoals}"</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                  style={{ background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' }}
                >
                  {selectedClient.membership?.planName}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Streak: <strong style={{ color: '#C9A15A' }}>{selectedClient.streakDays || 0} days</strong>
                </p>
              </div>
            </div>

            {/* Transformation Chart */}
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <h5 className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#6FBE8C' }}>
                  <TrendingUp className="w-4 h-4" />
                  <span>Body Recomposition &amp; Strength Trajectory</span>
                </h5>
                <button
                  onClick={() => {
                    setProgressTargetId(selectedClient._id);
                    setIsProgressModalOpen(true);
                  }}
                  className="text-xs font-semibold hover:underline cursor-pointer transition"
                  style={{ color: '#4FD1C5' }}
                >
                  + Record Entry
                </button>
              </div>
              <ProgressLineChart logs={clientDetails?.progressLogs || []} />
            </div>

            {/* Active Programs Quick Nav */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-xl space-y-1.5 transition"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(79,209,197,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase text-[#4FD1C5] font-semibold">Active Workout Routine</span>
                  <Dumbbell className="w-4 h-4 text-[#4FD1C5]" />
                </div>
                <p className="font-bold text-sm text-slate-100">
                  {clientDetails?.workoutPlans?.[0]?.title || selectedClient.activeWorkout?.title || 'None assigned'}
                </p>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    navigate('/plans/workouts');
                  }}
                  className="text-[11px] font-semibold transition cursor-pointer hover:underline pt-1 block"
                  style={{ color: '#4FD1C5' }}
                >
                  Open Workout Programs →
                </button>
              </div>

              <div
                className="p-4 rounded-xl space-y-1.5 transition"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(111,190,140,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase text-[#6FBE8C] font-semibold">Active Nutrition Regimen</span>
                  <Apple className="w-4 h-4 text-[#6FBE8C]" />
                </div>
                <p className="font-bold text-sm text-slate-100">
                  {clientDetails?.nutritionPlans?.[0]?.title || selectedClient.activeNutrition?.title || 'None assigned'}
                </p>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    navigate('/plans/nutrition');
                  }}
                  className="text-[11px] font-semibold transition cursor-pointer hover:underline pt-1 block"
                  style={{ color: '#6FBE8C' }}
                >
                  Open Nutrition &amp; Diets →
                </button>
              </div>
            </div>

            {/* Recent Check-Ins */}
            {clientDetails?.attendanceHistory?.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                  Recent Gym Check-Ins
                </h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {clientDetails.attendanceHistory.slice(0, 5).map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span className="text-slate-300 font-mono">{a.date}</span>
                      <span className="font-mono" style={{ color: '#4FD1C5' }}>
                        {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(111,190,140,0.12)', color: '#6FBE8C' }}>
                        ✓ {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Record Measurement Log */}
      <ProgressLogModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        targetMemberId={progressTargetId}
        onSuccess={() => {
          fetchClients();
          if (selectedClient && isProfileModalOpen) {
            handleInspectClient(selectedClient);
          }
        }}
      />
    </div>
  );
};

export default TrainerClientsPage;
