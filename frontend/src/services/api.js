import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    let url = envUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    if (!url.endsWith('/api') && !url.endsWith('/api/')) {
      url = url.replace(/\/+$/, '') + '/api';
    }
    return url;
  }
  // When running in production behind Nginx, use relative /api
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:8080/api';
};

const api = axios.create({
  baseURL: getBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
