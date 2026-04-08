import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { Phone, CheckCircle, TrendingUp, Users, Calendar, ArrowRight, Clock } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = { 'In Progress': '#F79009', 'On Call': '#003A8F', 'Completed': '#12B76A' };
const REMARK_COLORS = ['#003A8F', '#12B76A', '#F79009', '#D32F2F', '#7B1FA2', '#1565C0', '#388E3C', '#F57C00'];

function StatCard({ label, value, icon: Icon, color, sub, onClick }) {
  return (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`stat-icon ${color}`}><Icon size={20} /></div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value?.toLocaleString() ?? '—'}</div>
        {sub && <div className="stat-change">{sub}</div>}
      </div>
    </div>
  );
}

export default function DealerDashboard() {
  const { user, dateFrom, setDateFrom, dateTo, setDateTo } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/dashboard/dealer', { params: { date_from: dateFrom, date_to: dateTo } });
      setData(r.data.data);
    } catch {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const s = data?.summary || {};

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 20 }}>
      {/* Header — stacks on mobile */}
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontWeight: 800 }}>Performance Analytics</h2>
          <p style={{ color: 'var(--grey-500)', fontSize: '0.85rem' }}>Review for {user?.full_name}</p>
        </div>
        {/* Date picker — wraps on mobile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', padding: '8px 14px', borderRadius: 12,
          boxShadow: 'var(--shadow-sm)', border: '1px solid #EAECF0',
          flexWrap: 'wrap'
        }}>
          <Calendar size={16} style={{ color: 'var(--tata-blue)', flexShrink: 0 }} />
          <input
            type="date"
            style={{ border: 'none', fontWeight: 600, fontSize: '0.85rem', color: 'var(--tata-blue)', outline: 'none', background: 'transparent', minWidth: 120 }}
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <ArrowRight size={12} style={{ color: 'var(--grey-300)', flexShrink: 0 }} />
          <input
            type="date"
            style={{ border: 'none', fontWeight: 600, fontSize: '0.85rem', color: 'var(--tata-blue)', outline: 'none', background: 'transparent', minWidth: 120 }}
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Stats grid — 5-col desktop, 2-col mobile */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        <StatCard label="Total Leads" value={s.total_leads} icon={Users} color="blue" onClick={() => navigate('/my-leads')} />
        <StatCard label="Pending Leads" value={s.pending_leads} icon={Clock} color="orange" onClick={() => navigate('/my-leads?filter=pending')} />
        <StatCard label="Total Follow-ups" value={s.total_followups} icon={Phone} color="blue" onClick={() => navigate('/my-leads?filter=scheduled')} />
        <StatCard label="Completed" value={s.completed} icon={CheckCircle} color="green" onClick={() => navigate('/my-leads?filter=completed')} />
        <StatCard label="Conversion Rate" value={`${s.conversion_rate || 0}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Charts row — side-by-side on desktop, stacked on mobile */}
      <div className="dashboard-grid" style={{ gap: '20px' }}>
        {/* Lead Status */}
        <div className="card col-4">
          <div className="card-header" style={{ padding: '12px 20px' }}>
            <div className="card-title" style={{ fontSize: '0.9rem' }}>Lead Status Overview</div>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data?.status_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4}>
                  {(data?.status_distribution || []).map((e, i) => (
                    <Cell key={i} fill={STATUS_COLORS[e.status] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              {(data?.status_distribution || []).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--grey-50)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[d.status] }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--grey-600)' }}>{d.status}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Combined Insights */}
        <div className="card col-8">
          <div className="card-header" style={{ padding: '12px 20px' }}>
            <div className="card-title" style={{ fontSize: '0.9rem' }}>Lead Activity Insights</div>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            {/* 2-col on desktop, 1-col on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {/* Telecaller Remarks */}
              <div>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
                  Telecaller Remarks
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={data?.remark_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3}>
                      {(data?.remark_distribution || []).map((e, i) => (
                        <Cell key={i} fill={REMARK_COLORS[i % REMARK_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: '0.7rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, maxHeight: 140, overflowY: 'auto' }}>
                  {(() => {
                    const total = (data?.remark_distribution || []).reduce((acc, curr) => acc + curr.value, 0);
                    return (data?.remark_distribution || []).map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'var(--grey-50)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: REMARK_COLORS[index % REMARK_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--grey-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--tata-blue)', flexShrink: 0 }}>{Math.round((item.value / total) * 100)}%</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Deal Stage */}
              <div>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
                  {user?.role === 'dse' ? 'My Deal Stages' : 'Main Deal Stages'}
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={(data?.deal_stage_distribution || []).filter(d => d.name)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3}>
                      {(data?.deal_stage_distribution || []).filter(d => d.name).map((e, i) => (
                        <Cell key={i} fill={['#003A8F', '#12B76A', '#F79009', '#D32F2F', '#7B1FA2', '#1565C0'][i % 6]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: '0.7rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, maxHeight: 140, overflowY: 'auto' }}>
                  {(() => {
                    const filtered = (data?.deal_stage_distribution || []).filter(d => d.name);
                    const total = filtered.reduce((acc, curr) => acc + curr.value, 0);
                    return filtered.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'var(--grey-50)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: ['#003A8F', '#12B76A', '#F79009', '#D32F2F', '#7B1FA2', '#1565C0'][index % 6], flexShrink: 0 }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--grey-700)' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--tata-blue)' }}>{Math.round((item.value / total) * 100)}%</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DSE-Wise Distribution for Dealer */}
      {user?.role === 'dealer' && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <div className="card-title" style={{ fontSize: '1rem', fontWeight: 800 }}>DSE-Wise Distribution</div>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(data?.dse_stage_distribution || []).map((dse, idx) => (
                <div key={idx} style={{ border: '1px solid var(--grey-100)', padding: 16, borderRadius: 14, background: '#fff' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--tata-blue)', textTransform: 'uppercase', textAlign: 'center' }}>{dse.dse_name}</h4>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={dse.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                        {dse.distribution.map((e, i) => (
                          <Cell key={i} fill={['#003A8F', '#12B76A', '#F79009', '#D32F2F', '#7B1FA2', '#1565C0'][i % 6]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {(() => {
                      const total = dse.distribution.reduce((acc, curr) => acc + curr.value, 0);
                      return dse.distribution.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.63rem', fontWeight: 700, padding: '3px 7px', background: 'var(--grey-50)', borderRadius: 4 }}>
                          <span style={{ color: 'var(--grey-500)', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          <span style={{ color: 'var(--grey-900)' }}>{Math.round((item.value / total) * 100)}%</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
