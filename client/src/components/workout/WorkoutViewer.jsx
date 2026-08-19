import React, { useState } from 'react';
import { Dumbbell, CheckCircle2, Circle, Clock, Flame, Info, Sparkles, ChevronRight, Award } from 'lucide-react';

function Corners({ color = "border-[#C9A15A]" }) {
  return (
    <>
      <span className={`absolute -top-px -left-px w-3 h-3 border-t border-l ${color}`} />
      <span className={`absolute -top-px -right-px w-3 h-3 border-t border-r ${color}`} />
      <span className={`absolute -bottom-px -left-px w-3 h-3 border-b border-l ${color}`} />
      <span className={`absolute -bottom-px -right-px w-3 h-3 border-b border-r ${color}`} />
    </>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#C9A15A]">
      <span className="w-3.5 h-px bg-[#C9A15A] inline-block" />
      {children}
    </span>
  );
}

const WorkoutViewer = ({ plan, isInteractive = true }) => {
  const [activeDay, setActiveDay] = useState('Monday');
  const [completedExercises, setCompletedExercises] = useState({});

  if (!plan || !plan.schedule || plan.schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 relative bg-[#18170F]/40">
        <Corners color="border-white/15" />
        <div className="w-14 h-14 border border-white/15 flex items-center justify-center mb-6 bg-[#131210]">
          <Dumbbell size={22} className="text-white/25" />
        </div>
        <h3 className="font-display text-xl text-slate-100">No Workout Plan Assigned</h3>
        <p className="text-[#A79E8E] text-sm max-w-sm mt-2.5 leading-relaxed">
          Your trainer has not published a routine yet. Check back soon or request a custom split!
        </p>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentRoutine = plan.schedule.find((s) => s.day === activeDay) || plan.schedule[0];

  const toggleExercise = (idx) => {
    if (!isInteractive) return;
    const key = `${activeDay}-${idx}`;
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const totalExercisesForDay = currentRoutine.exercises?.length || 0;
  const completedCount = currentRoutine.exercises?.filter((_, idx) => completedExercises[`${activeDay}-${idx}`]).length || 0;
  const progressPercent = totalExercisesForDay > 0 ? Math.round((completedCount / totalExercisesForDay) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Plan Header Banner */}
      <div className="relative border border-[#FF4B2B]/30 p-6 md:p-7 bg-[#18170F]/60 overflow-hidden">
        <Corners color="border-[#FF4B2B]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-[10.5px] uppercase tracking-wide text-[#C9A15A] border border-[#C9A15A]/30 px-2 py-0.5 bg-[#131210]">
                {plan.goal}
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-wide text-[#4FD1C5] border border-[#4FD1C5]/30 px-2 py-0.5 bg-[#131210]">
                {plan.difficulty}
              </span>
            </div>
            <h3 className="font-display text-2xl text-slate-100 leading-snug">{plan.title}</h3>
            {plan.description && (
              <p className="text-[#A79E8E] text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                {plan.description}
              </p>
            )}
          </div>

          {plan.trainer && (
            <div className="flex items-center gap-3 p-3 border border-white/10 bg-[#131210] shrink-0">
              <div className="w-9 h-9 rounded-full border border-[#C9A15A]/40 bg-[#1D1B16] flex items-center justify-center font-display text-[#C9A15A] text-sm">
                {plan.trainer.name?.charAt(0) || 'C'}
              </div>
              <div className="text-left">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6E6858]">Assigned Coach</p>
                <p className="text-xs font-medium text-slate-200">{plan.trainer.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {daysOfWeek.map((day) => {
          const hasDay = plan.schedule.some((s) => s.day === day);
          const isSelected = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wide whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'border-[#C9A15A] text-[#C9A15A] bg-[#C9A15A]/[0.08] shadow-[0_0_20px_-8px_rgba(201,161,90,0.6)] font-bold'
                  : hasDay
                  ? 'border-white/10 text-[#A79E8E] hover:text-[#F5F1E8] hover:bg-white/[0.02]'
                  : 'border-transparent text-[#6E6858] hover:text-[#A79E8E]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Current Day Schedule Routine */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Eyebrow>Daily Target</Eyebrow>
            <h4 className="font-display text-xl text-slate-100 flex items-center gap-2 mt-1">
              <span>{currentRoutine.title || 'Workout Routine'}</span>
              <span className="text-xs font-mono text-[#4FD1C5]">
                // {currentRoutine.focusArea}
              </span>
            </h4>
          </div>

          {isInteractive && totalExercisesForDay > 0 && (
            <div className="flex items-center gap-3 border border-white/10 px-3.5 py-2 bg-[#18170F]">
              <div className="text-right">
                <p className="font-mono text-[11px] text-[#A79E8E]">
                  <span className="text-[#6FBE8C] font-bold">{completedCount}</span> / {totalExercisesForDay} Completed
                </p>
              </div>
              <div className="w-24 h-1.5 bg-[#131210] border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4FD1C5] to-[#6FBE8C] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Exercises List */}
        {!currentRoutine.exercises || currentRoutine.exercises.length === 0 ? (
          <div className="p-8 border border-white/10 bg-[#18170F]/50 text-center text-xs font-mono text-[#A79E8E] relative">
            <Corners color="border-white/15" />
            Scheduled rest or active recovery day. Rest well and hydrate! 💧
          </div>
        ) : (
          <div className="space-y-3">
            {currentRoutine.exercises.map((ex, idx) => {
              const isChecked = completedExercises[`${activeDay}-${idx}`];
              return (
                <div
                  key={idx}
                  onClick={() => toggleExercise(idx)}
                  className={`p-4 sm:p-5 border transition-all duration-200 flex items-start gap-4 relative ${
                    isInteractive ? 'cursor-pointer' : ''
                  } ${
                    isChecked
                      ? 'bg-[#131210]/60 border-[#6FBE8C]/40 text-slate-400 opacity-80'
                      : 'bg-[#18170F]/70 border-white/10 hover:border-[#C9A15A]/40 text-slate-200 hover:-translate-y-0.5'
                  }`}
                >
                  <Corners color={isChecked ? "border-[#6FBE8C]/50" : "border-white/15"} />

                  {isInteractive && (
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-[#6FBE8C] transition cursor-pointer shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle2 size={18} className="text-[#6FBE8C]" />
                      ) : (
                        <Circle size={18} className="text-[#6E6858]" />
                      )}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-tight ${
                          isChecked ? 'line-through text-[#6E6858]' : 'text-slate-100 font-display'
                        }`}
                      >
                        {ex.name}
                      </p>
                      <span className="font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 text-[#4FD1C5] border border-[#4FD1C5]/30 bg-[#131210]">
                        {ex.targetMuscle}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-xs font-mono text-[#A79E8E]">
                      <span className="flex items-center gap-1">
                        <strong className="text-[#F5F1E8] font-bold">{ex.sets}</strong> Sets
                      </span>
                      <span className="text-[#6E6858]">•</span>
                      <span className="flex items-center gap-1">
                        <strong className="text-[#F5F1E8] font-bold">{ex.reps}</strong> Reps
                      </span>
                      <span className="text-[#6E6858]">•</span>
                      <span className="flex items-center gap-1.5 text-[#C9A15A]">
                        <Clock size={12} /> {ex.restSeconds}s Rest
                      </span>
                    </div>

                    {ex.instructions && (
                      <p className="text-xs text-[#A79E8E] mt-2 italic border-l-2 border-[#C9A15A]/40 pl-2.5">
                        "{ex.instructions}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutViewer;
