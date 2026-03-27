import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Search, X,
  Users, Clock, CheckCircle, AlertCircle,
  Calendar, TrendingUp, ChevronRight
} from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

function KPIStatCard({ label, value, icon: Icon, color, isCritical }) {
  return (
    <div className={`stat-card`} style={{
      borderLeft: isCritical ? '4px solid var(--red-500)' : 'none',
      background: isCritical ? 'rgba(240, 68, 56, 0.02)' : 'var(--white)'
    }}>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value?.toLocaleString() || 0}</div>
      </div>
    </div>
  );
}

export default function Dealers() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDealers(); }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dealers');
      setDealers(res.data.data);
    } catch (err) {
      toast.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    dealers.filter(d => d.dealer_name.toLowerCase().includes(search.toLowerCase())),
    [dealers, search]
  );

  const stats = useMemo(() =>
    dealers.reduce((acc, d) => ({
      total: acc.total + (d.total_leads || 0),
      pending: acc.pending + (d.pending_leads || 0),
      completed: acc.completed + (d.completed_leads || 0),
      today: acc.today + (d.today_followups || 0),
      overdue: acc.overdue + (d.overdue_followups || 0)
    }), { total: 0, pending: 0, completed: 0, today: 0, overdue: 0 }),
    [dealers]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="dealers-management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Dealer Management</h2>
          <p>Global oversight of dealer performance and follow-up metrics</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={fetchDealers}>
            <TrendingUp size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <KPIStatCard label="Total Leads" value={stats.total} icon={Users} color="blue" />
        <KPIStatCard label="Total Pending" value={stats.pending} icon={Clock} color="orange" />
        <KPIStatCard label="Total Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <KPIStatCard label="Today Follow-ups" value={stats.today} icon={Calendar} color="red" />
        <KPIStatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" isCritical={stats.overdue > 0} />
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div className="search-bar" style={{ maxWidth: '100%' }}>
            <Search size={16} className="search-icon" />
            <input
              placeholder="Search by dealer name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--grey-400)' }} onClick={() => setSearch('')} />}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="table-wrapper dealers-desktop-table">
        <table className="data-table" style={{ minWidth: 750 }}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Dealer Name</th>
              <th style={{ textAlign: 'center' }}>Total Leads</th>
              <th style={{ textAlign: 'center' }}>Pending</th>
              <th style={{ textAlign: 'center' }}>Completed</th>
              <th style={{ textAlign: 'center' }}>Today</th>
              <th style={{ textAlign: 'center' }}>Upcoming</th>
              <th style={{ textAlign: 'center' }}>Overdue</th>
              <th>Last Follow-up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={d.id}
                className="clickable-row"
                onClick={() => navigate(`/dealers/${d.id}`)}
              >
                <td style={{ color: 'var(--grey-400)', fontSize: '0.8rem', fontWeight: 600 }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--tata-blue)' }}>{d.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--grey-400)' }}>{d.contact_person || 'No Contact'}</div>
                </td>
                <td style={{ textAlign: 'center' }}><span className="badge badge-blue">{d.total_leads || 0}</span></td>
                <td style={{ textAlign: 'center' }}><span className="badge badge-yellow">{d.pending_leads || 0}</span></td>
                <td style={{ textAlign: 'center' }}><span className="badge badge-green">{d.completed_leads || 0}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(240,68,56,0.1)', color: 'var(--red-500)' }}>{d.today_followups || 0}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>{d.upcoming_followups || 0}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge" style={{
                    background: d.overdue_followups > 0 ? 'rgba(180,0,0,0.1)' : 'var(--grey-50)',
                    color: d.overdue_followups > 0 ? '#B40000' : 'var(--grey-300)',
                    gap: 4
                  }}>
                    {d.overdue_followups > 0 && <AlertCircle size={10} />}
                    {d.overdue_followups || 0}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--grey-500)' }}>{formatDate(d.last_followup)}</td>
                <td style={{ textAlign: 'right' }}><ChevronRight size={18} color="var(--grey-300)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards — shown only on small screens */}
      <div className="dealers-mobile-cards">
        {filtered.map((d, i) => (
          <div
            key={d.id}
            onClick={() => navigate(`/dealers/${d.id}`)}
            style={{
              background: '#fff', borderRadius: 14, border: '1px solid var(--grey-100)',
              boxShadow: 'var(--shadow-xs)', padding: 16, marginBottom: 10,
              cursor: 'pointer', transition: 'box-shadow 0.2s'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--tata-blue)', fontSize: '0.95rem' }}>
                  {d.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--grey-400)', marginTop: 2 }}>
                  {d.contact_person || 'No Contact Info'}
                </div>
              </div>
              <ChevronRight size={16} color="var(--grey-300)" />
            </div>
            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Total', value: d.total_leads || 0, cls: 'badge-blue' },
                { label: 'Pending', value: d.pending_leads || 0, cls: 'badge-yellow' },
                { label: 'Completed', value: d.completed_leads || 0, cls: 'badge-green' },
                { label: 'Today', value: d.today_followups || 0, bg: 'rgba(240,68,56,0.1)', col: 'var(--red-500)' },
                { label: 'Upcoming', value: d.upcoming_followups || 0, bg: 'rgba(124,58,237,0.1)', col: '#7C3AED' },
                { label: 'Overdue', value: d.overdue_followups || 0, bg: d.overdue_followups > 0 ? 'rgba(180,0,0,0.1)' : 'var(--grey-50)', col: d.overdue_followups > 0 ? '#B40000' : 'var(--grey-400)' },
              ].map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center', background: stat.bg || 'var(--grey-50)', borderRadius: 8, padding: '6px 4px' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{stat.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: stat.col || 'var(--grey-900)', marginTop: 2 }}>{stat.value}</div>
                </div>
              ))}
            </div>
            {d.last_followup && (
              <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--grey-400)', paddingTop: 8, borderTop: '1px solid var(--grey-100)' }}>
                Last Follow-up: <strong>{formatDate(d.last_followup)}</strong>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={28} /></div>
            <h3>No dealers found</h3>
            <p>Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
