import api from './axiosConfig';

export const submitCheckIn = (payload) =>
  api.post('/checkin/submit', payload);

export const getCheckInHistory = () =>
  api.get('/checkin/history');

export const getCheckInDueStatus = () =>
  api.get('/checkin/due');
