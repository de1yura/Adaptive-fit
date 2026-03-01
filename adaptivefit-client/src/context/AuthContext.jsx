import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? decodeToken(token) : null;
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setUser(null);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && onboardingCompleted === null) {
      setOnboardingLoading(true);
      api.get('/onboarding/status')
        .then((res) => {
          setOnboardingCompleted(res.data.completed);
        })
        .catch(() => {
          setOnboardingCompleted(false);
        })
        .finally(() => {
          setOnboardingLoading(false);
        });
    }
  }, [isAuthenticated, onboardingCompleted]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(decodeToken(token));
    setOnboardingCompleted(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOnboardingCompleted(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, onboardingCompleted, setOnboardingCompleted, onboardingLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
