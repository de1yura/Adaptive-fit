import React, { useState, useEffect } from 'react';
import api, {
  mapEnumToGoal,
  mapEnumToExperience,
  mapEnumToEquipment,
  mapEnumToDiet,
  mapGoalToEnum,
  mapExperienceToEnum,
  mapEquipmentToEnum,
  mapDietToEnum,
} from '../api';

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="section-title" style={{ marginBottom: '1rem' }}>Change Password</h2>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>Password changed successfully!</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

const GOALS = [
  { value: 'fat loss', label: 'Fat Loss' },
  { value: 'muscle gain', label: 'Muscle Gain' },
  { value: 'general fitness', label: 'General Fitness' },
];
const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
const EQUIPMENT = [
  { value: 'gym', label: 'Full Gym' },
  { value: 'home', label: 'Home / Minimal' },
  { value: 'none', label: 'Bodyweight' },
];
const DIET = [
  { value: 'none', label: 'No Preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'high-protein', label: 'High Protein' },
];

function Profile() {
  const [form, setForm] = useState({
    goal: 'general fitness',
    experienceLevel: 'beginner',
    daysAvailable: '3',
    sessionDuration: '45',
    equipment: 'gym',
    dietaryPreference: 'none',
    height: '',
    weight: '',
    age: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/onboarding/profile').then(res => {
      const u = res.data;
      setForm({
        goal: mapEnumToGoal(u.fitnessGoal) || 'general fitness',
        experienceLevel: mapEnumToExperience(u.experienceLevel) || 'beginner',
        daysAvailable: String(u.daysPerWeek || 3),
        sessionDuration: String(u.sessionDurationMinutes || 45),
        equipment: mapEnumToEquipment(u.equipmentAccess) || 'gym',
        dietaryPreference: mapEnumToDiet(u.dietaryPreference) || 'none',
        height: u.heightCm ? String(u.heightCm) : '',
        weight: u.weightKg ? String(u.weightKg) : '',
        age: u.age ? String(u.age) : '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const transformedForm = {
        fitnessGoal: mapGoalToEnum(form.goal),
        experienceLevel: mapExperienceToEnum(form.experienceLevel),
        daysPerWeek: parseInt(form.daysAvailable, 10),
        sessionDurationMinutes: parseInt(form.sessionDuration, 10),
        equipmentAccess: mapEquipmentToEnum(form.equipment),
        dietaryPreference: mapDietToEnum(form.dietaryPreference),
        heightCm: form.height ? parseFloat(form.height) : null,
        weightKg: form.weight ? parseFloat(form.weight) : null,
        age: form.age ? parseInt(form.age, 10) : null,
        goalDurationWeeks: 12,
      };
      await api.put('/onboarding/profile', transformedForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading profile…</p></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Update your stats and preferences</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Profile saved! Nutrition targets updated.</div>}

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Body Stats</h2>
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
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 25" min="13" max="100" style={{ maxWidth: '200px' }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Goals & Experience</h2>
          <div className="form-group">
            <label>Goal</label>
            <select value={form.goal} onChange={e => set('goal', e.target.value)}>
              {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
              {EXPERIENCE.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Schedule & Equipment</h2>
          <div className="form-group">
            <label>Days per week — {form.daysAvailable}</label>
            <input type="range" min="1" max="7" value={form.daysAvailable} onChange={e => set('daysAvailable', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Session duration — {form.sessionDuration} min</label>
            <input type="range" min="20" max="120" step="5" value={form.sessionDuration} onChange={e => set('sessionDuration', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Equipment</label>
            <select value={form.equipment} onChange={e => set('equipment', e.target.value)}>
              {EQUIPMENT.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Dietary Preference</label>
            <select value={form.dietaryPreference} onChange={e => set('dietaryPreference', e.target.value)}>
              {DIET.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <ChangePasswordSection />
    </>
  );
}

export default Profile;
