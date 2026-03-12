import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [step, setStep] = useState(1); // 1=form, 2=check email message
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { email: form.email, password: form.password });
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AdaptiveFit</div>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 && (
          <>
            <p className="auth-subtitle">Create your free account</p>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirm Password</label>
                <input id="confirm" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" required autoComplete="new-password" />
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
          </>
        )}

        {step === 2 && (
          <>
            <p className="auth-subtitle">Check your email</p>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              We sent a verification link to <strong>{form.email}</strong>. Please check your inbox (and spam folder) and click the link to verify your account, then come back to sign in.
            </div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Go to Sign In
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
