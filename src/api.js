import axios from 'axios';

// Falls back to the Render backend if no .env is present.
const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://abbayah-backend.onrender.com/api';

export const TOKEN_KEY = 'abyr_admin_token'; // separate from the storefront's "abyr_token"

const api = axios.create({ baseURL: API_BASE });

// Attach the admin token to every request (same pattern as the storefront).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expires or is rejected, drop it and bounce to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Pull a human-readable message out of the backend's error shapes.
export const apiError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.message ||
  'Something went wrong';

export default api;
