import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const passRef = useRef(null);

  const handleUserEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome, ${user.full_name}!`);
      if (user.role === 'dealer' || user.role === 'dse') {
        navigate('/dealer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="login-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg" 
            alt="Tata Motors" 
            style={{ height: '70px', marginBottom: 12 }} 
          />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--grey-900)', letterSpacing: '2px' }}>CRM PORTAL</div>
          <p style={{ marginTop: 4, color: 'var(--grey-500)', fontSize: '0.82rem' }}>Advertisement Lead Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <div className="search-bar" style={{ padding: '10px 14px' }}>
              <User size={16} className="search-icon" style={{ color: 'var(--tata-blue)' }} />
              <input
                type="text"
                autoFocus
                placeholder="Enter email or username"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={handleUserEnter}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-bar" style={{ padding: '10px 14px' }}>
              <Lock size={16} className="search-icon" style={{ color: 'var(--tata-blue)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                ref={passRef}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--grey-400)', padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
            ) : 'Sign In to CRM'}
          </button>
        </form>

        <div className="divider" style={{ marginTop: 24 }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--grey-400)', lineHeight: 1.8 }}>
            🔒 Authorized personnel only<br />
            Tata Motors — Advertisement Lead CRM
          </p>
        </div>
      </div>
    </div>
  );
}
