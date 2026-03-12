import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=check email message
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AdaptiveFit</div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {step === 1 && (
          <>
            <p className="auth-subtitle">Reset your password</p>
            <form onSubmit={handleSendLink}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-footer" style={{ marginTop: '1rem' }}>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Back to Sign In</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <p className="auth-subtitle">Check your email</p>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              We sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
            </div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Back to Sign In
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
