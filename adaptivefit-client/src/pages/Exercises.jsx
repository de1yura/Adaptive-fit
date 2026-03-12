import React, { useState, useEffect } from 'react';
import api from '../api';

const BUILT_IN_BY_GROUP = {
  'Chest': ['Bench Press', 'Incline Dumbbell Press', 'Decline Barbell Press', 'Cable Fly', 'Pec Deck', 'Push-ups', 'Wide Push-ups', 'Decline Push-ups', 'Dumbbell Fly'],
  'Back': ['Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Pull-ups', 'Single Arm Dumbbell Row', 'Deadlift', 'Inverted Row', 'Chest-Supported Row'],
  'Shoulders': ['Overhead Press', 'Arnold Press', 'Lateral Raises', 'Front Raises', 'Pike Push-ups', 'Dumbbell Shoulder Press', 'Dumbbell Lateral Raises'],
  'Rear Delts': ['Face Pulls', 'Rear Delt Fly'],
  'Biceps': ['Barbell Curl', 'Hammer Curls', 'Preacher Curl', 'Cable Curl', 'Chin-ups', 'Concentration Curl', 'Incline Dumbbell Curl', 'Dumbbell Curl'],
  'Triceps': ['Tricep Pushdowns', 'Skull Crushers', 'Close-Grip Bench Press', 'Tricep Dips', 'Diamond Push-ups', 'Chair Dips', 'Overhead Tricep Extension'],
  'Forearms': ['Wrist Curls', 'Reverse Wrist Curls', 'Farmer\'s Walk', 'Dead Hangs', 'Reverse Curls', 'Plate Pinch'],
  'Quads': ['Barbell Squat', 'Front Squat', 'Hack Squat', 'Leg Press', 'Leg Extension', 'Walking Lunges', 'Bulgarian Split Squat', 'Bodyweight Squat', 'Reverse Lunges'],
  'Hamstrings': ['Romanian Deadlift', 'Leg Curl', 'Sumo Deadlift', 'Nordic Curl'],
  'Glutes': ['Hip Thrust', 'Cable Kickback', 'Step-ups', 'Glute Bridge', 'Single-Leg Glute Bridge', 'Hip Thrust (bodyweight)'],
  'Calves': ['Calf Raises', 'Seated Calf Raises', 'Tibialis Raise'],
  'Abs': ['Crunches', 'Leg Raises', 'Cable Crunches', 'Ab Wheel Rollout', 'Hanging Knee Raises', 'Bicycle Crunches', 'Toe Touches'],
  'Core': ['Plank', 'Mountain Climbers', 'Dead Bug', 'Pallof Press', 'Side Plank', 'Russian Twists'],
  'Lower Back': ['Hyperextensions', 'Good Mornings', 'Superman Hold', 'Back Extensions'],
  'Traps': ['Barbell Shrugs', 'Dumbbell Shrugs', 'Cable Shrugs', 'Face Pulls', 'Upright Row'],
  'Neck': ['Neck Curls', 'Neck Extensions', 'Neck Side Raises'],
  'Cardio': ['Treadmill', 'Rowing Machine', 'Stair Climber', 'Assault Bike', 'Jump Rope', 'Box Jumps'],
  'Full Body': ['Deadlift', 'Burpees', 'Jump Squats', 'Kettlebell Swing', 'Clean & Press', 'Thrusters'],
};

const MUSCLE_GROUPS = Object.keys(BUILT_IN_BY_GROUP);

const ALL_EXERCISES_FLAT = [
  ...Object.entries(BUILT_IN_BY_GROUP).flatMap(([group, names]) =>
    names.map(name => ({ name, muscleGroup: group }))
  ),
];

// ─── My Splits Section ──────────────────────────────────────────────────────

function MySplitsSection({ templates, onSplitApplied }) {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', selectedTemplateIds: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/saved-splits').then(res => {
      setSplits(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleTemplate = (id) => {
    setForm(f => ({
      ...f,
      selectedTemplateIds: f.selectedTemplateIds.includes(id)
        ? f.selectedTemplateIds.filter(x => x !== id)
        : [...f.selectedTemplateIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Split name is required'); return; }
    if (form.selectedTemplateIds.length === 0) { setError('Select at least one day template'); return; }
    setSaving(true);
    setError('');
    try {
      const days = form.selectedTemplateIds.map((id, i) => {
        const t = templates.find(t => t.id === id);
        return { day: i + 1, title: t.name, splitType: 'custom', exercises: t.exercises };
      });
      const res = await api.post('/saved-splits', { name: form.name, days });
      setSplits(prev => [res.data, ...prev]);
      setForm({ name: '', selectedTemplateIds: [] });
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save split');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/saved-splits/${id}`);
      setSplits(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete split');
    }
  };

  if (loading) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title">My Splits</h2>
        {!creating && (
          <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
            + Create Split
          </button>
        )}
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Split</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Split Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. My PPL, Arnold Split"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>
                Pick Days from Templates
                {form.selectedTemplateIds.length > 0 && (
                  <span style={{ color: 'var(--accent)', marginLeft: '0.5rem', fontWeight: 400 }}>
                    ({form.selectedTemplateIds.length} selected)
                  </span>
                )}
              </label>
              {templates.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  No day templates yet. Create some in the Day Templates section below first.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {templates.map((t, i) => {
                    const selected = form.selectedTemplateIds.includes(t.id);
                    const order = form.selectedTemplateIds.indexOf(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTemplate(t.id)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          background: selected ? 'rgba(var(--accent-rgb, 99,102,241), 0.1)' : 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: selected ? 600 : 400 }}>{t.name}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            {t.exercises.length} exercises
                          </span>
                        </div>
                        {selected && (
                          <span style={{
                            background: 'var(--accent)', color: '#fff',
                            borderRadius: '999px', padding: '0.1rem 0.5rem',
                            fontSize: '0.75rem', fontWeight: 600,
                          }}>
                            Day {order + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving || templates.length === 0}>
                {saving ? 'Saving…' : 'Save Split'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => {
                setCreating(false); setError('');
                setForm({ name: '', selectedTemplateIds: [] });
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {splits.length === 0 && !creating ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No saved splits yet. Create one using your day templates.
        </p>
      ) : (
        <div>
          {splits.map(s => (
            <div key={s.id} className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {s.days.length} day{s.days.length !== 1 ? 's' : ''} · {s.days.map(d => d.title).join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.75rem' }}>
                  {onSplitApplied && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSplitApplied(s)}
                    >
                      Apply to Plan
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day Templates Section ───────────────────────────────────────────────────

function DayTemplatesSection({ customExercises, onTemplatesChange }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', selectedExercises: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/day-templates').then(res => {
      setTemplates(res.data);
      setLoading(false);
      if (onTemplatesChange) onTemplatesChange(res.data);
    }).catch(() => setLoading(false));
  }, []);

  const customOptions = (customExercises || []).map(e => ({ name: e.name, muscleGroup: e.muscleGroup, isCustom: true }));
  const allOptions = [...customOptions, ...ALL_EXERCISES_FLAT];

  const filteredExercises = allOptions.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExercise = (ex) => {
    setForm(f => {
      const exists = f.selectedExercises.find(e => e.name === ex.name);
      return {
        ...f,
        selectedExercises: exists
          ? f.selectedExercises.filter(e => e.name !== ex.name)
          : [...f.selectedExercises, { name: ex.name, muscleGroup: ex.muscleGroup, sets: 3, reps: 10 }],
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Day name is required'); return; }
    if (form.selectedExercises.length === 0) { setError('Add at least one exercise'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/day-templates', { name: form.name, exercises: form.selectedExercises });
      const updated = [res.data, ...templates];
      setTemplates(updated);
      if (onTemplatesChange) onTemplatesChange(updated);
      setForm({ name: '', selectedExercises: [] });
      setSearch('');
      setCreating(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/day-templates/${id}`);
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      if (onTemplatesChange) onTemplatesChange(updated);
    } catch {
      alert('Failed to delete template');
    }
  };

  if (loading) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title">Day Templates</h2>
        {!creating && (
          <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
            + Create Day Template
          </button>
        )}
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Day Template</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Day Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Chest Day, Sharms Day, Pull Day"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>
                Pick Exercises
                {form.selectedExercises.length > 0 && (
                  <span style={{ color: 'var(--accent)', marginLeft: '0.5rem', fontWeight: 400 }}>
                    ({form.selectedExercises.length} selected)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises…"
                style={{ marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                {filteredExercises.map(ex => {
                  const selected = !!form.selectedExercises.find(e => e.name === ex.name);
                  return (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => toggleExercise(ex)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent)' : 'transparent',
                        color: selected ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {ex.isCustom ? '★ ' : ''}{ex.name}
                    </button>
                  );
                })}
              </div>
            </div>
            {form.selectedExercises.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Selected:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {form.selectedExercises.map(ex => (
                    <span key={ex.name} style={{
                      background: 'var(--accent)', color: '#fff',
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem',
                    }}>
                      {ex.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Template'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => {
                setCreating(false); setError('');
                setForm({ name: '', selectedExercises: [] }); setSearch('');
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 && !creating ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No day templates yet. Create one to reuse days in your plan.
        </p>
      ) : (
        <div>
          {templates.map(t => (
            <div key={t.id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''} · {t.exercises.map(e => e.name).join(', ')}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Library Tab ─────────────────────────────────────────────────────────────

function LibraryTab({ customExercises }) {
  const [templates, setTemplates] = useState([]);

  // Group custom exercises by their muscle group(s) for display
  const customByGroup = {};
  (customExercises || []).forEach(ex => {
    const groups = ex.muscleGroup.split(',').map(g => g.trim());
    groups.forEach(g => {
      if (!customByGroup[g]) customByGroup[g] = [];
      customByGroup[g].push(ex.name);
    });
  });

  return (
    <div>
      <MySplitsSection templates={templates} />
      <DayTemplatesSection customExercises={customExercises} onTemplatesChange={setTemplates} />

      {/* Custom exercises */}
      {customExercises && customExercises.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>My Custom Exercises</h2>
          {Object.entries(customByGroup).map(([group, names]) => (
            <div key={group} className="card" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent)', fontSize: '1rem' }}>{group}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {names.map(name => (
                  <span key={name} style={{
                    background: 'rgba(var(--accent-rgb, 99,102,241), 0.15)',
                    border: '1px solid var(--accent)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    color: 'var(--accent)',
                  }}>
                    ★ {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Built-in exercise library */}
      <h2 className="section-title" style={{ marginBottom: '1rem' }}>Exercise Library</h2>
      {Object.entries(BUILT_IN_BY_GROUP).map(([group, exercises]) => (
        <div key={group} className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent)', fontSize: '1rem' }}>{group}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {exercises.map(ex => (
              <span key={ex} style={{
                background: 'var(--surface-2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
              }}>
                {ex}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── My Exercises Tab ─────────────────────────────────────────────────────────

function MyExercisesTab({ customExercises, onExerciseAdded, onExerciseDeleted, loading }) {
  const [form, setForm] = useState({ name: '', muscleGroups: [], equipment: 'gym' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.muscleGroups.length === 0) { setError('Name and at least one muscle group are required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/exercises/custom', { ...form, muscleGroup: form.muscleGroups.join(', ') });
      onExerciseAdded(res.data);
      setForm({ name: '', muscleGroups: [], equipment: 'gym' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exercise');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/exercises/custom/${id}`);
      onExerciseDeleted(id);
    } catch {
      alert('Failed to delete exercise');
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Custom Exercise</h3>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Exercise Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pull-ups, Sharms"
            />
          </div>
          <div className="form-group">
            <label>Muscle Groups <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(select all that apply)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {MUSCLE_GROUPS.map(g => {
                const selected = form.muscleGroups.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      muscleGroups: selected
                        ? f.muscleGroups.filter(x => x !== g)
                        : [...f.muscleGroups, g],
                    }))}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'var(--accent)' : 'transparent',
                      color: selected ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label>Equipment</label>
            <select value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}>
              <option value="gym">Full Gym</option>
              <option value="home">Home / Minimal</option>
              <option value="none">Bodyweight</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Creating…' : '+ Create Exercise'}
          </button>
        </form>
      </div>

      {customExercises.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No custom exercises yet. Create one above.</p>
      ) : (
        <div>
          {customExercises.map(ex => (
            <div key={ex.id} className="card" style={{
              marginBottom: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{ex.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {ex.muscleGroup} · {ex.equipment}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(ex.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day Editor ───────────────────────────────────────────────────────────────

function DayEditor({ day, dayIndex, allOptions, onUpdate, onRemoveDay }) {
  const [swapTarget, setSwapTarget] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(day.title);

  const handleSwap = (exIndex, newEx) => {
    onUpdate(dayIndex, {
      ...day,
      exercises: day.exercises.map((ex, ei) =>
        ei !== exIndex ? ex : { ...ex, name: newEx.name, muscleGroup: newEx.muscleGroup }
      ),
    });
    setSwapTarget(null);
  };

  const handleAddExercise = () => {
    const sets = day.exercises[0]?.sets || 3;
    const reps = day.exercises[0]?.reps || 10;
    const newIndex = day.exercises.length;
    onUpdate(dayIndex, {
      ...day,
      exercises: [...day.exercises, { name: 'Pick exercise…', muscleGroup: '', sets, reps }],
    });
    setSwapTarget(newIndex);
  };

  const handleRemoveExercise = (exIndex) => {
    onUpdate(dayIndex, {
      ...day,
      exercises: day.exercises.filter((_, ei) => ei !== exIndex),
    });
  };

  const handleSaveTitle = () => {
    onUpdate(dayIndex, { ...day, title: titleInput.trim() || day.title });
    setEditingTitle(false);
  };

  return (
    <div className="card" style={{ marginBottom: '1rem', border: '1.5px solid var(--accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        {editingTitle ? (
          <div style={{ display: 'flex', gap: '0.4rem', flex: 1, marginRight: '0.5rem' }}>
            <input
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSaveTitle}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingTitle(false)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Day {day.day} — {day.title}</span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}
              onClick={() => { setTitleInput(day.title); setEditingTitle(true); }}
            >
              Rename
            </button>
          </div>
        )}
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', color: 'var(--error, #e74c3c)' }}
          onClick={() => onRemoveDay(dayIndex)}
        >
          Remove Day
        </button>
      </div>

      {day.exercises.map((ex, ei) => (
        <div key={ei}>
          {swapTarget === ei ? (
            <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Choose exercise:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '130px', overflowY: 'auto' }}>
                {allOptions.map(ae => (
                  <button
                    key={ae.name}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                    onClick={() => handleSwap(ei, ae)}
                  >
                    {ae.isCustom ? '★ ' : ''}{ae.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setSwapTarget(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.4rem 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSwapTarget(ei)}>
                <span style={{ fontWeight: 500 }}>{ex.name}</span>
                {ex.muscleGroup && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{ex.muscleGroup}</span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>· {ex.sets}×{ex.reps} · tap to swap</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                onClick={() => handleRemoveExercise(ei)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        className="btn btn-secondary btn-sm"
        style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
        onClick={handleAddExercise}
      >
        + Add Exercise
      </button>
    </div>
  );
}

// ─── My Plan Tab ──────────────────────────────────────────────────────────────

function MyPlanTab({ customExercises }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pickerTemplates, setPickerTemplates] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [showSplitPicker, setShowSplitPicker] = useState(false);
  const [pickerSplits, setPickerSplits] = useState([]);
  const [splitsLoading, setSplitsLoading] = useState(false);

  useEffect(() => {
    api.get('/plans/current').then(res => {
      const planData = res.data;
      const workoutRoutine = planData.days.map(day => ({
        day: day.dayNumber,
        title: day.dayLabel || `Day ${day.dayNumber}`,
        splitType: day.focusArea || '',
        exercises: (day.exercises || []).map(ex => ({
          name: ex.exerciseName,
          muscleGroup: ex.notes || day.focusArea || '',
          sets: ex.sets,
          reps: typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps,
        })),
      }));
      setPlan(workoutRoutine);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const allOptions = [
    ...(customExercises || []).map(e => ({ name: e.name, muscleGroup: e.muscleGroup, isCustom: true })),
    ...ALL_EXERCISES_FLAT,
  ];

  const handleUpdate = (dayIndex, updatedDay) => {
    setPlan(prev => prev.map((d, i) => i === dayIndex ? updatedDay : d));
  };

  const handleRemoveDay = (dayIndex) => {
    setPlan(prev => prev.filter((_, i) => i !== dayIndex).map((d, i) => ({ ...d, day: i + 1 })));
    if (editingDay === dayIndex) setEditingDay(null);
  };

  const openTemplatePicker = async () => {
    setPickerLoading(true);
    setShowTemplatePicker(true);
    try {
      const res = await api.get('/day-templates');
      setPickerTemplates(res.data);
    } catch {
      alert('Failed to load templates');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleAddFromTemplate = (template) => {
    const newDay = {
      day: plan.length + 1,
      title: template.name,
      splitType: 'custom',
      exercises: template.exercises,
    };
    setPlan(prev => [...prev, newDay]);
    setShowTemplatePicker(false);
  };

  const openSplitPicker = async () => {
    setSplitsLoading(true);
    setShowSplitPicker(true);
    try {
      const res = await api.get('/saved-splits');
      setPickerSplits(res.data);
    } catch {
      alert('Failed to load splits');
    } finally {
      setSplitsLoading(false);
    }
  };

  const handleApplySplit = (split) => {
    const days = split.days.map((d, i) => ({ ...d, day: i + 1 }));
    setPlan(days);
    setEditingDay(null);
    setShowSplitPicker(false);
  };

  const handleAddBlankDay = () => {
    const newDay = {
      day: plan.length + 1,
      title: `Day ${plan.length + 1} — Custom`,
      splitType: 'custom',
      exercises: [],
    };
    setPlan(prev => [...prev, newDay]);
    setEditingDay(plan.length);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/plans/routine', { workoutRoutine: plan });
      setSaved(true);
      setEditingDay(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;
  if (!plan) return <p style={{ color: 'var(--text-secondary)' }}>No active plan found. Complete onboarding first.</p>;

  return (
    <div>
      {saved && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>Plan saved!</div>}

      {plan.map((day, di) => (
        <div key={di}>
          {editingDay === di ? (
            <DayEditor
              day={day}
              dayIndex={di}
              allOptions={allOptions}
              onUpdate={handleUpdate}
              onRemoveDay={(idx) => { handleRemoveDay(idx); }}
            />
          ) : (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Day {day.day} — {day.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                    {day.exercises.length > 0 && ` · ${day.exercises.map(e => e.name).join(', ')}`}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingDay(di)}>
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={openSplitPicker}>Apply Split</button>
        <button className="btn btn-secondary" onClick={openTemplatePicker}>+ Add from Template</button>
        <button className="btn btn-secondary" onClick={handleAddBlankDay}>+ Add Blank Day</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTemplatePicker(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add Day from Template</h3>
              <button className="modal-close" onClick={() => setShowTemplatePicker(false)}>✕</button>
            </div>
            <div className="modal-body">
              {pickerLoading && <div className="loading-state"><div className="spinner" /></div>}
              {!pickerLoading && pickerTemplates.length === 0 && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  No templates yet. Go to the Library tab and create a Day Template first.
                </p>
              )}
              {!pickerLoading && pickerTemplates.map(t => (
                <div
                  key={t.id}
                  className="card"
                  style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
                  onClick={() => handleAddFromTemplate(t)}
                >
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''} · {t.exercises.map(e => e.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTemplatePicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Split picker modal */}
      {showSplitPicker && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSplitPicker(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Apply Saved Split</h3>
              <button className="modal-close" onClick={() => setShowSplitPicker(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Applying a split will replace your current plan days.
              </p>
              {splitsLoading && <div className="loading-state"><div className="spinner" /></div>}
              {!splitsLoading && pickerSplits.length === 0 && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  No saved splits yet. Go to the Library tab and create a split first.
                </p>
              )}
              {!splitsLoading && pickerSplits.map(s => (
                <div
                  key={s.id}
                  className="card"
                  style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
                  onClick={() => handleApplySplit(s)}
                >
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {s.days.length} day{s.days.length !== 1 ? 's' : ''} · {s.days.map(d => d.title).join(', ')}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSplitPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

function Exercises() {
  const [tab, setTab] = useState('library');
  const [customExercises, setCustomExercises] = useState([]);
  const [customLoading, setCustomLoading] = useState(true);

  useEffect(() => {
    api.get('/exercises/custom').then(res => {
      setCustomExercises(res.data);
      setCustomLoading(false);
    }).catch(() => setCustomLoading(false));
  }, []);

  const handleExerciseAdded = (ex) => setCustomExercises(prev => [ex, ...prev]);
  const handleExerciseDeleted = (id) => setCustomExercises(prev => prev.filter(e => e.id !== id));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercises</h1>
          <p className="page-subtitle">Browse the library or manage your custom exercises</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${tab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('library')}
        >
          Library
        </button>
        <button
          className={`btn ${tab === 'mine' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('mine')}
        >
          My Exercises
        </button>
        <button
          className={`btn ${tab === 'plan' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('plan')}
        >
          My Plan
        </button>
      </div>
      {tab === 'library' && <LibraryTab customExercises={customExercises} />}
      {tab === 'mine' && (
        <MyExercisesTab
          customExercises={customExercises}
          onExerciseAdded={handleExerciseAdded}
          onExerciseDeleted={handleExerciseDeleted}
          loading={customLoading}
        />
      )}
      {tab === 'plan' && <MyPlanTab customExercises={customExercises} />}
    </>
  );
}

export default Exercises;
