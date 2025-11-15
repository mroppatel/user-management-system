import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', withCredentials: true });

API.interceptors.request.use((config) => {
  const t = localStorage.getItem('accessToken');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default API;
