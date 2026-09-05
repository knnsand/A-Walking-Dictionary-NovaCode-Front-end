import { useState } from 'react';
import { AuthContext } from './AuthContext';

// TEMPORAL (Sprint 1): no existe login real todavía (HU-015 es Sprint 2).
export function AuthProvider({ children }) {
  const [rol, setRol] = useState('docente');

  return (
    <AuthContext.Provider value={{ rol, setRol }}>
      {children}
    </AuthContext.Provider>
  );
}