const API_URL = 'http://192.168.0.11:4000/api';
// Base URL of our Express server. On a real device, replace localhost with your PC's LAN IP
// (e.g., http://192.168.1.50:4000/api) so the phone can reach the server.

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    // Tells the server we're sending JSON. Most APIs expect this header.
    body: body ? JSON.stringify(body) : undefined,
    // Only include a body for methods that send data (POST/PUT/PATCH). GET has no body.
  });
  const data = await res.json().catch(() => ({}));
  // Try to parse the JSON response; if it fails, default to an empty object.
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  // If the HTTP status is not 2xx, throw an error with a friendly message.
  return data;
  // On success, return the parsed JSON so the UI can use it.
}

export function register({ email, password }) {
  // Calls POST /api/register with the provided email and password.
  return request('/register', { method: 'POST', body: { email, password } });
}

export function login({ email, password }) {
  // Calls POST /api/login to verify credentials with the server.
  return request('/login', { method: 'POST', body: { email, password } });
}

// -----------------------------
// How to expand this API client next
// -----------------------------
// 1) Read the base URL from app.json (expo-constants) instead of hardcoding.
// 2) Add a timeout/AbortController to cancel slow requests.
// 3) Centralize error mapping so components receive friendly messages.
// 4) Add auth token handling and attach Authorization headers for protected routes.
// 5) Consider react-query for caching, retries, and background refetching.

