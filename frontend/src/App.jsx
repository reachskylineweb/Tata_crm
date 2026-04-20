import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DealerDashboard from './pages/DealerDashboard';
import MasterLeads from './pages/MasterLeads';
import DealerLeads from './pages/DealerLeads';
import UploadLeads from './pages/UploadLeads';
import Dealers from './pages/Dealers';
import Reports from './pages/Reports';
import CampaignMetrics from './pages/CampaignMetrics';
import DuplicateLeads from './pages/DuplicateLeads';
import DealerDetails from './pages/DealerDetails';
import DealerRecords from './pages/DealerRecords';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Loading...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.matchMedia('(display-mode: minimal-ui)').matches || 
                  window.navigator.standalone;
    setIsStandalone(isPWA);
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Initializing Tata Motors CRM...</span></div>;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect root based on role
  const defaultRoute = (user.role === 'dealer' || user.role === 'dse') ? '/dealer-dashboard' : '/dashboard';

  // PWA GUARD: Only DSE can use the standalone app
  if (isStandalone && user.role !== 'dse') {
    return (
      <div className="login-page" style={{ padding: 24, textAlign: 'center' }}>
        <div className="login-card" style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 20 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg" alt="Tata" style={{ height: 40, marginBottom: 12 }} />
            <h3 style={{ color: 'var(--red-600)', marginBottom: 8 }}>Access Restricted</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--grey-600)', lineHeight: 1.6 }}>
              The <strong>DSE Mobile App</strong> is exclusively for Sales Executives. 
              Admins and Dealers must use the desktop browser to access the full CRM Portal.
            </p>
          </div>
          <div style={{ background: 'var(--grey-50)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <p style={{ fontSize: '0.78rem', margin: 0, fontWeight: 600, color: 'var(--grey-500)' }}>
              Please close this app and open <strong>tata-crm-eight.vercel.app</strong> in Chrome or Safari.
            </p>
          </div>
          <button onClick={() => window.location.href = window.location.origin} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Go to Browser Version
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      <Route element={<Layout />}>
        {/* Admin & Campaign Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute allowedRoles={['campaign_team']}>
            <UploadLeads />
          </ProtectedRoute>
        } />
        <Route path="/master-leads" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <MasterLeads />
          </ProtectedRoute>
        } />
        <Route path="/dealers" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <Dealers />
          </ProtectedRoute>
        } />
        <Route path="/dealers/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <DealerDetails />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/campaign" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <CampaignMetrics />
          </ProtectedRoute>
        } />
        <Route path="/duplicate-leads" element={
          <ProtectedRoute allowedRoles={['admin', 'campaign_team']}>
            <DuplicateLeads />
          </ProtectedRoute>
        } />


        {/* Dealer & DSE Routes */}
        <Route path="/dealer-dashboard" element={
          <ProtectedRoute allowedRoles={['dealer', 'dse']}>
            <DealerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dse-app" element={
          <ProtectedRoute allowedRoles={['dse']}>
            <DealerDashboard isPWA={true} />
          </ProtectedRoute>
        } />

        <Route path="/my-leads" element={
          <ProtectedRoute allowedRoles={['dealer', 'dse']}>
            <DealerLeads />
          </ProtectedRoute>
        } />
        <Route path="/dealer-records" element={
          <ProtectedRoute allowedRoles={['dealer']}>
            <DealerRecords />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1D2939',
              color: '#fff',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '0.875rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            },
            success: { iconTheme: { primary: '#12B76A', secondary: '#fff' } },
            error: { iconTheme: { primary: '#F04438', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
