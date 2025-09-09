/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

// Change the type of 'phone' to string
type User = { id: string; name: string; phone: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (t: string, userData?: { id?: string; _id?: string; name?: string; phone?: string }) => void;
  logout: () => void;
} | undefined;

const AuthContext = createContext<AuthContextType>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    const init = async () => {
      if (!token) return setUser(null);
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          return;
        }
        const data = await res.json();
        // normalize user shape to { id, name, email }
        const u = data.user || {};
        // The phone value from the backend is a string, so keep it as a string.
        const normalized = { id: (u.id || u._id || '').toString(), name: u.name || '', phone: u.phone || '' };
        setUser(normalized);
      } catch (e) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    };
    init();
  }, [token]);

  const login = (t: string, userData?: { id?: string; _id?: string; name?: string; phone?: string }) => {
    localStorage.setItem('token', t);
    setToken(t);
    if (userData) {
      // Update the phone property to be a string here as well.
      const normalized = { id: (userData.id || userData._id || '').toString(), name: userData.name || '', phone: userData.phone || '' };
      setUser(normalized);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
 );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};