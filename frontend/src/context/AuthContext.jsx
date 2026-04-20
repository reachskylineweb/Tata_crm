import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    authService.logout();
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
