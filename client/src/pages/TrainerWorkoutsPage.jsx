import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import WorkoutBuilderModal from '../components/workout/WorkoutBuilderModal';
import WorkoutViewer from '../components/workout/WorkoutViewer';
import Modal from '../components/common/Modal';
import Corners from '../components/common/Corners';

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const TrainerWorkoutsPage = () => {
  const { showToast } = useGym();
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Template', 'Assigned'

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewingPlan, setViewingPlan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, clientsRes] = await Promise.all([
        api.get('/api/trainer/workout-plans'),
        api.get('/api/trainer/clients'),
      ]);
      if (plansRes.data.success) setPlans(plansRes.data.plans);
      if (clientsRes.data.success) setClients(clientsRes.data.clients);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load workout plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete workout plan "${title}"?`)) return;
    try {
      const { data } = await api.delete(`/api/trainer/workout-plans/${id}`);
      if (data.success) {
        showToast('Workout plan deleted', 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete plan', 'error');
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.member?.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'Template') return p.isTemplate || !p.member;
    if (filterType === 'Assigned') return p.member && !p.isTemplate;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/70 uppercase">Coach // Programs</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Dumbbell className="w-7 h-7" style={{ color: '#C9A15A' }} />
            <span>Workout Programs &amp; Splits</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author progressive overload splits, manage re-usable master templates, and deploy to athletes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingPlan(null); setIsBuilderOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-slate-100"
            style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,75,43,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,75,43,0.25)'}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Program</span>
          </button>

          <button
            onClick={fetchData}
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

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative p-4" >
          <Corners size={10} color="#C9A15A50" thickness={1} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#C9A15A]/70">Total Programs Authored</p>
          <p className="text-2xl font-extrabold font-mono mt-1 text-[#C9A15A]">{plans.length}</p>
        </div>
        <div className="relative p-4" >
          <Corners size={10} color="#4FD1C550" thickness={1} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#4FD1C5]/70">Assigned To Clients</p>
          <p className="text-2xl font-extrabold font-mono mt-1 text-[#4FD1C5]">{plans.filter(p => p.member).length}</p>
        </div>
        <div className="relative p-4" >
          <Corners size={10} color="#6FBE8C50" thickness={1} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6FBE8C]/70">Master Templates</p>
          <p className="text-2xl font-extrabold font-mono mt-1 text-[#6FBE8C]">{plans.filter(p => p.isTemplate || !p.member).length}</p>
        </div>
      </div>

      {/* ── Filter Toolbar & Grid ── */}
      <div className="relative p-5 space-y-5" >
        <Corners size={14} color="#C9A15A" thickness={1} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <h3 className="font-display text-sm font-bold text-slate-100">Programs Directory ({filteredPlans.length})</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search plan or athlete..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition"
                style={{ ...inputStyle, width: '200px' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>

            {/* Filter */}
            <div className="flex items-center rounded-xl p-0.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(74,69,80,0.4)' }}>
              {['All', 'Assigned', 'Template'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    filterType === t
                      ? 'text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={{
                    background: filterType === t ? 'rgba(201,161,90,0.2)' : 'transparent',
                    color: filterType === t ? '#C9A15A' : undefined,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            {loading ? 'Loading workout programs...' : 'No workout programs found matching your filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan) => {
              const totalExercises = plan.schedule?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0) || 0;
              const daysCount = plan.schedule?.length || 0;

              return (
                <div
                  key={plan._id}
                  className="relative p-5 space-y-4 rounded-2xl transition flex flex-col justify-between"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(201,161,90,0.3)';
                    e.currentTarget.style.background = 'rgba(201,161,90,0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                  }}
                >
                  <Corners size={10} color="rgba(201,161,90,0.3)" thickness={1} />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase"
                        style={plan.member
                          ? { background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }
                          : { background: 'rgba(201,161,90,0.1)', border: '1px solid rgba(201,161,90,0.25)', color: '#C9A15A' }
                        }
                      >
                        {plan.member ? `Athlete: ${plan.member.name}` : 'Master Template'}
                      </span>

                      <span
                        className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,69,80,0.2)', color: '#94A3B8' }}
                      >
                        {plan.difficulty}
                      </span>
                    </div>

                    <h4 className="font-display text-base font-bold text-slate-100 leading-snug">{plan.title}</h4>
                    <p className="text-xs font-mono" style={{ color: '#C9A15A' }}>{plan.goal}</p>

                    {plan.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{plan.description}</p>
                    )}
                  </div>

                  {/* Schedule Metrics */}
                  <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <strong className="text-slate-200">{daysCount}</strong> Training Days
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <strong className="text-slate-200">{totalExercises}</strong> Total Exercises
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-2">
                      <button
                        onClick={() => setViewingPlan(plan)}
                        className="p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                        style={{ background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,209,197,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,209,197,0.1)'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => { setEditingPlan(plan); setIsBuilderOpen(true); }}
                        className="p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                        style={{ background: 'rgba(201,161,90,0.1)', border: '1px solid rgba(201,161,90,0.25)', color: '#C9A15A' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,161,90,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,161,90,0.1)'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(plan._id, plan.title)}
                        className="p-2 rounded-xl transition cursor-pointer text-slate-500 hover:text-[#FF4B2B]"
                        style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
                        title="Delete Plan"
                        onMouseEnter={e => { e.currentTarget.style.color = '#FF4B2B'; e.currentTarget.style.background = 'rgba(255,75,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,43,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: View Full Workout Routine */}
      {viewingPlan && (
        <Modal
          isOpen={!!viewingPlan}
          onClose={() => setViewingPlan(null)}
          title={`Program Preview: ${viewingPlan.title}`}
          maxWidth="max-w-4xl"
        >
          <WorkoutViewer plan={viewingPlan} isInteractive={false} />
        </Modal>
      )}

      {/* Modal: Create or Edit Workout Plan */}
      <WorkoutBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialData={editingPlan}
        memberList={clients}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default TrainerWorkoutsPage;
