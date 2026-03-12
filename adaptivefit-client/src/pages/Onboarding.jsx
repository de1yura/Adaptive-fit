import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mapGoalToEnum, mapExperienceToEnum, mapEquipmentToEnum, mapDietToEnum } from '../api';

const TOTAL_STEPS = 4;

const GOALS = [
  { value: 'fat loss', icon: '🔥', label: 'Fat Loss', desc: 'Lose weight & burn fat' },
  { value: 'muscle gain', icon: '💪', label: 'Muscle Gain', desc: 'Build strength & size' },
  { value: 'general fitness', icon: '⚡', label: 'General Fitness', desc: 'Improve overall health' },
];

const EXPERIENCE = [
  { value: 'beginner', icon: '🌱', label: 'Beginner', desc: 'Less than 1 year' },
  { value: 'intermediate', icon: '📈', label: 'Intermediate', desc: '1–3 years' },
  { value: 'advanced', icon: '🏆', label: 'Advanced', desc: '3+ years' },
];

const EQUIPMENT = [
  { value: 'gym', icon: '🏋️', label: 'Full Gym', desc: 'Barbells, machines' },
  { value: 'home', icon: '🏠', label: 'Home / Minimal', desc: 'Dumbbells, bands' },
  { value: 'none', icon: '🤸', label: 'Bodyweight', desc: 'No equipment' },
];

const DIET = [
  { value: 'none', icon: '🍽️', label: 'No Preference', desc: 'Eat anything' },
  { value: 'vegetarian', icon: '🥗', label: 'Vegetarian', desc: 'No meat' },
  { value: 'vegan', icon: '🌿', label: 'Vegan', desc: 'Plant-based only' },
  { value: 'high-protein', icon: '🥩', label: 'High Protein', desc: 'Protein first' },
];

function OptionCard({ option, selected, onSelect }) {
  return (
    <div className={`option-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(option.value)}>
      <span className="option-icon">{option.icon}</span>
      <span className="option-label">{option.label}</span>
      {option.desc && <span className="option-desc">{option.desc}</span>}
    </div>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="step-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`step-dot ${i < current - 1 ? 'done' : i === current - 1 ? 'active' : ''}`} />
      ))}
    </div>
  );
}

function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    goal: 'fat loss',
    experienceLevel: 'beginner',
    daysAvailable: '3',
    sessionDuration: '45',
    equipment: 'gym',
    dietaryPreference: 'none',
    height: '',
    weight: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/plans/current').then(() => navigate('/dashboard')).catch(() => {});
  }, [navigate]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const next = () => { setError(''); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (!form.height || !form.weight || !form.age) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const transformedForm = {
        fitnessGoal: mapGoalToEnum(form.goal),
        experienceLevel: mapExperienceToEnum(form.experienceLevel),
        daysPerWeek: parseInt(form.daysAvailable),
        sessionDurationMinutes: parseInt(form.sessionDuration),
        equipmentAccess: mapEquipmentToEnum(form.equipment),
        dietaryPreference: mapDietToEnum(form.dietaryPreference),
        heightCm: parseFloat(form.height),
        weightKg: parseFloat(form.weight),
        age: parseInt(form.age),
        goalDurationWeeks: 12,
      };
      await api.post('/onboarding/submit', transformedForm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <StepIndicator current={step} total={TOTAL_STEPS} />
        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 && (
          <>
            <h2 className="onboarding-title">What's your goal?</h2>
            <p className="onboarding-subtitle">We'll build your plan around this.</p>
            <div className="options-grid">
              {GOALS.map(g => <OptionCard key={g.value} option={g} selected={form.goal === g.value} onSelect={v => set('goal', v)} />)}
            </div>
            <h2 className="onboarding-title" style={{ marginTop: '1.5rem' }}>Your experience level</h2>
            <p className="onboarding-subtitle">Helps us set the right starting intensity.</p>
            <div className="options-grid">
              {EXPERIENCE.map(e => <OptionCard key={e.value} option={e} selected={form.experienceLevel === e.value} onSelect={v => set('experienceLevel', v)} />)}
            </div>
            <div className="step-nav"><div /><button className="btn btn-primary" onClick={next}>Next →</button></div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="onboarding-title">Your schedule</h2>
            <p className="onboarding-subtitle">We'll build a plan that fits your availability.</p>
            <div className="form-group">
              <label>Days per week at the gym</label>
              <div className="slider-row">
                <input type="range" min="1" max="7" value={form.daysAvailable} onChange={e => set('daysAvailable', e.target.value)} />
                <span className="slider-value">{form.daysAvailable}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Session duration (minutes)</label>
              <div className="slider-row">
                <input type="range" min="20" max="120" step="5" value={form.sessionDuration} onChange={e => set('sessionDuration', e.target.value)} />
                <span className="slider-value">{form.sessionDuration}</span>
              </div>
            </div>
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={back}>← Back</button>
              <button className="btn btn-primary" onClick={next}>Next →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="onboarding-title">Equipment access</h2>
            <p className="onboarding-subtitle">We'll select exercises you can actually do.</p>
            <div className="options-grid">
              {EQUIPMENT.map(e => <OptionCard key={e.value} option={e} selected={form.equipment === e.value} onSelect={v => set('equipment', v)} />)}
            </div>
            <h2 className="onboarding-title" style={{ marginTop: '1.5rem' }}>Dietary preference</h2>
            <p className="onboarding-subtitle">For your nutrition recommendations.</p>
            <div className="options-grid">
              {DIET.map(d => <OptionCard key={d.value} option={d} selected={form.dietaryPreference === d.value} onSelect={v => set('dietaryPreference', v)} />)}
            </div>
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={back}>← Back</button>
              <button className="btn btn-primary" onClick={next}>Next →</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="onboarding-title">Your body stats</h2>
            <p className="onboarding-subtitle">Used to calculate your calorie and macro targets.</p>
            <div className="grid-2">
              <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="e.g. 175" min="100" max="250" />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 75" min="30" max="300" />
              </div>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 25" min="13" max="100" />
            </div>
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={back}>← Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Generating plan…' : 'Generate My Plan 🚀'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
