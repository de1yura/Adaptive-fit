import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { transformPlanResponse } from '../api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PlanHistory() {
  const [plans, setPlans] = useState([]);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/plans/history'),
      api.get('/nutrition/targets').catch(() => ({ data: null })),
    ]).then(([plansRes, nutritionRes]) => {
      const transformed = (plansRes.data || []).map(plan => {
        const t = transformPlanResponse(plan);
        if (!t) {
          return {
            id: plan.id,
            version: plan.version || 1,
            workoutRoutine: '[]',
            calorieTarget: 0,
            proteinTarget: 0,
            carbsTarget: 0,
            fatsTarget: 0,
            adaptationReason: plan.changeSummary || '',
            active: plan.status === 'ACTIVE',
            createdAt: plan.createdAt,
          };
        }
        return {
          ...t,
          workoutRoutine: JSON.stringify(t.workoutRoutine),
        };
      });
      setPlans(transformed);

      if (nutritionRes.data) {
        setNutritionTargets(nutritionRes.data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading history…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Plan History</h1>
          <p className="page-subtitle">{plans.length} version{plans.length !== 1 ? 's' : ''} of your plan</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>

      {plans.length === 0 && (
        <div className="empty-state"><span className="empty-icon">📋</span><p>No plan history yet.</p></div>
      )}

      <div className="history-list">
        {plans.map(plan => {
          let routine = [];
          try { routine = JSON.parse(plan.workoutRoutine); } catch {}

          // Use nutrition targets for the active plan, otherwise show 0
          const calories = plan.active && nutritionTargets ? (nutritionTargets.calorieTarget || nutritionTargets.calories || 0) : (plan.calorieTarget || 0);
          const protein = plan.active && nutritionTargets ? (nutritionTargets.proteinTarget || nutritionTargets.protein || 0) : (plan.proteinTarget || 0);

          return (
            <div key={plan.id} className={`card history-card ${plan.active ? 'active-plan' : ''}`}>
              {plan.active && <span className="active-badge">Active</span>}
              <div className="version-header">
                <span className="version-number">Version {plan.version}</span>
                <span className="version-date">{formatDate(plan.createdAt)}</span>
              </div>
              <div className="plan-meta">
                {calories > 0 && <span>🔥 {calories} kcal/day</span>}
                {protein > 0 && <span>💪 {protein}g protein</span>}
                <span>🏋️ {routine.length} session{routine.length !== 1 ? 's' : ''}/week</span>
              </div>
              {plan.adaptationReason && plan.version > 1 && (
                <div className="adaptation-box"><strong style={{ color: 'var(--accent)' }}>What changed: </strong>{plan.adaptationReason}</div>
              )}
              {plan.version === 1 && (
                <div className="adaptation-box" style={{ borderColor: 'var(--success)' }}>
                  <strong style={{ color: 'var(--success)' }}>Initial plan</strong> — generated from your onboarding profile.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PlanHistory;
