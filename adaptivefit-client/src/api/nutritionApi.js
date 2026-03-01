import api from './axiosConfig';

export const getTargets = () =>
  api.get('/nutrition/targets');

export const logNutrition = (payload) =>
  api.post('/nutrition/log', payload);

export const getHistory = () =>
  api.get('/nutrition/log/history');
