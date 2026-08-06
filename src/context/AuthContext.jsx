import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'u.burkhonov99@gmail.com';
const ADMIN_PASSWORD = 'bitsoftgroup';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const userData = { email, role: 'admin' };
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Неверный email или пароль' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
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
