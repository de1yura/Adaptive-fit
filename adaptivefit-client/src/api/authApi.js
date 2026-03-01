import api from './axiosConfig';

export const registerUser = (email, password) =>
  api.post('/auth/register', { email, password });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const verifyEmail = (token) =>
  api.get(`/auth/verify?token=${encodeURIComponent(token)}`);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword });
