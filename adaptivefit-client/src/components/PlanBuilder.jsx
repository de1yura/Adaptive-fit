import React, { useState, useEffect } from 'react';
import api, { mapEnumToEquipment, mapEnumToGoal } from '../api';

const COMMON_EXERCISES = [
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { name: 'Cable Fly', muscleGroup: 'Chest' },
  { name: 'Push-ups', muscleGroup: 'Chest' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Pull-ups', muscleGroup: 'Back' },
  { name: 'Deadlift', muscleGroup: 'Full Body' },
  { name: 'Barbell Squat', muscleGroup: 'Quads' },
  { name: 'Leg Press', muscleGroup: 'Quads' },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings' },
  { name: 'Leg Curl', muscleGroup: 'Hamstrings' },
  { name: 'Hip Thrust', muscleGroup: 'Glutes' },
  { name: 'Walking Lunges', muscleGroup: 'Quads' },
  { name: 'Calf Raises', muscleGroup: 'Calves' },
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curls', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Tricep Pushdowns', muscleGroup: 'Triceps' },
  { name: 'Skull Crushers', muscleGroup: 'Triceps' },
  { name: 'Face Pulls', muscleGroup: 'Rear Delts' },
];

function PlanBuilder({ onClose, onSaved }) {
  const [step, setStep] = useState('presets');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [draftPlan, setDraftPlan] = useState(null);
  const [swapTarget, setSwapTarget] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/plans/presets'),
      api.get('/exercises/custom'),
    ]).then(([presetsRes, customRes]) => {
      setPresets(presetsRes.data);
      const custom = customRes.data.map(e => ({ name: e.name, muscleGroup: e.muscleGroup, isCustom: true }));
      setAllExercises([...custom, ...COMMON_EXERCISES]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelectPreset = async (preset) => {
    setSelectedPreset(preset);
    setGenerating(true);
    setError('');
    try {
      const meRes = await api.get('/onboarding/profile');
      const res = await api.post('/plans/from-preset', {
        presetKey: preset.key,
        equipment: mapEnumToEquipment(meRes.data.equipmentAccess) || 'gym',
        goal: mapEnumToGoal(meRes.data.fitnessGoal) || 'general fitness',
      });
      setDraftPlan(res.data.workoutRoutine);
      setStep('editor');
    } catch {
      setError('Failed to generate preset. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSwapExercise = (dayIndex, exIndex, newExercise) => {
    setDraftPlan(prev => prev.map((day, di) => {
      if (di !== dayIndex) return day;
      return {
        ...day,
        exercises: day.exercises.map((ex, ei) =>
          ei !== exIndex ? ex : { ...ex, name: newExercise.name, muscleGroup: newExercise.muscleGroup }
        ),
      };
    }));
    setSwapTarget(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch('/plans/routine', { workoutRoutine: draftPlan });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save plan. Try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Plan Builder{selectedPreset ? ` — ${selectedPreset.name}` : ''}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {(loading || generating) && (
            <div className="loading-state">
              <div className="spinner" />
              <p>{generating ? 'Generating plan…' : 'Loading…'}</p>
            </div>
          )}

          {!loading && !generating && step === 'presets' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Choose a preset split. You can swap out any exercise before saving.
              </p>
              {presets.map(preset => (
                <div
                  key={preset.key}
                  className="card"
                  style={{ marginBottom: '0.75rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{preset.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {preset.description} · {preset.days} days/week
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !generating && step === 'editor' && draftPlan && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Tap any exercise to swap it with another. Save when ready.
              </p>
              {draftPlan.map((day, di) => (
                <div key={di} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Day {day.day} — {day.title}
                  </div>
                  {day.exercises.map((ex, ei) => (
                    <div key={ei}>
                      {swapTarget?.dayIndex === di && swapTarget?.exIndex === ei ? (
                        <div style={{
                          background: 'var(--surface-2)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.25rem',
                        }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Choose replacement for <strong>{ex.name}</strong>:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '130px', overflowY: 'auto' }}>
                            {allExercises.map(ae => (
                              <button
                                key={ae.name}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                                onClick={() => handleSwapExercise(di, ei, ae)}
                              >
                                {ae.isCustom ? '★ ' : ''}{ae.name}
                              </button>
                            ))}
                          </div>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '0.5rem' }}
                            onClick={() => setSwapTarget(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.4rem 0',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSwapTarget({ dayIndex: di, exIndex: ei })}
                        >
                          <div>
                            <span style={{ fontWeight: 500 }}>{ex.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                              {ex.muscleGroup}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ex.sets}×{ex.reps} · swap
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={step === 'editor' ? () => { setStep('presets'); setDraftPlan(null); setSelectedPreset(null); } : onClose}
          >
            {step === 'editor' ? '← Back' : 'Cancel'}
          </button>
          {step === 'editor' && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanBuilder;
