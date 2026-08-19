import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useGym } from '../context/GymContext';
import { ShieldCheck, Plus, Trash2, Mail, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/common/Modal';

const WhitelistManagement = () => {
  const { showToast } = useGym();
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('trainer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/whitelist');
      if (res.data.success) {
        setWhitelist(res.data.whitelist);
      }
    } catch (err) {
      showToast('Failed to fetch whitelist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Email is required', 'error');
    setSubmitting(true);
    try {
      await api.post('/api/auth/whitelist', { email, role });
      showToast('Added to whitelist successfully', 'success');
      setIsAddModalOpen(false);
      setEmail('');
      setRole('trainer');
      fetchWhitelist();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to whitelist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this email from the whitelist?')) return;
    try {
      await api.delete(`/api/auth/whitelist/${id}`);
      showToast('Removed from whitelist', 'success');
      fetchWhitelist();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove from whitelist', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="section-label">Admin // Access Control</span>
          <h1 className="font-display text-3xl lg:text-4xl text-slate-100 mt-1">
            Staff Whitelist
          </h1>
          <p className="page-subtitle">Pre-approve emails for Trainer and Admin registration.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold flex items-center gap-2 px-4 py-2 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Whitelist</span>
          </button>
          <button onClick={fetchWhitelist} className="btn-icon" title="Refresh List">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-[#18170F] border border-forge-500/40 p-5 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 font-mono tracking-wider border-b border-forge-500/20">
              <tr>
                <th className="py-3 font-semibold pl-4">Email Address</th>
                <th className="py-3 font-semibold">Authorized Role</th>
                <th className="py-3 font-semibold text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-500/10">
              {loading ? (
                <tr><td colSpan={3} className="py-8 text-center text-slate-600">Loading whitelist...</td></tr>
              ) : whitelist.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-600">
                    <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm">No emails in whitelist.</p>
                    <p className="text-xs mt-1">Add emails to allow staff registration.</p>
                  </td>
                </tr>
              ) : (
                whitelist.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-300">{item.email}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'admin' 
                          ? 'bg-gym-red/10 text-gym-red border border-gym-red/30' 
                          : 'bg-status-teal/10 text-status-teal border border-status-teal/30'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-gym-red hover:bg-gym-red/10 transition-colors cursor-pointer"
                        title="Remove from Whitelist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add to Whitelist">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="email"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-gym-dark border border-forge-500/40 rounded-lg text-sm text-slate-200 placeholder-forge-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
                placeholder="staff@smartgym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
              Role Authorization
            </label>
            <select
              className="w-full px-4 py-2.5 bg-gym-dark border border-forge-500/40 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold px-6 py-2 text-xs font-bold"
            >
              {submitting ? 'Adding...' : 'Authorize Email'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WhitelistManagement;

