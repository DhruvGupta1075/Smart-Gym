import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useGym } from '../../context/GymContext';
import { Plus, Trash2, Apple, Save, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';

/* ── Shared inline styles ── */
const inputStyle = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(74,69,80,0.4)',
  color: '#E2E8F0',
};

const NutritionBuilderModal = ({ isOpen, onClose, initialData = null, onSuccess, memberList = [] }) => {
  const { showToast } = useGym();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    goal: 'Lean Bulk / Muscle Gain',
    targetCalories: 2600,
    targetMacros: {
      proteinGrams: 180,
      carbsGrams: 280,
      fatsGrams: 70,
    },
    waterLitersPerDay: 3.5,
    member: '',
    isTemplate: false,
    meals: [
      {
        mealType: 'Breakfast',
        time: '08:00 AM',
        notes: 'High protein morning kickstart',
        items: [{ name: 'Oatmeal & Whey Protein with Banana', portion: '1 bowl', calories: 450, protein: 32, carbs: 60, fats: 8 }],
      },
      {
        mealType: 'Lunch',
        time: '01:00 PM',
        notes: 'Clean fuel',
        items: [{ name: 'Grilled Chicken, Brown Rice & Broccoli', portion: '1 plate (200g meat)', calories: 550, protein: 55, carbs: 65, fats: 7 }],
      },
      {
        mealType: 'Post-Workout / Dinner',
        time: '07:30 PM',
        notes: 'Anabolic recovery',
        items: [{ name: 'Salmon Fillet with Sweet Potato', portion: '200g fish + 200g potato', calories: 520, protein: 44, carbs: 45, fats: 16 }],
      },
    ],
    guidelines: [
      'Drink 500ml water immediately upon waking',
      'Space protein intake every 3-4 hours',
      'Avoid high-sugar snacks after 8:00 PM',
    ],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        goal: initialData.goal || 'Lean Bulk / Muscle Gain',
        targetCalories: initialData.targetCalories || 2400,
        targetMacros: initialData.targetMacros || { proteinGrams: 160, carbsGrams: 250, fatsGrams: 65 },
        waterLitersPerDay: initialData.waterLitersPerDay || 3.5,
        member: initialData.member?._id || initialData.member || '',
        isTemplate: !!initialData.isTemplate,
        meals: initialData.meals && initialData.meals.length > 0 ? initialData.meals : formData.meals,
        guidelines: initialData.guidelines || formData.guidelines,
      });
    }
  }, [initialData]);

  const handleAddMeal = () => {
    setFormData({
      ...formData,
      meals: [
        ...formData.meals,
        {
          mealType: 'Pre-Workout',
          time: '04:30 PM',
          notes: '',
          items: [{ name: 'Rice cakes with honey & almonds', portion: '1 serving', calories: 200, protein: 5, carbs: 35, fats: 5 }],
        },
      ],
    });
  };

  const handleRemoveMeal = (index) => {
    const updated = [...formData.meals];
    updated.splice(index, 1);
    setFormData({ ...formData, meals: updated });
  };

  const handleAddItemToMeal = (mealIndex) => {
    const updated = [...formData.meals];
    updated[mealIndex].items.push({
      name: '',
      portion: '1 serving',
      calories: 100,
      protein: 10,
      carbs: 10,
      fats: 2,
    });
    setFormData({ ...formData, meals: updated });
  };

  const handleRemoveItemFromMeal = (mealIndex, itemIndex) => {
    const updated = [...formData.meals];
    updated[mealIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, meals: updated });
  };

  const handleItemChange = (mealIndex, itemIndex, field, value) => {
    const updated = [...formData.meals];
    updated[mealIndex].items[itemIndex][field] = value;
    setFormData({ ...formData, meals: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Please enter a nutrition plan title', 'error');
      return;
    }

    setLoading(true);
    try {
      if (initialData?._id) {
        await api.put(`/api/trainer/nutrition-plans/${initialData._id}`, formData);
        showToast('Nutrition plan updated successfully!', 'success');
      } else {
        await api.post('/api/trainer/nutrition-plans', formData);
        showToast('Nutrition plan assigned!', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save nutrition plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Nutrition Plan' : 'Build Custom Nutrition & Macro Plan'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Plan Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2600 kcal Clean Lean Bulk Strategy"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Goal Focus</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            >
              <option value="Lean Bulk / Muscle Gain">Lean Bulk / Muscle Gain</option>
              <option value="Caloric Deficit / Fat Shred">Caloric Deficit / Fat Shred</option>
              <option value="Maintenance & Energy">Maintenance & Energy</option>
              <option value="Keto / Low Carb">Keto / Low Carb</option>
              <option value="Athletic Performance">Athletic Performance</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Target Calories (kcal)</label>
            <input
              type="number"
              value={formData.targetCalories}
              onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition font-mono"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'rgba(201,161,90,0.9)' }}>Daily Water (Liters)</label>
            <input
              type="number"
              step="0.1"
              value={formData.waterLitersPerDay}
              onChange={(e) => setFormData({ ...formData, waterLitersPerDay: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition font-mono"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
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
        </div>

        {/* Macro split breakdown */}
        <div
          className="p-4 rounded-xl space-y-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: '#C9A15A' }}>
            Target Daily Macro Splits (Grams)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold font-mono" style={{ color: '#4FD1C5' }}>Protein (g)</label>
              <input
                type="number"
                value={formData.targetMacros.proteinGrams}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetMacros: { ...formData.targetMacros, proteinGrams: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none transition mt-1"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(79,209,197,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold font-mono" style={{ color: '#C9A15A' }}>Carbs (g)</label>
              <input
                type="number"
                value={formData.targetMacros.carbsGrams}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetMacros: { ...formData.targetMacros, carbsGrams: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none transition mt-1"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold font-mono" style={{ color: '#6FBE8C' }}>Fats (g)</label>
              <input
                type="number"
                value={formData.targetMacros.fatsGrams}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetMacros: { ...formData.targetMacros, fatsGrams: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none transition mt-1"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(111,190,140,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
              />
            </div>
          </div>
        </div>

        {/* Meals builder */}
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: '#6FBE8C' }}>
              Meals Schedule ({formData.meals.length} Meals)
            </h4>
            <button
              type="button"
              onClick={handleAddMeal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              style={{ background: 'rgba(111,190,140,0.12)', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(111,190,140,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(111,190,140,0.12)'}
            >
              <Plus className="w-3.5 h-3.5" /> Add Meal
            </button>
          </div>

          {formData.meals.map((meal, mIdx) => (
            <div
              key={mIdx}
              className="p-4 rounded-xl space-y-3 relative"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={meal.mealType}
                    onChange={(e) => {
                      const updated = [...formData.meals];
                      updated[mIdx].mealType = e.target.value;
                      setFormData({ ...formData, meals: updated });
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition focus:outline-none"
                    style={{ background: '#131210', border: '1px solid rgba(111,190,140,0.3)', color: '#6FBE8C' }}
                  >
                    {['Breakfast', 'Morning Snack', 'Lunch', 'Pre-Workout', 'Post-Workout / Dinner', 'Evening Snack'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Time (e.g. 08:30 AM)"
                    value={meal.time}
                    onChange={(e) => {
                      const updated = [...formData.meals];
                      updated[mIdx].time = e.target.value;
                      setFormData({ ...formData, meals: updated });
                    }}
                    className="w-36 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none transition font-mono"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMeal(mIdx)}
                  className="p-1.5 rounded-lg transition cursor-pointer"
                  style={{ background: 'rgba(74,69,80,0.2)', border: '1px solid rgba(255,255,255,0.06)', color: '#6B7280' }}
                  title="Remove Meal"
                  onMouseEnter={e => { e.currentTarget.style.color = '#FF4B2B'; e.currentTarget.style.background = 'rgba(255,75,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,43,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'rgba(74,69,80,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Items in Meal */}
              <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid rgba(111,190,140,0.3)' }}>
                {meal.items.map((item, itIdx) => (
                  <div key={itIdx} className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Food Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(mIdx, itIdx, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-slate-100 text-xs focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <input
                      type="text"
                      placeholder="Portion"
                      value={item.portion}
                      onChange={(e) => handleItemChange(mIdx, itIdx, 'portion', e.target.value)}
                      className="w-28 px-2.5 py-1.5 rounded-lg text-slate-100 text-xs focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <input
                      type="number"
                      placeholder="kcal"
                      value={item.calories}
                      onChange={(e) => handleItemChange(mIdx, itIdx, 'calories', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg text-slate-100 text-xs text-center font-mono focus:outline-none transition"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,161,90,0.4)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(74,69,80,0.4)'}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItemFromMeal(mIdx, itIdx)}
                      className="p-1 rounded transition cursor-pointer text-slate-600 hover:text-[#FF4B2B]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddItemToMeal(mIdx)}
                  className="text-[11px] font-semibold flex items-center gap-1 pt-1 transition cursor-pointer"
                  style={{ color: '#6FBE8C' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  <Plus className="w-3 h-3" /> Add Food Item
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
            <span>Save & Assign Nutrition Plan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NutritionBuilderModal;
