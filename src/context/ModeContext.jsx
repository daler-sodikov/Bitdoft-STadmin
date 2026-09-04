import { createContext, useContext, useState } from 'react';

const ModeContext = createContext(null);

const MODE_KEY = 'admin_mode';

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => localStorage.getItem(MODE_KEY) || 'offline');

  const setMode = (value) => {
    localStorage.setItem(MODE_KEY, value);
    setModeState(value);
  };

  const clearMode = () => {
    localStorage.removeItem(MODE_KEY);
    setModeState(null);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, clearMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
