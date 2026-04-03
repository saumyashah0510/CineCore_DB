import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Automatically attach the role header to every request
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('cinecore_role') || 'AUDIENCE';
  config.headers['X-User-Role'] = role;
  return config;
});