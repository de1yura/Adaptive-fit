import api from './axiosConfig';

export const getProfile = () =>
  api.get('/onboarding/profile');

export const updateProfile = (payload) =>
  api.put('/onboarding/profile', payload);

export const changePassword = (payload) =>
  api.post('/auth/change-password', payload);
