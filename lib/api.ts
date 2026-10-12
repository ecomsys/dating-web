// lib/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api'; // Было 8000
// Убираем /api для запроса к Sanctum, так как он лежит в корне
const SANCTUM_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    let xsrfToken = Cookies.get('XSRF-TOKEN');
    
    if (!xsrfToken) {
      // Идем за CSRF-кукой на правильный адрес (без /api)
      await axios.get(`${SANCTUM_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      xsrfToken = Cookies.get('XSRF-TOKEN');
    }

    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
  }
  
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ errors?: Record<string, string[]>; message?: string }>) => {
    return Promise.reject(error);
  }
);

export default api;