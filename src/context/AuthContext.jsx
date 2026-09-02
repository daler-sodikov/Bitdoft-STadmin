import { createContext, useContext, useState, useEffect } from 'react';
import academyApi from '../api/academyApi';
import { STORAGE_KEYS } from '../api/config';

const AuthContext = createContext(null);

function getStoredAuth() {
  const stored = localStorage.getItem(STORAGE_KEYS.adminUser);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.adminUser);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredAuth());
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await academyApi.post('/auth/login', { phone, password });
      const data = res.data?.data;
      if (!data) return { success: false, message: 'Ошибка авторизации' };

      if (data.user?.role !== 'ADMIN') {
        return { success: false, message: 'Недостаточно прав для входа в админ-панель' };
      }

      const userData = { ...data.user, email: data.user.phone, role: 'admin' };
      localStorage.setItem(STORAGE_KEYS.academyAccessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.academyRefreshToken, data.refreshToken);
      localStorage.setItem(STORAGE_KEYS.adminUser, JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message;
      return { success: false, message: message || 'Неверный телефон или пароль' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.academyRefreshToken);
      if (refreshToken) await academyApi.post('/auth/logout', { refreshToken });
    } catch {
    } finally {
      localStorage.removeItem(STORAGE_KEYS.academyAccessToken);
      localStorage.removeItem(STORAGE_KEYS.academyRefreshToken);
      localStorage.removeItem(STORAGE_KEYS.adminUser);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}