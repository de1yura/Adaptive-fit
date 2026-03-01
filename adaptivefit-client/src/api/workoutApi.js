import api from './axiosConfig';

export const getWeeklySchedule = () =>
  api.get('/workouts/week');

export const getDayDetail = (dayId) =>
  api.get(`/workouts/day/${dayId}`);

export const completeWorkout = (payload) =>
  api.post('/workouts/complete', payload);

export const substituteExercise = (payload) =>
  api.put('/workouts/substitute', payload);
