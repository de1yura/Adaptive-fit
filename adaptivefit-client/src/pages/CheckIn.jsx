import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];

function CheckIn() {
  const [sessions, setSessions] = useState(3);
  const [maxSessions, setMaxSessions] = useState(7);
  const [difficulty, setDifficulty] = useState(3);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/onboarding/profile').then(res => {
      if (res.data.daysPerWeek) {
        setMaxSessions(res.data.daysPerWeek);
        setSessions(res.data.daysPerWeek);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/checkin/submit', {
        weekNumber: 1,
        sessionsCompleted: sessions,
        difficultyRating: difficulty,
        currentWeightKg: weight ? parseFloat(weight) : null,
      });
      setResult({
        adapted: res.data.changesApplied,
        reasons: res.data.adaptationDetails || [res.data.changeSummary],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="checkin-container">
        <div className="card checkin-result">
          <div className="checkin-result-icon">{result.adapted ? '🔄' : '✅'}</div>
          <h2 style={{ marginBottom: '0.5rem' }}>{result.adapted ? 'Plan Updated!' : 'Check-In Complete!'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {result.adapted ? 'Your plan has been adjusted based on your feedback.' : "No changes needed — you're on track!"}
          </p>
          {result.reasons?.length > 0 && (
            <>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                {result.adapted ? 'What changed' : 'Feedback'}
              </h3>
              <ul className="changes-list">{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </>
          )}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>View Updated Plan</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Check-In</h1>
          <p className="page-subtitle">Tell us how your week went — we'll adjust your plan if needed.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Workout Sessions</h3>
          <div className="form-group">
            <label>How many sessions did you complete? (target: {maxSessions})</label>
            <div className="slider-row">
              <input type="range" min="0" max={maxSessions} value={sessions} onChange={e => setSessions(parseInt(e.target.value))} />
              <span className="slider-value">{sessions}</span>
            </div>
            <div className="difficulty-labels"><span>0</span><span>{maxSessions}</span></div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Workout Difficulty</h3>
          <div className="form-group">
            <label>How hard did the workouts feel on average?</label>
            <div className="slider-row">
              <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} />
              <span className="slider-value">{difficulty}</span>
            </div>
            <div className="difficulty-labels"><span>Very Easy</span><span>Moderate</span><span>Very Hard</span></div>
            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{DIFFICULTY_LABELS[difficulty]}</p>
          </div>
        </div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Weight (Optional)</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Current weight (kg)</label>
            <input type="number" step="0.1" min="30" max="300" placeholder="e.g. 75.5" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
          {loading ? 'Processing…' : 'Submit Check-In'}
        </button>
      </form>
    </div>
  );
}

export default CheckIn;
