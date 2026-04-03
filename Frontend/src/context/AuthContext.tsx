import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Role = 'ADMIN' | 'PRODUCTION_MANAGER' | 'FINANCE_MANAGER' | 'DIRECTOR' | 'AUDIENCE';

interface AuthContextType {
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('AUDIENCE');

  useEffect(() => {
    const saved = localStorage.getItem('cinecore_role') as Role;
    if (saved) setRole(saved);
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('cinecore_role', newRole);
  };

  const logout = () => {
    setRole('AUDIENCE');
    localStorage.removeItem('cinecore_role');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}