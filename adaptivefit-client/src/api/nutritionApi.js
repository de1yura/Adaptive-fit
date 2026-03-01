import api from './axiosConfig';

export const getTargets = () =>
  api.get('/api/nutrition/targets');

export const logNutrition = (payload) =>
  api.post('/api/nutrition/log', payload);

export const getHistory = () =>
  api.get('/api/nutrition/log/history');
