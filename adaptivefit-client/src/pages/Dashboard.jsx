import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { transformPlanResponse } from '../api';
import PlanBuilder from '../components/PlanBuilder';

function WorkoutModal({ day, onClose, onLogged }) {
  const [exerciseLogs, setExerciseLogs] = useState(
    day.exercises.map(ex => ({ ...ex, completedSets: ex.sets, weightKg: '' }))
  );
  const [loading, setLoading] = useState(false);

  const updateLog = (index, field, value) => {
    setExerciseLogs(logs => logs.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/workouts/complete', {
        dayId: day.id,
        exerciseLogs: exerciseLogs.map(l => ({
          exerciseId: l.id,
          actualSets: parseInt(l.completedSets) || l.sets,
          actualReps: String(l.reps),
          actualWeightKg: l.weightKg ? parseFloat(l.weightKg) : null,
        })),
      });
      onLogged(day.day - 1);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{day.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Optionally log your actual sets and weights below.
          </p>
          {exerciseLogs.map((ex, i) => (
            <div key={i} className="exercise-log-item">
              <div className="exercise-log-name">{ex.name}</div>
              <div className="exercise-log-target">{ex.sets} sets × {ex.reps} reps · {ex.muscleGroup}</div>
              <div className="exercise-log-inputs">
                <div className="form-group">
                  <label>Sets completed</label>
                  <input type="number" min="0" max={ex.sets + 2} value={ex.completedSets} onChange={e => updateLog(i, 'completedSets', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Weight (kg) optional</label>
                  <input type="number" step="0.5" min="0" placeholder="—" value={ex.weightKg} onChange={e => updateLog(i, 'weightKg', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : '✓ Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NutritionLogForm({ targets }) {
  const [form, setForm] = useState({ calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/nutrition/log', {
        logDate: new Date().toISOString().split('T')[0],
        caloriesConsumed: parseInt(form.calories) || 0,
        proteinG: parseFloat(form.protein) || 0,
        carbsG: parseFloat(form.carbs) || 0,
        fatsG: parseFloat(form.fats) || 0,
      });
      setSuccess(true);
      setForm({ calories: '', protein: '', carbs: '', fats: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>Nutrition logged!</div>}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Log today's intake — targets: {targets.calorieTarget} kcal · {targets.proteinTarget}g protein · {targets.carbsTarget}g carbs · {targets.fatsTarget}g fats
      </p>
      <div className="nutrition-inputs">
        <div className="form-group">
          <label>Calories</label>
          <input type="number" min="0" placeholder={targets.calorieTarget} value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Protein (g)</label>
          <input type="number" min="0" placeholder={targets.proteinTarget} value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Carbs (g)</label>
          <input type="number" min="0" placeholder={targets.carbsTarget} value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Fats (g)</label>
          <input type="number" min="0" placeholder={targets.fatsTarget} value={form.fats} onChange={e => setForm({ ...form, fats: e.target.value })} />
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" type="submit" disabled={loading || !form.calories}>
        {loading ? 'Saving…' : 'Log Intake'}
      </button>
    </form>
  );
}

function Dashboard() {
  const [plan, setPlan] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [completedDays, setCompletedDays] = useState(new Set());
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [planRes, nutritionRes, progressRes] = await Promise.all([
        api.get('/plans/current'),
        api.get('/nutrition/targets'),
        api.get('/progress/dashboard'),
      ]);

      const transformed = transformPlanResponse(planRes.data);
      if (transformed) {
        // Merge nutrition targets into the plan object
        const nutrition = nutritionRes.data;
        transformed.calorieTarget = nutrition.dailyCalories || 0;
        transformed.proteinTarget = nutrition.proteinG || 0;
        transformed.carbsTarget = nutrition.carbsG || 0;
        transformed.fatsTarget = nutrition.fatsG || 0;
      }
      setPlan(transformed);
      setDashboardData(progressRes.data);
    } catch (err) {
      if (err.response?.status === 404) navigate('/onboarding');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogged = (dayIndex) => setCompletedDays(prev => new Set([...prev, dayIndex]));

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading your plan…</p></div>;
  if (!plan) return null;

  const workoutsThisWeek = (dashboardData?.workoutsThisWeek || 0) + completedDays.size;
  const adherencePercentage = plan.workoutRoutine.length > 0
    ? Math.round((workoutsThisWeek / plan.workoutRoutine.length) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Plan</h1>
          <p className="page-subtitle">Version {plan.version} · Stay consistent, see results</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowPlanBuilder(true)}>Change Plan</button>
          <button className="btn btn-primary" onClick={() => navigate('/checkin')}>Weekly Check-In</button>
        </div>
      </div>

      {plan.adaptationReason && plan.version > 1 && (
        <div className="adaptation-notice">
          <strong>Plan updated: </strong>{plan.adaptationReason}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{plan.version}</div><div className="stat-label">Plan Version</div></div>
        <div className="stat-card"><div className="stat-value">{workoutsThisWeek}</div><div className="stat-label">Workouts This Week</div></div>
        <div className="stat-card"><div className="stat-value">{plan.workoutRoutine.length}</div><div className="stat-label">Sessions Per Week</div></div>
        <div className="stat-card">
          <div className="stat-value">{adherencePercentage}%</div>
          <div className="stat-label">Adherence This Week</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="section-header"><h2 className="section-title">Daily Nutrition Targets</h2></div>
        <div className="macros-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="macro-item calories"><div className="macro-value">{plan.calorieTarget}</div><div className="macro-unit">kcal</div><div className="macro-label">Calories</div></div>
          <div className="macro-item protein"><div className="macro-value">{plan.proteinTarget}</div><div className="macro-unit">g</div><div className="macro-label">Protein</div></div>
          <div className="macro-item carbs"><div className="macro-value">{plan.carbsTarget}</div><div className="macro-unit">g</div><div className="macro-label">Carbs</div></div>
          <div className="macro-item fats"><div className="macro-value">{plan.fatsTarget}</div><div className="macro-unit">g</div><div className="macro-label">Fats</div></div>
        </div>
        <div className="divider" />
        <NutritionLogForm targets={plan} />
      </div>

      <div className="section-header">
        <h2 className="section-title">Weekly Workout Routine</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{completedDays.size} / {plan.workoutRoutine.length} done this week</span>
      </div>
      <div className="workouts-grid">
        {plan.workoutRoutine.map((day, index) => {
          const isDone = completedDays.has(index);
          return (
            <div key={index} className={`card workout-card ${isDone ? 'completed' : ''}`}>
              <div className="workout-card-header">
                <div>
                  <span className="workout-day-badge">Day {day.day}</span>
                  <div className="workout-card-title">{day.title}</div>
                </div>
                {isDone && <span className="completed-badge">✓ Done</span>}
              </div>
              <ul className="exercise-list">
                {day.exercises.map((ex, i) => (
                  <li key={i} className="exercise-item">
                    <div><span className="exercise-name">{ex.name}</span><span className="muscle-tag">{ex.muscleGroup}</span></div>
                    <span className="exercise-detail">{ex.sets} × {ex.reps}</span>
                  </li>
                ))}
              </ul>
              <button className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%' }} onClick={() => setActiveModal(day)}>
                {isDone ? 'Log Again' : 'Mark Complete'}
              </button>
            </div>
          );
        })}
      </div>

      {activeModal && (
        <WorkoutModal day={activeModal} onClose={() => setActiveModal(null)} onLogged={handleLogged} />
      )}
      {showPlanBuilder && (
        <PlanBuilder onClose={() => setShowPlanBuilder(false)} onSaved={fetchData} />
      )}
    </>
  );
}

export default Dashboard;
