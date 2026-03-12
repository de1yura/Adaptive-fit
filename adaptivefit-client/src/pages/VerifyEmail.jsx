import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify?token=${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        const data = err.response?.data;
        setError(data?.error || data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">AdaptiveFit</div>

        {status === 'loading' && (
          <>
            <p className="auth-subtitle">Verifying your email</p>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Please wait...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              Email verified! You can now sign in.
            </div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Go to Sign In
              </button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Back to Register
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
