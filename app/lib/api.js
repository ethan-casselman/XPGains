// lib/api.js
const API_URL = 'http://172.27.124.211:4000/api';
// Base URL of our Express server. On a real device, replace localhost with your PC's LAN IP.

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

// -----------------------------
// Auth
// -----------------------------
export function register({ email, password }) {
  return request('/register', { method: 'POST', body: { email, password } });
}

export function login({ email, password }) {
  return request('/login', { method: 'POST', body: { email, password } });
}

// -----------------------------
// Progress + Workout Tree
// -----------------------------
export function getProgress(email) {
  return request(`/progress/${email}`, { method: 'GET' });
}

export function getWorkoutTree() {
  return request('/progress/tree/all', { method: 'GET' });
}

export function completeWorkout(email, workoutId) {
  return request('/progress/complete', {
    method: 'POST',
    body: { email, workoutId },
  });
}

// -----------------------------
// Schedule API
// -----------------------------
// GET all workouts for the 7-day window starting at weekStartISO
export function getWeekSchedule(email, weekStartISO) {
  return request(`/schedule/${encodeURIComponent(email)}?weekStart=${weekStartISO}`, {
    method: 'GET',
  });
}

// POST add a workout to a specific day
export function addToSchedule(email, dateISO, workoutId) {
  return request('/schedule/add', {
    method: 'POST',
    body: { email, date: dateISO, workoutId },
  });
}

// POST remove a workout from a specific day
export function removeFromSchedule(email, dateISO, workoutId) {
  return request('/schedule/remove', {
    method: 'POST',
    body: { email, date: dateISO, workoutId },
  });
}

/*
// -----------------------------
// How to expand this API client next
// -----------------------------
// 1) Read the base URL from app.json (expo-constants) instead of hardcoding.
// 2) Add a timeout/AbortController to cancel slow requests.
// 3) Centralize error mapping so components receive friendly messages.
// 4) Add auth token handling and attach Authorization headers for protected routes.
// 5) Consider react-query for caching, retries, and background refetching.
*/
