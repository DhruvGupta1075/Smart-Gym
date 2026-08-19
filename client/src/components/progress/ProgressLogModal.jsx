import React, { useState } from 'react';
import api from '../../utils/api';
import { useGym } from '../../context/GymContext';
import { Flame, Scale, Activity, Save, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

/* ── Shared inline styles ── */
const inputStyle = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const ProgressLogModal = ({ isOpen, onClose, onSuccess, targetMemberId = null }) => {
  const { showToast } = useGym();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    bodyFatPercentage: '',
    measurements: {
      chestCm: '',
      waistCm: '',
      hipsCm: '',
      armsCm: '',
      thighsCm: '',
      shouldersCm: '',
    },
    benchPressMaxKg: '',
    squatMaxKg: '',
    deadliftMaxKg: '',
    notes: '',
    energyLevel: 8,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weightKg) {
      showToast('Please enter your weight in kg', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        weightKg: Number(formData.weightKg),
        bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : undefined,
        measurements: {
          chestCm: formData.measurements.chestCm ? Number(formData.measurements.chestCm) : 0,
          waistCm: formData.measurements.waistCm ? Number(formData.measurements.waistCm) : 0,
          hipsCm: formData.measurements.hipsCm ? Number(formData.measurements.hipsCm) : 0,
          armsCm: formData.measurements.armsCm ? Number(formData.measurements.armsCm) : 0,
          thighsCm: formData.measurements.thighsCm ? Number(formData.measurements.thighsCm) : 0,
          shouldersCm: formData.measurements.shouldersCm ? Number(formData.measurements.shouldersCm) : 0,
        },
        benchPressMaxKg: formData.benchPressMaxKg ? Number(formData.benchPressMaxKg) : 0,
        squatMaxKg: formData.squatMaxKg ? Number(formData.squatMaxKg) : 0,
        deadliftMaxKg: formData.deadliftMaxKg ? Number(formData.deadliftMaxKg) : 0,
        targetMemberId,
      };

      await api.post('/api/member/progress', payload);
      showToast('Progress entry recorded successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record progress', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Body Measurements & Strength"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Log Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none transition font-mono"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: '#4FD1C5' }}>Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 82.5"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(79,209,197,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: '#FF4B2B' }}>Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 15.5"
              value={formData.bodyFatPercentage}
              onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,75,43,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>
        </div>

        {/* Circumference Measurements */}
        <div
          className="p-4 rounded-xl space-y-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#4FD1C5' }}>
            <Scale className="w-3.5 h-3.5" style={{ color: '#4FD1C5' }} />
            <span>Circumference Measurements (cm)</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px]">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="104"
                value={formData.measurements.chestCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, chestCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="82"
                value={formData.measurements.waistCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, waistCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Arms (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="38.5"
                value={formData.measurements.armsCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, armsCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Thighs (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="60"
                value={formData.measurements.thighsCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, thighsCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Hips (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="98"
                value={formData.measurements.hipsCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, hipsCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Shoulders (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="120"
                value={formData.measurements.shouldersCm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurements: { ...formData.measurements, shouldersCm: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
          </div>
        </div>

        {/* Strength 1RMs */}
        <div
          className="p-4 rounded-xl space-y-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#6FBE8C' }}>
            <Activity className="w-3.5 h-3.5" style={{ color: '#6FBE8C' }} />
            <span>Key Compound Lifts (Max kg)</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px]">Bench Press (kg)</label>
              <input
                type="number"
                step="2.5"
                placeholder="100"
                value={formData.benchPressMaxKg}
                onChange={(e) => setFormData({ ...formData, benchPressMaxKg: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Back Squat (kg)</label>
              <input
                type="number"
                step="2.5"
                placeholder="140"
                value={formData.squatMaxKg}
                onChange={(e) => setFormData({ ...formData, squatMaxKg: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Deadlift (kg)</label>
              <input
                type="number"
                step="2.5"
                placeholder="180"
                value={formData.deadliftMaxKg}
                onChange={(e) => setFormData({ ...formData, deadliftMaxKg: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-slate-100 font-mono text-xs focus:outline-none transition mt-0.5"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Notes & Workout Feeling</label>
          <input
            type="text"
            placeholder="e.g. Felt strong during push sets, recovery is on point."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none transition"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 transition cursor-pointer"
            style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(74,69,80,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(74,69,80,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-100 text-xs font-bold transition cursor-pointer active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #DC2626 60%, #991B1B 100%)', boxShadow: '0 4px 16px rgba(255,75,43,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,75,43,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,75,43,0.25)'}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Record Measurement Log</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProgressLogModal;
