import axios from 'axios';
import { ACADEMY_BASE_URL, STORAGE_KEYS } from './config';

const academyApi = axios.create({
  baseURL: ACADEMY_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

academyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.academyAccessToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

academyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.academyAccessToken);
      localStorage.removeItem(STORAGE_KEYS.academyRefreshToken);
      localStorage.removeItem(STORAGE_KEYS.adminUser);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

const RETRYABLE_CODES = new Set(['ECONNABORTED', 'ERR_NETWORK']);

export const withRetry = async (requestFn, retries = 3) => {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await requestFn();
    } catch (err) {
      lastError = err;
      const recoverable = !err.response && RETRYABLE_CODES.has(err.code);
      if (!recoverable || attempt === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
};

export default academyApi;