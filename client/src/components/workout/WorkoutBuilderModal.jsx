import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useGym } from '../../context/GymContext';
import { Plus, Trash2, Dumbbell, Save, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

/* ── Shared inline styles ── */
const inputStyle = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const WorkoutBuilderModal = ({ isOpen, onClose, initialData = null, onSuccess, memberList = [] }) => {
  const { showToast } = useGym();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: 'Hypertrophy / Muscle Building',
    difficulty: 'Intermediate',
    member: '',
    isTemplate: false,
    schedule: [
      {
        day: 'Monday',
        title: 'Push Day (Chest / Shoulders / Triceps)',
        focusArea: 'Chest & Delts',
        exercises: [
          { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8-10', restSeconds: 90, instructions: '' },
          { name: 'Overhead Press', targetMuscle: 'Shoulders', sets: 3, reps: '10', restSeconds: 75, instructions: '' },
        ],
      },
      {
        day: 'Tuesday',
        title: 'Pull Day (Back / Biceps)',
        focusArea: 'Lats & Rhomboids',
        exercises: [
          { name: 'Pull-Ups / Lat Pulldown', targetMuscle: 'Back', sets: 4, reps: '8-10', restSeconds: 90, instructions: '' },
          { name: 'Barbell Row', targetMuscle: 'Mid Back', sets: 3, reps: '10-12', restSeconds: 75, instructions: '' },
        ],
      },
      {
        day: 'Wednesday',
        title: 'Legs & Core',
        focusArea: 'Quads & Hamstrings',
        exercises: [
          { name: 'Barbell Back Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', restSeconds: 120, instructions: '' },
          { name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: '10-12', restSeconds: 90, instructions: '' },
        ],
      },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        goal: initialData.goal || 'Hypertrophy / Muscle Building',
        difficulty: initialData.difficulty || 'Intermediate',
        member: initialData.member?._id || initialData.member || '',
        isTemplate: !!initialData.isTemplate,
        schedule: initialData.schedule && initialData.schedule.length > 0 ? initialData.schedule : formData.schedule,
      });
    }
  }, [initialData]);

  const handleAddDay = () => {
    const remainingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(
      (d) => !formData.schedule.some((s) => s.day === d)
    );
    const newDay = remainingDays[0] || 'Thursday';

    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        {
          day: newDay,
          title: 'Upper / Lower Split',
          focusArea: 'Upper Body',
          exercises: [{ name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 3, reps: '10', restSeconds: 60, instructions: '' }],
        },
      ],
    });
  };

  const handleRemoveDay = (index) => {
    const updated = [...formData.schedule];
    updated.splice(index, 1);
    setFormData({ ...formData, schedule: updated });
  };

  const handleAddExercise = (dayIndex) => {
    const updated = [...formData.schedule];
    updated[dayIndex].exercises.push({
      name: '',
      targetMuscle: 'General',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      instructions: '',
    });
    setFormData({ ...formData, schedule: updated });
  };

  const handleRemoveExercise = (dayIndex, exIndex) => {
    const updated = [...formData.schedule];
    updated[dayIndex].exercises.splice(exIndex, 1);
    setFormData({ ...formData, schedule: updated });
  };

  const handleExerciseChange = (dayIndex, exIndex, field, value) => {
    const updated = [...formData.schedule];
    updated[dayIndex].exercises[exIndex][field] = value;
    setFormData({ ...formData, schedule: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Please enter a routine title', 'error');
      return;
    }

    setLoading(true);
    try {
      if (initialData?._id) {
        await api.put(`/api/trainer/workout-plans/${initialData._id}`, formData);
        showToast('Workout plan updated successfully!', 'success');
      } else {
        await api.post('/api/trainer/workout-plans', formData);
        showToast('Workout plan created & assigned!', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save workout plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Workout Plan' : 'Build Custom Workout Plan'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Plan Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 5-Day Hypertrophy & Power Split"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Primary Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            >
              <option value="Hypertrophy / Muscle Building">Hypertrophy / Muscle Building</option>
              <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
              <option value="Strength & Power">Strength & Power</option>
              <option value="Endurance & Stamina">Endurance & Stamina</option>
              <option value="Mobility & Posture">Mobility & Posture</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Assign to Member</label>
            <select
              value={formData.member}
              onChange={(e) => setFormData({ ...formData, member: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            >
              <option value="">Master Template (Reusable)</option>
              {memberList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Athlete">Athlete</option>
            </select>
          </div>
        </div>

        {/* Days & Exercises Builder */}
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: '#4FD1C5' }}>
              Weekly Routine Schedule ({formData.schedule.length} Days Configured)
            </h4>
            {formData.schedule.length < 7 && (
              <button
                type="button"
                onClick={handleAddDay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                style={{ background: 'rgba(79,209,197,0.12)', border: '1px solid rgba(79,209,197,0.3)', color: '#4FD1C5' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,209,197,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,209,197,0.12)'}
              >
                <Plus className="w-3.5 h-3.5" /> Add Day
              </button>
            )}
          </div>

          {formData.schedule.map((dayItem, dayIdx) => (
            <div
              key={dayIdx}
              className="p-4 rounded-xl space-y-3 relative"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={dayItem.day}
                    onChange={(e) => {
                      const updated = [...formData.schedule];
                      updated[dayIdx].day = e.target.value;
                      setFormData({ ...formData, schedule: updated });
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition focus:outline-none"
                    style={{ background: '#131210', border: '1px solid rgba(79,209,197,0.3)', color: '#4FD1C5' }}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Day Routine Title (e.g. Chest & Triceps Blast)"
                    value={dayItem.title}
                    onChange={(e) => {
                      const updated = [...formData.schedule];
                      updated[dayIdx].title = e.target.value;
                      setFormData({ ...formData, schedule: updated });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs text-slate-200 focus:outline-none transition"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDay(dayIdx)}
                  className="p-1.5 rounded-lg transition cursor-pointer"
                  style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280' }}
                  title="Remove Day"
                  onMouseEnter={e => { e.currentTarget.style.color = '#FF4B2B'; e.currentTarget.style.background = 'rgba(255,75,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,43,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Exercises in Day */}
              <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid rgba(201,161,90,0.3)' }}>
                {dayItem.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Exercise Name"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-slate-100 text-xs focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <input
                      type="text"
                      placeholder="Muscle"
                      value={ex.targetMuscle}
                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'targetMuscle', e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg text-slate-100 text-xs focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'sets', Number(e.target.value))}
                      className="w-14 px-2 py-1.5 rounded-lg text-slate-100 text-xs text-center font-mono focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <input
                      type="text"
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'reps', e.target.value)}
                      className="w-16 px-2 py-1.5 rounded-lg text-slate-100 text-xs text-center font-mono focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                      className="p-1 rounded transition cursor-pointer text-slate-600 hover:text-[#FF4B2B]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddExercise(dayIdx)}
                  className="text-[11px] font-semibold flex items-center gap-1 pt-1 transition cursor-pointer"
                  style={{ color: '#4FD1C5' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  <Plus className="w-3 h-3" /> Add Exercise
                </button>
              </div>
            </div>
          ))}
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
            <span>Save & Assign Routine</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkoutBuilderModal;
