import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.validationErrors ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(
      typeof message === 'object' ? message : { message }
    );
  }
);

export default api;
