import api from './axiosConfig';

export const getOnboardingStatus = () =>
  api.get('/onboarding/status');

export const submitOnboarding = (payload) =>
  api.post('/onboarding/submit', payload);
