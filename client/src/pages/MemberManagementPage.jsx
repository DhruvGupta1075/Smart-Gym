import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import ExportButton from '../components/common/ExportButton';
import WorkoutViewer from '../components/workout/WorkoutViewer';
import ProgressLineChart from '../components/charts/ProgressLineChart';
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

const statusStyle = (status) => {
  if (status === 'Active') return { background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' };
  if (status === 'Expired') return { background: 'rgba(255,75,43,0.12)', border: '1px solid rgba(255,75,43,0.3)', color: '#FF4B2B' };
  return { background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' };
};

const inputCls = "text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition";

const MemberManagementPage = () => {
  const { showToast } = useGym();
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFullDetails, setMemberFullDetails] = useState(null);

  const [memberForm, setMemberForm] = useState({
    name: '', email: '', phone: '', password: '',
    membershipPlan: 'Basic Monthly', assignedTrainer: '',
    fitnessGoals: 'Strength building and conditioning',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, trainersRes, statsRes] = await Promise.all([
        api.get('/api/admin/members'),
        api.get('/api/admin/trainers'),
        api.get('/api/admin/dashboard-stats'),
      ]);
      if (membersRes.data.success) setMembers(membersRes.data.members);
      if (trainersRes.data.success) setTrainers(trainersRes.data.trainers);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch member data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredMembers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (planFilter !== 'All') params.append('plan', planFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      const { data } = await api.get(`/api/admin/members?${params.toString()}`);
      if (data.success) setMembers(data.members);
    } catch (err) {
      showToast('Error applying member filters', 'error');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchFilteredMembers(), 300);
    return () => clearTimeout(t);
  }, [search, planFilter, statusFilter]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/admin/members', memberForm);
      if (data.success) {
        showToast('Member created successfully!', 'success');
        setIsAddModalOpen(false);
        setMemberForm({ name:'', email:'', phone:'', password:'', membershipPlan:'Basic Monthly', assignedTrainer:'', fitnessGoals:'' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create member', 'error');
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      const { data } = await api.put(`/api/admin/members/${selectedMember._id}`, selectedMember);
      if (data.success) {
        showToast('Member details updated!', 'success');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update member', 'error');
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Delete member ${name}? This will remove their attendance and records.`)) return;
    try {
      const { data } = await api.delete(`/api/admin/members/${id}`);
      if (data.success) { showToast('Member deleted successfully', 'success'); fetchData(); }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete member', 'error');
    }
  };

  const handleViewMemberDetails = async (id) => {
    try {
      const { data } = await api.get(`/api/admin/members/${id}`);
      if (data.success) { setMemberFullDetails(data); setIsViewModalOpen(true); }
    } catch (err) {
      showToast('Failed to load member profile details', 'error');
    }
  };

  const handleQuickRenew = async (memberId) => {
    try {
      const newExpiry = new Date();
      newExpiry.setMonth(newExpiry.getMonth() + 1);
      await api.put(`/api/admin/members/${memberId}`, { membershipStatus: 'Active', expiryDate: newExpiry });
      showToast('Membership renewed for 30 days!', 'success');
      fetchData();
    } catch (err) {
      showToast('Renewal failed', 'error');
    }
  };

  const exportableMembers = members.map((m) => ({
    ID: m._id, Name: m.name, Email: m.email, Phone: m.phone || 'N/A',
    Plan: m.membership?.planName || 'Basic', Status: m.membership?.status || 'Active',
    Trainer: m.assignedTrainer?.name || 'Unassigned',
    Expires: m.membership?.expiryDate ? new Date(m.membership.expiryDate).toLocaleDateString() : 'N/A',
  }));

  const activeCount = members.filter(m => m.membership?.status === 'Active').length;
  const expiredCount = members.filter(m => m.membership?.status === 'Expired').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#C9A15A]/50 uppercase">Admin // Members</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7" style={{ color: '#4FD1C5' }} />
            Member Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full member roster — subscriptions, trainer assignments, and membership lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 text-slate-100"
            style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,75,43,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,75,43,0.25)'}
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>

          <ExportButton data={exportableMembers} filename="gym_members_roster" title="Smart Gym Member Roster Report" />

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
          { label: 'Total Members', value: members.length, color: '#4FD1C5' },
          { label: 'Active', value: activeCount, color: '#6FBE8C' },
          { label: 'Expired', value: expiredCount, color: '#FF4B2B' },
          { label: 'Trainers Available', value: trainers.length, color: '#C9A15A' },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative p-4" >
            <Corners size={10} color={color + '50'} thickness={1} />
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: color + '99' }}>{label}</p>
            <p className="text-2xl font-extrabold font-mono mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Member Table ── */}
      <div className="relative p-5 space-y-5" >
        <Corners size={14} color="#C9A15A" thickness={1} />

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-display text-base font-bold text-slate-100">
            Member Directory ({members.length})
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-xl ${inputCls}`}
                style={{ ...inputStyle, width: '180px' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>

            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl ${inputCls}`} style={{ ...inputStyle, width: '130px' }}>
              <option value="All">All Plans</option>
              <option value="Basic Monthly">Basic</option>
              <option value="Silver Quarterly">Silver</option>
              <option value="Gold Half-Yearly">Gold</option>
              <option value="Platinum Annual">Platinum</option>
              <option value="VIP Elite">VIP Elite</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl ${inputCls}`} style={{ ...inputStyle, width: '130px' }}>
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
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Coach</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-600">
                    {loading ? 'Loading members...' : 'No members found matching your filters.'}
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m._id} className="transition" style={{ borderBottom: '1px solid rgba(74,69,80,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1a1810&color=C9A15A`}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover"
                        style={{ border: '1.5px solid rgba(74,69,80,0.4)' }}
                      />
                      <div>
                        <p className="font-semibold text-slate-100">{m.name}</p>
                        <p className="text-[11px] text-slate-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200">{m.membership?.planName || 'Basic'}</span>
                    <p className="text-[10px] text-slate-600 font-mono">${m.membership?.price || 49} / cycle</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono" style={statusStyle(m.membership?.status)}>
                      {m.membership?.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {m.assignedTrainer
                      ? <span style={{ color: '#4FD1C5' }} className="font-medium">{m.assignedTrainer.name}</span>
                      : <span className="text-slate-600 italic">Self-Guided</span>
                    }
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {m.membership?.expiryDate ? new Date(m.membership.expiryDate).toLocaleDateString() : 'N/A'}
                      </span>
                      {m.membership?.status === 'Expired' && (
                        <button
                          onClick={() => handleQuickRenew(m._id)}
                          className="block mt-0.5 text-[10px] font-bold transition cursor-pointer"
                          style={{ color: '#C9A15A' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          +1 Month Renew
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {[
                        { icon: Eye, title: 'View Full Profile', color: '#4FD1C5', onClick: () => handleViewMemberDetails(m._id) },
                        { icon: Edit2, title: 'Edit / Renew', color: '#C9A15A', onClick: () => { setSelectedMember(m); setIsEditModalOpen(true); } },
                        { icon: Trash2, title: 'Delete', color: '#FF4B2B', onClick: () => handleDeleteMember(m._id, m.name) },
                      ].map(({ icon: Icon, title, color, onClick }) => (
                        <button
                          key={title}
                          onClick={onClick}
                          title={title}
                          className="p-1.5 rounded-lg transition cursor-pointer"
                          style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280' }}
                          onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = color + '15'; e.currentTarget.style.borderColor = color + '40'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add Member ── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Member" maxWidth="max-w-xl">
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Full Name *</label>
              <input type="text" required placeholder="e.g. Samuel Green" value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className={inputCls} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address *</label>
              <input type="email" required placeholder="samuel@gmail.com" value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                className={inputCls} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Phone Number</label>
              <input type="text" placeholder="+91 98765 43210" value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                className={inputCls} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <input type="text" placeholder="Defaults to Member@12345" value={memberForm.password}
                onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                className={`${inputCls} font-mono`} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Membership Tier</label>
              <select value={memberForm.membershipPlan}
                onChange={(e) => setMemberForm({ ...memberForm, membershipPlan: e.target.value })}
                className={inputCls} style={inputStyle}>
                <option value="Basic Monthly">Basic Monthly</option>
                <option value="Silver Quarterly">Silver Quarterly</option>
                <option value="Gold Half-Yearly">Gold Half-Yearly</option>
                <option value="Platinum Annual">Platinum Annual</option>
                <option value="VIP Elite">VIP Elite</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign Coach / Trainer</label>
              <select value={memberForm.assignedTrainer}
                onChange={(e) => setMemberForm({ ...memberForm, assignedTrainer: e.target.value })}
                className={inputCls} style={inputStyle}>
                <option value="">Unassigned (Self-Guided)</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.trainerDetails?.specialization || 'Trainer'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 transition cursor-pointer"
              style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.4)' }}>
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer text-slate-100"
              style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}>
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Edit Member ── */}
      {selectedMember && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Member: ${selectedMember.name}`} maxWidth="max-w-xl">
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Name</label>
                <input type="text" value={selectedMember.name}
                  onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                  className={inputCls} style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Phone</label>
                <input type="text" value={selectedMember.phone || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                  className={inputCls} style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Membership Tier</label>
                <select value={selectedMember.membership?.planName}
                  onChange={(e) => setSelectedMember({ ...selectedMember, membershipPlan: e.target.value })}
                  className={inputCls} style={inputStyle}>
                  <option value="Basic Monthly">Basic Monthly</option>
                  <option value="Silver Quarterly">Silver Quarterly</option>
                  <option value="Gold Half-Yearly">Gold Half-Yearly</option>
                  <option value="Platinum Annual">Platinum Annual</option>
                  <option value="VIP Elite">VIP Elite</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Membership Status</label>
                <select value={selectedMember.membership?.status}
                  onChange={(e) => setSelectedMember({ ...selectedMember, membershipStatus: e.target.value })}
                  className={inputCls} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Frozen">Frozen</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assigned Coach</label>
              <select value={selectedMember.assignedTrainer?._id || selectedMember.assignedTrainer || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, assignedTrainer: e.target.value })}
                className={inputCls} style={inputStyle}>
                <option value="">Unassigned</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.trainerDetails?.specialization || 'Trainer'})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 transition cursor-pointer"
                style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.4)' }}>
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 rounded-xl font-bold text-xs transition cursor-pointer text-slate-100"
                style={{ background: 'linear-gradient(135deg, #C9A15A, #A07A30)', boxShadow: '0 4px 16px rgba(201,161,90,0.25)' }}>
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: View Member Full Profile ── */}
      {memberFullDetails && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Member Profile: ${memberFullDetails.member.name}`} maxWidth="max-w-4xl">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="p-4 rounded-2xl flex items-center justify-between gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,69,80,0.35)' }}>
              <div className="flex items-center gap-3">
                <img
                  src={memberFullDetails.member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberFullDetails.member.name)}&background=1a1810&color=C9A15A`}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: '2px solid rgba(201,161,90,0.35)' }}
                />
                <div>
                  <h4 className="font-display text-base font-bold text-slate-100">{memberFullDetails.member.name}</h4>
                  <p className="text-xs text-slate-500">{memberFullDetails.member.email} · {memberFullDetails.member.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                  style={{ background: 'rgba(201,161,90,0.12)', border: '1px solid rgba(201,161,90,0.3)', color: '#C9A15A' }}>
                  {memberFullDetails.member.membership?.planName}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Expires: {new Date(memberFullDetails.member.membership?.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h5 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#6FBE8C' }}>
                Transformation & Body Metrics Trajectory
              </h5>
              <ProgressLineChart logs={memberFullDetails.progressLogs || []} />
            </div>

            {/* Workout Plan */}
            {memberFullDetails.workoutPlans?.length > 0 ? (
              <WorkoutViewer plan={memberFullDetails.workoutPlans[0]} isInteractive={false} />
            ) : (
              <div className="p-4 rounded-xl text-center text-xs text-slate-600"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                No active workout routine assigned to this member.
              </div>
            )}

            {/* Recent Attendance */}
            {memberFullDetails.attendanceHistory?.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#4FD1C5' }}>
                  Recent Attendance (Last 10)
                </h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memberFullDetails.attendanceHistory.slice(0, 10).map((a) => (
                    <div key={a._id} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-slate-300 font-mono">{a.date}</span>
                      <span className="font-mono" style={{ color: '#4FD1C5' }}>
                        {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(111,190,140,0.12)', color: '#6FBE8C' }}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MemberManagementPage;
