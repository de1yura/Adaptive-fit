import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">AdaptiveFit</div>
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            Invalid or missing reset token. Please request a new password reset link.
          </div>
          <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Request New Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">AdaptiveFit</div>
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            Password reset successfully!
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
            You can now sign in with your new password.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Go to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AdaptiveFit</div>
        <p className="auth-subtitle">Choose a new password</p>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
              required
              autoFocus
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm New Password</label>
            <input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
