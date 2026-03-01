import api from './axiosConfig';

export const getDashboard = () =>
  api.get('/progress/dashboard');

export const getProgressData = () =>
  api.get('/progress/export');

export const exportData = () =>
  api.get('/progress/export');
