import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../api/config';

const ModeContext = createContext(null);

function getStoredMode() {
  const stored = localStorage.getItem(STORAGE_KEYS.appMode);
  return stored === 'academy' ? 'academy' : 'student';
}

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(getStoredMode());

  const switchMode = useCallback((next) => {
    setMode((current) => {
      const resolved = next || (current === 'student' ? 'academy' : 'student');
      localStorage.setItem(STORAGE_KEYS.appMode, resolved);
      return resolved;
    });
  }, []);

  return (
    <ModeContext.Provider value={{ mode, switchMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}