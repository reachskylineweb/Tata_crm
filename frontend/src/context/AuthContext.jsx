import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const storedUser = localStorage.getItem('crm_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('crm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setUser(null);
  };

  const [dateFrom, setDateFrom] = useState(localStorage.getItem('crm_date_from') || new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(localStorage.getItem('crm_date_to') || new Date().toISOString().split('T')[0]);

  const updateDateFrom = (val) => { setDateFrom(val); localStorage.setItem('crm_date_from', val); };
  const updateDateTo = (val) => { setDateTo(val); localStorage.setItem('crm_date_to', val); };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, 
      loading, 
      dateFrom, setDateFrom: updateDateFrom,
      dateTo, setDateTo: updateDateTo,
      isAdmin: user?.role === 'admin', 
      isCampaign: user?.role === 'campaign_team', 
      isDealer: user?.role === 'dealer',
      isDSE: user?.role === 'dse'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
