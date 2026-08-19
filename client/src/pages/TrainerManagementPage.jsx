import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import {
  Dumbbell,
  Users,
  Plus,
  Trash2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Corners from '../components/common/Corners';

const card = {
  background: '#18170F',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition";

const TrainerCard = ({ trainer }) => (
  <div className="relative p-5 space-y-4 flex flex-col justify-between" style={card}>
    <Corners size={12} color="#C9A15A" thickness={1} />
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(201,161,90,0.15)', color: '#C9A15A', border: '1px solid rgba(201,161,90,0.3)' }}>
          {trainer.name ? trainer.name.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <h4 className="font-display font-bold text-sm text-slate-100">{trainer.name}</h4>
          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3 h-3 text-slate-600" />
            {trainer.email}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Specialization</span>
          <span className="text-slate-300 font-medium">{trainer.trainerSpecialization || 'General Fitness'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Assigned Clients</span>
          <span className="font-mono font-bold" style={{ color: '#4FD1C5' }}>{trainer.clientCount || 0}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Status</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}>
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
        </div>
      </div>
    </div>
  </div>
);

const TrainerManagementPage = () => {
  const { showToast } = useGym();
  const [trainers, setTrainers] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [whitelistForm, setWhitelistForm] = useState({
    email: '',
    role: 'trainer',
    notes: 'Authorized Trainer',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trainersRes, whitelistRes] = await Promise.all([
        api.get('/api/admin/trainers'),
        api.get('/api/auth/whitelist'),
      ]);
      if (trainersRes.data.success) setTrainers(trainersRes.data.trainers);
      if (whitelistRes.data.success) setWhitelist(whitelistRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load trainer data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWhitelist = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/whitelist', whitelistForm);
      if (data.success) {
        showToast('Email authorized to the whitelist!', 'success');
        setIsAddModalOpen(false);
        setWhitelistForm({ email: '', role: 'trainer', notes: 'Authorized Trainer' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to whitelist', 'error');
    }
  };

  const handleRemoveWhitelist = async (id, email) => {
    if (!window.confirm(`Revoke whitelist access for ${email}?`)) return;
    try {
      const { data } = await api.delete(`/api/auth/whitelist/${id}`);
      if (data.success) {
        showToast('Whitelist access revoked', 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove', 'error');
    }
  };

  const trainerWhitelist = whitelist.filter(w => w.role === 'trainer');
  const adminWhitelist = whitelist.filter(w => w.role === 'admin');

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/50 uppercase">Admin // Trainers</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Dumbbell className="w-7 h-7" style={{ color: '#C9A15A' }} />
            Trainer Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified coach profiles, client allocations, and access whitelist control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-slate-100"
            style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,75,43,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,75,43,0.25)'}
          >
            <Plus className="w-4 h-4" />
            <span>Authorize Trainer Email</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Coaches', value: trainers.length, color: '#C9A15A' },
          { label: 'Total Clients', value: trainers.reduce((a, t) => a + (t.clientCount || 0), 0), color: '#4FD1C5' },
          { label: 'Whitelist (Trainer)', value: trainerWhitelist.length, color: '#6FBE8C' },
          { label: 'Whitelist (Admin)', value: adminWhitelist.length, color: '#FF4B2B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative p-4" >
            <Corners size={10} color={color + '50'} thickness={1} />
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: color + '99' }}>{label}</p>
            <p className="text-2xl font-extrabold font-mono mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Trainer Cards Grid ── */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Active Coaches — {trainers.length}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="relative p-16 text-center" >
            <Corners color="rgba(255,255,255,0.1)" thickness={1} />
            <Dumbbell className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
            <p className="text-sm text-slate-500">No trainers registered yet.</p>
            <p className="text-xs text-slate-600 mt-1">Authorize a trainer email, then ask them to register.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer._id} trainer={trainer} />
            ))}
          </div>
        )}
      </div>

      {/* ── Whitelist Section (Collapsible) ── */}
      <div className="relative" >
        <Corners size={14} color="rgba(255,75,43,0.3)" thickness={1} />

        {/* Header toggle */}
        <button
          onClick={() => setWhitelistOpen(v => !v)}
          className="w-full p-5 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(255,75,43,0.1)', border: '1px solid rgba(255,75,43,0.2)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: '#FF4B2B' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-100">Role Authorization Whitelist</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {whitelist.length} pre-authorized email{whitelist.length !== 1 ? 's' : ''} — admins & trainers only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,75,43,0.1)', border: '1px solid rgba(255,75,43,0.25)', color: '#FF4B2B' }}>
              SECURITY
            </span>
            {whitelistOpen
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </div>
        </button>

        {/* Whitelist table */}
        {whitelistOpen && (
          <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 py-3 mb-2">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: '#C9A15A' }} />
              <p className="text-[11px] text-slate-400">
                Only pre-approved emails can register as Admin or Trainer. Members can register freely.
              </p>
            </div>

            {whitelist.length === 0 ? (
              <p className="text-xs text-slate-600 py-6 text-center">No records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelist.map((item) => (
                      <tr
                        key={item._id}
                        className="transition"
                        style={{ borderBottom: '1px solid rgba(74,69,80,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#C9A15A' }} />
                            <span className="font-mono text-[11px] text-slate-200">{item.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                            style={item.role === 'admin'
                              ? { background: 'rgba(255,75,43,0.12)', border: '1px solid rgba(255,75,43,0.3)', color: '#FF4B2B' }
                              : { background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.25)', color: '#4FD1C5' }
                            }>
                            {item.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{item.notes || '—'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRemoveWhitelist(item._id, item.email)}
                            className="p-1.5 rounded-lg transition cursor-pointer"
                            style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.35)', color: '#6B7280' }}
                            title="Revoke access"
                            onMouseEnter={e => { e.currentTarget.style.color = '#FF4B2B'; e.currentTarget.style.background = 'rgba(255,75,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,43,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; e.currentTarget.style.borderColor = 'rgba(74,69,80,0.35)'; }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Authorize Email ── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Authorize New Trainer / Admin Email" maxWidth="max-w-md">
        <form onSubmit={handleAddWhitelist} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.8)' }}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. coach.alex@smartgym.com"
              value={whitelistForm.email}
              onChange={(e) => setWhitelistForm({ ...whitelistForm, email: e.target.value })}
              className={inputCls} style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.8)' }}>Role Authorization</label>
            <select
              value={whitelistForm.role}
              onChange={(e) => setWhitelistForm({ ...whitelistForm, role: e.target.value })}
              className={inputCls} style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            >
              <option value="trainer">Trainer / Coach</option>
              <option value="admin">Gym Administrator</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.8)' }}>Notes</label>
            <input
              type="text"
              placeholder="e.g. Head Nutrition Coach"
              value={whitelistForm.notes}
              onChange={(e) => setWhitelistForm({ ...whitelistForm, notes: e.target.value })}
              className={inputCls} style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.4)', color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(74,69,80,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; }}>
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl text-slate-100 font-bold text-xs transition cursor-pointer active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,75,43,0.4)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,75,43,0.25)'}>
              Authorize Email
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerManagementPage;
