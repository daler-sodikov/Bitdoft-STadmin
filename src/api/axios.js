import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // Anti-hang protection
  headers: {
    Accept: "application/json",
    'is-admin': true,
  },
});

// Request interceptor (ready for when you need Auth tokens)
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.isDeleted === true) {
      localStorage.clear();
      alert('Аккаунт удален. Обратитесь к администратору.');
      window.location.reload();
      return Promise.reject(new Error('Account deleted'));
    }
    return response;
  },
  async (error) => {
    if (
      error.response?.data?.isDeleted === true ||
      error.response?.data?.message === 'Student not found'
    ) {
      localStorage.clear();
      alert('Аккаунт удален. Обратитесь к администратору.');
      window.location.reload();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
