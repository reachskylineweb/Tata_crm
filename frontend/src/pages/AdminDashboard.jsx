import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Users, Phone, CheckCircle, Clock, TrendingUp, Activity, Building2, Calendar, MessageSquare, AlertCircle, X, Download, ChevronRight } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const COLORS = ['#003A8F', '#12B76A', '#F79009', '#F04438', '#7C3AED', '#FFBB28', '#FF8042', '#0088FE', '#00C49F'];
const STATUS_COLORS = { 'In Progress': '#F79009', 'On Call': '#003A8F', 'Completed': '#12B76A' };

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get('/dashboard/admin', { params: { date_from: dateFrom, date_to: dateTo } })
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    if (!dateFrom || !dateTo) { toast.error('Please select both From and To dates'); return; }
    const loadingToast = toast.loading('Exporting...');
    try {
      const res = await api.get('/leads', { params: { date_from: dateFrom, date_to: dateTo, limit: 100000 } });
      const leads = res.data.data;
      if (!leads.length) { toast.error('No leads found'); toast.dismiss(loadingToast); return; }
      const headers = ['DATE', 'NAME', 'PHONE', 'LOCATION', 'VEHICLE', 'REMARK', 'DSE', 'STATUS'];
      const csv = [headers.join(','), ...leads.map(l => [l.lead_date, l.full_name, l.phone_number, l.location, l.model, l.voice_of_customer, l.assigned_to_dse, l.status].join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Leads_Export_${dateFrom}_to_${dateTo}.csv`;
      link.click();
      toast.success('Downloaded!');
    } catch { toast.error('Export failed'); } finally { toast.dismiss(loadingToast); }
  };

  if (loading && !data) return <div className="loading-overlay"><div className="spinner" /></div>;

  const s = data?.summary || {};
  const convRate = s.conversion_rate || 0;
  const chartData = (data?.dealer_performance || []).map(d => ({
    ...d, dealer_name: d.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')
  }));

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Admin Dashboard</h2>
          <p>Global oversight of Tata Motors CRM performance</p>
        </div>
        <div className="page-header-actions">
          <div className="date-picker-wrap" style={{ display: 'flex', gap: 10, background: '#fff', padding: '6px 14px', borderRadius: 12, border: '1px solid var(--grey-200)', flexWrap: 'wrap' }}>
            <Calendar size={14} color="var(--grey-400)" />
            <input type="date" className="date-input-clean" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }} />
            <span style={{ color: 'var(--grey-200)' }}>→</span>
            <input type="date" className="date-input-clean" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }} />
          </div>
          <button className="btn btn-primary" onClick={handleExport}><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        <StatCard label="Total Leads" value={s.total_leads} icon={Users} color="blue" sub="Overall" onClick={() => navigate('/dealers')} />
        <StatCard label="Pending" value={s.pending_leads} icon={AlertCircle} color="orange" sub="Awaiting action" />
        <StatCard label="Follow-ups" value={s.pending_followups} icon={Clock} color="purple" sub="Action needed" />
        <StatCard label="Completed" value={s.completed} icon={CheckCircle} color="green" sub="Total closed" />
        <StatCard label="Completion %" value={`${convRate}%`} icon={TrendingUp} color="blue" sub="Current accuracy" />
      </div>

      <div className="dashboard-grid">
        {/* Lead Status */}
        <div className="card col-4">
          <div className="card-header"><div className="card-title"><Activity size={16} /> Status Overview</div></div>
          <div className="card-body chart-card-body">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data?.status_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {(data?.status_distribution || []).map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Telecaller Remarks — Centered & Spaced */}
        <div className="card col-8">
          <div className="card-header"><div className="card-title"><MessageSquare size={16} /> Telecaller Remarks</div></div>
          <div className="card-body chart-card-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data?.remark_distribution || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {(data?.remark_distribution || []).map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, fontSize: '0.75rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dealer Graph — Spacing Fix */}
        <div className="card col-12">
          <div className="card-header"><div className="card-title"><Building2 size={16} /> Telecaller Performance by Dealer</div></div>
          <div className="card-body" style={{ padding: '24px 10px' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData.slice(0, 10)} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey-50)" />
                <XAxis dataKey="dealer_name" tick={{ fontSize: 10, fontWeight: 700 }} angle={-30} textAnchor="end" interval={0} dy={15} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend verticalAlign="top" height={40} wrapperStyle={{ fontSize: '0.85rem', fontWeight: 600 }} />
                <Bar dataKey="total_leads" name="Total Leads" fill="#003A8F" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="completed" name="Completed" fill="#12B76A" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Metrics Table → Cards on Mobile */}
        <div className="card col-6">
          <div className="card-header"><div className="card-title"><TrendingUp size={16} /> Campaign Metrics Summary</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {/* Desktop Table View */}
            <div className="desktop-table-view">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Leads</th><th>Spend</th></tr></thead>
                <tbody>
                  {(data?.campaign_metrics || []).slice(0, 5).map((m, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{m.date_label}</td>
                      <td><span className="badge badge-blue">{m.total_leads}</span></td>
                      <td style={{ fontWeight: 700 }}>₹{parseFloat(m.ad_spend).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card List */}
            <div className="mobile-only" style={{ padding: 16 }}>
              {(data?.campaign_metrics || []).slice(0, 5).map((m, i) => (
                <div key={i} className="mobile-card-item" style={{ marginBottom: 10 }}>
                  <div className="card-list-row">
                    <span className="card-list-label">{m.date_label}</span>
                    <span className="badge badge-blue" style={{ minWidth: 60 }}>{m.total_leads} Leads</span>
                  </div>
                  <div className="card-list-row" style={{ marginTop: 8 }}>
                    <span className="card-list-label">Ad Spend</span>
                    <span style={{ fontWeight: 800 }}>₹{parseFloat(m.ad_spend).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities Table → Cards on Mobile */}
        <div className="card col-6">
          <div className="card-header"><div className="card-title"><Activity size={16} /> Recent Dealer Activity</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {/* Desktop Table View */}
            <div className="desktop-table-view">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Dealer</th><th>Status</th></tr></thead>
                <tbody>
                  {(data?.recent_activity || []).map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{r.full_name}</td>
                      <td style={{ color: 'var(--grey-500)', fontSize: '0.8rem' }}>{r.dealer_name.replace(/\s*Partner\s*/gi, '')}</td>
                      <td><span className={`badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card List */}
            <div className="mobile-only" style={{ padding: 16 }}>
              {(data?.recent_activity || []).map((r, i) => (
                <div key={i} className="mobile-card-item" style={{ marginBottom: 10 }}>
                  <div className="card-list-row">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--tata-blue)' }}>{r.full_name}</span>
                    <span className={`badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)', marginTop: 4 }}>
                    {r.dealer_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
