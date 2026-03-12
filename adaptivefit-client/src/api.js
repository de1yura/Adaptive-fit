import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === Enum mapping helpers ===

export const mapGoalToEnum = (goal) => {
  const map = { 'fat loss': 'FAT_LOSS', 'muscle gain': 'MUSCLE_GAIN', 'general fitness': 'GENERAL_FITNESS' };
  return map[goal] || 'GENERAL_FITNESS';
};

export const mapEnumToGoal = (e) => {
  const map = { 'FAT_LOSS': 'fat loss', 'MUSCLE_GAIN': 'muscle gain', 'GENERAL_FITNESS': 'general fitness' };
  return map[e] || 'general fitness';
};

export const mapExperienceToEnum = (exp) => {
  const map = { 'beginner': 'BEGINNER', 'intermediate': 'INTERMEDIATE', 'advanced': 'ADVANCED' };
  return map[exp] || 'BEGINNER';
};

export const mapEnumToExperience = (e) => {
  const map = { 'BEGINNER': 'beginner', 'INTERMEDIATE': 'intermediate', 'ADVANCED': 'advanced' };
  return map[e] || 'beginner';
};

export const mapEquipmentToEnum = (eq) => {
  const map = { 'gym': 'FULL_GYM', 'home': 'HOME_BASIC', 'none': 'BODYWEIGHT_ONLY' };
  return map[eq] || 'FULL_GYM';
};

export const mapEnumToEquipment = (e) => {
  const map = { 'FULL_GYM': 'gym', 'HOME_BASIC': 'home', 'BODYWEIGHT_ONLY': 'none' };
  return map[e] || 'gym';
};

export const mapDietToEnum = (d) => {
  const map = { 'none': 'NO_PREFERENCE', 'vegetarian': 'VEGETARIAN', 'vegan': 'VEGAN', 'high-protein': 'NO_PREFERENCE', 'halal': 'HALAL', 'gluten-free': 'GLUTEN_FREE' };
  return map[d] || 'NO_PREFERENCE';
};

export const mapEnumToDiet = (e) => {
  const map = { 'NO_PREFERENCE': 'none', 'VEGETARIAN': 'vegetarian', 'VEGAN': 'vegan', 'HALAL': 'none', 'GLUTEN_FREE': 'none' };
  return map[e] || 'none';
};

// Transform WorkoutPlanResponse to the format the frontend expects
export const transformPlanResponse = (plan) => {
  if (!plan || !plan.days) return null;
  const workoutRoutine = plan.days.map(day => ({
    day: day.dayNumber,
    title: day.dayLabel || `Day ${day.dayNumber}`,
    splitType: day.focusArea || '',
    exercises: (day.exercises || []).map(ex => ({
      id: ex.id,
      name: ex.exerciseName,
      sets: ex.sets,
      reps: ex.reps,
      muscleGroup: ex.notes || day.focusArea || '',
      restSeconds: ex.restSeconds,
    })),
  }));

  return {
    id: plan.id,
    version: plan.version,
    workoutRoutine,
    calorieTarget: 0,
    proteinTarget: 0,
    carbsTarget: 0,
    fatsTarget: 0,
    adaptationReason: plan.changeSummary || '',
    active: plan.status === 'ACTIVE',
    createdAt: plan.createdAt,
  };
};

export default api;
