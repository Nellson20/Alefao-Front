import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = Cookies.get('token');
      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          // Even if token is near expiration, we set the user. 
          // The Axios interceptor will handle the actual refresh logic when API is called.
          setUser({ id: decoded.sub, email: decoded.email, role: decoded.role?.toLowerCase() });
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    Cookies.set('token', accessToken, { expires: 7, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { expires: 30, sameSite: 'strict' });
    
    const decoded = parseJwt(accessToken);
    if (decoded) {
      const role = decoded.role?.toLowerCase();
      setUser({ id: decoded.sub, email: decoded.email, role });
      Cookies.set('role', role, { expires: 7, sameSite: 'strict' });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      Cookies.remove('role');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
