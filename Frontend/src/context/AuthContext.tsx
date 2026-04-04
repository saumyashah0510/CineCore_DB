import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// EXACT ROLES FROM THE DATABASE SCENARIOS DOC
export type UserRole = 
  | 'AUDIENCE' 
  | 'ADMIN' 
  | 'TALENT_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'PRODUCTION_MANAGER' 
  | 'DISTRIBUTION_MANAGER';

interface AuthContextType {
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('AUDIENCE');

  useEffect(() => {
    const savedRole = localStorage.getItem('cinecore_role') as UserRole;
    if (savedRole) setRole(savedRole);
  }, []);

  const login = (newRole: UserRole) => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};