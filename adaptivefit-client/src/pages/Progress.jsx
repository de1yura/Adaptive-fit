import React, { useEffect, useState } from 'react';
import api from '../api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Progress() {
  const [dashboard, setDashboard] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [plan, setPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/progress/dashboard'),
      api.get('/checkin/history'),
      api.get('/plans/current'),
      api.get('/onboarding/profile'),
      api.get('/progress/export'),
    ]).then(([dashRes, cisRes, planRes, profileRes, exportRes]) => {
      setDashboard(dashRes.data);
      setCheckIns(cisRes.data || []);

      // Transform plan response: days array to workoutRoutine format
      if (planRes.data && planRes.data.days) {
        const workoutRoutine = planRes.data.days.map(day => ({
          day: day.dayNumber,
          title: day.dayLabel || `Day ${day.dayNumber}`,
          splitType: day.focusArea || '',
          exercises: (day.exercises || []).map(ex => ({
            id: ex.id,
            name: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            muscleGroup: ex.notes || day.focusArea || '',
            restSeconds: ex.restSeconds,
          })),
        }));
        setPlan({ ...planRes.data, workoutRoutine });
      } else {
        setPlan(planRes.data);
      }

      setProfile(profileRes.data);
      setExportData(exportRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading progress…</p></div>;

  const daysAvailable = profile?.daysPerWeek || plan?.workoutRoutine?.length || 3;

  // Build weekly adherence data from export data if available, otherwise fall back to dashboard
  const weeklyData = (() => {
    if (exportData?.weeklyAdherence && exportData.weeklyAdherence.length > 0) {
      // Use the last 4 weeks from the export data
      const recent = exportData.weeklyAdherence.slice(-4);
      return recent.map((entry, i) => {
        const planned = entry.planned || daysAvailable;
        const logged = entry.completed || 0;
        const pct = planned > 0 ? Math.min(100, Math.round((logged / planned) * 100)) : 0;
        const isLast = i === recent.length - 1;
        const label = isLast ? 'This week' : i === recent.length - 2 ? 'Last week' : `Week ${entry.week}`;
        return { logged, pct, label, planned };
      });
    }

    // Fallback: generate from dashboard data
    const thisWeek = dashboard?.workoutsThisWeek || 0;
    return [{
      logged: thisWeek,
      pct: daysAvailable > 0 ? Math.min(100, Math.round((thisWeek / daysAvailable) * 100)) : 0,
      label: 'This week',
      planned: daysAvailable,
    }];
  })();

  const weightData = checkIns
    .filter(c => c.currentWeightKg || c.weightInput)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const avgAdherence = (() => {
    if (dashboard?.adherencePercentage != null) {
      return Math.round(dashboard.adherencePercentage);
    }
    if (weeklyData.length) {
      return Math.round(weeklyData.reduce((s, w) => s + w.pct, 0) / weeklyData.length);
    }
    return 0;
  })();

  const totalWorkouts = dashboard?.totalWorkoutsCompleted || 0;

  const getBarClass = (pct) => pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger';

  const downloadExport = () => {
    api.get('/progress/export').then(res => {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'adaptivefit-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(err => console.error(err));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Track your consistency and results over time</p>
        </div>
        <button className="btn btn-secondary" onClick={downloadExport}>Export Data ↓</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{totalWorkouts}</div><div className="stat-label">Total Workouts</div></div>
        <div className="stat-card"><div className="stat-value">{checkIns.length}</div><div className="stat-label">Check-Ins Done</div></div>
        <div className="stat-card"><div className="stat-value">{dashboard?.currentPlanVersion || plan?.version || 1}</div><div className="stat-label">Plan Version</div></div>
        <div className="stat-card"><div className="stat-value">{avgAdherence}%</div><div className="stat-label">Avg Adherence</div></div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title">Weekly Adherence</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target: {daysAvailable} sessions/week</span>
        </div>
        {weeklyData.map((week, i) => (
          <div key={i} className="week-row">
            <span className="week-label">{week.label}</span>
            <div className="week-bar">
              <div className="progress-bar-container">
                <div className={`progress-bar ${getBarClass(week.pct)}`} style={{ width: `${week.pct}%` }} />
              </div>
            </div>
            <span className="week-pct" style={{ color: week.pct >= 80 ? 'var(--success)' : week.pct >= 50 ? 'var(--warning)' : 'var(--error)' }}>
              {week.logged}/{week.planned || daysAvailable}
            </span>
          </div>
        ))}
      </div>

      {weightData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 className="section-title">Weight Trend</h2>
          </div>
          {weightData.map((entry, i) => {
            const weightValue = entry.currentWeightKg || entry.weightInput;
            const prevWeightValue = i > 0 ? (weightData[i - 1].currentWeightKg || weightData[i - 1].weightInput) : null;
            const change = prevWeightValue != null ? weightValue - prevWeightValue : 0;
            const changeClass = change < 0 ? 'down' : change > 0 ? 'up' : 'same';
            const changeSymbol = change < 0 ? '↓' : change > 0 ? '↑' : '→';
            return (
              <div key={entry.id} className="weight-entry">
                <span style={{ color: 'var(--text-secondary)' }}>{formatDate(entry.createdAt)}</span>
                <span style={{ fontWeight: 600 }}>{weightValue} kg</span>
                {i > 0 ? (
                  <span className={`weight-change ${changeClass}`}>{changeSymbol} {Math.abs(change).toFixed(1)} kg</span>
                ) : (
                  <span className="weight-change same">Starting weight</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {checkIns.length > 0 && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 className="section-title">Recent Check-Ins</h2>
          </div>
          {checkIns.slice(0, 5).map((ci, i) => {
            const ciWeight = ci.currentWeightKg || ci.weightInput;
            return (
              <div key={ci.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < Math.min(4, checkIns.length - 1) ? '1px solid var(--border)' : 'none', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{formatDate(ci.createdAt)}</span>
                <span>{ci.sessionsCompleted} sessions · Difficulty {ci.difficultyRating}/5</span>
                {ciWeight && <span style={{ color: 'var(--text-secondary)' }}>{ciWeight} kg</span>}
              </div>
            );
          })}
        </div>
      )}

      {checkIns.length === 0 && totalWorkouts === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>No data yet — complete your first workout and weekly check-in to see progress here.</p>
        </div>
      )}
    </>
  );
}

export default Progress;
