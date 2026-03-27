import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Search, Filter, Calendar,
  Phone, User, MessageSquare, Clock,
  AlertCircle, TrendingUp, MoreVertical, X, MapPin, Truck
} from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function DealerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const fetchDealerData = useCallback(async () => {
    setLoading(true);
    try {
      const dRes = await api.get(`/dealers/${id}`);
      setDealer(dRes.data.data);

      const params = {
        dealer_id: id,
        search,
        status: statusFilter,
        date_from: dateRange.from,
        date_to: dateRange.to,
        limit: 100
      };

      const lRes = await api.get('/leads', { params });
      setLeads(lRes.data.data);
    } catch (err) {
      toast.error('Failed to load dealer details');
    } finally {
      setLoading(false);
    }
  }, [id, search, statusFilter, dateRange]);

  useEffect(() => {
    fetchDealerData();
  }, [fetchDealerData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="dealer-details-page">
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dealers')} style={{ padding: '6px 12px', borderRadius: 8 }}>
          <ChevronLeft size={16} /> Back to Dealers
        </button>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dealer?.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '') || 'Dealer'} Leads</h2>
          <p style={{ color: 'var(--grey-500)', fontSize: '0.85rem' }}>Global oversight of this partner's lead performance</p>
        </div>
      </div>

      {/* Filters Row — Responsive */}
      <div className="card" style={{ marginBottom: 20, borderRadius: 16 }}>
        <div className="card-body" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1 1 280px' }}>
            <Search size={16} className="search-icon" />
            <input
              placeholder="Search by name, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="form-select" 
            style={{ flex: '1 1 150px', background: 'var(--grey-50)', height: 42, borderRadius: 10 }} 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="On Call">On Call</option>
            <option value="Completed">Completed</option>
          </select>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--grey-50)', 
            padding: '0 12px', borderRadius: 10, border: '1px solid var(--grey-200)', 
            height: 42, flex: '1 1 280px', flexWrap: 'wrap'
          }}>
            <Calendar size={14} color="var(--grey-400)" />
            <input type="date" className="form-control" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.82rem', height: 38, minHeight: 'auto' }} value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
            <span style={{ color: 'var(--grey-300)' }}>-</span>
            <input type="date" className="form-control" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.82rem', height: 38, minHeight: 'auto' }} value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
          </div>

          <button className="btn btn-primary" style={{ padding: '0 24px', height: 42, borderRadius: 10 }} onClick={fetchDealerData}>Apply</button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-wrapper dealers-desktop-table" style={{ borderRadius: 16, border: '1px solid var(--grey-100)' }}>
        {loading ? (
          <div className="loading-overlay" style={{ background: 'rgba(255,255,255,0.7)' }}><div className="spinner" /></div>
        ) : leads.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-state-icon"><User size={32} /></div>
            <h3>No Leads Found</h3>
            <p>No leads match your criteria for this dealer.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr style={{ background: 'var(--grey-50)' }}>
                <th style={{ paddingLeft: 20 }}>Assigned Date</th>
                <th>Customer Name</th>
                <th>Contact info</th>
                <th>Current Status</th>
                <th>Follow-up</th>
                <th>Last Update</th>
                <th style={{ paddingRight: 20 }}>DSE Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id}>
                  <td style={{ paddingLeft: 20, fontWeight: 700, color: 'var(--grey-600)', fontSize: '0.85rem' }}>{formatDate(l.lead_date)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--tata-blue)', fontSize: '0.9rem' }}>{l.full_name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <a href={`tel:${l.phone_number}`} style={{ fontWeight: 600, color: 'var(--green-500)', fontSize: '0.85rem' }}>{l.phone_number}</a>
                      <span style={{ fontSize: '0.72rem', color: 'var(--grey-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {l.location}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge status-${l.status?.toLowerCase().replace(/ /g, '-')}`} style={{ fontWeight: 700 }}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.follow_up_date ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--grey-700)', fontWeight: 600 }}>
                        <Clock size={12} color="var(--orange-500)" />
                        {formatDate(l.follow_up_date)}
                      </div>
                    ) : <span style={{ color: 'var(--grey-300)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--grey-500)' }}>{formatDate(l.updated_at)}</td>
                  <td style={{ paddingRight: 20, maxWidth: 220 }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--grey-700)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.consolidated_remark || l.voice_of_customer}>
                        {l.consolidated_remark || l.voice_of_customer || '—'}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="dealers-mobile-cards">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : leads.map((l) => (
          <div key={l.id} style={{
            background: '#fff', borderRadius: 14, border: '1px solid var(--grey-100)',
            boxShadow: 'var(--shadow-xs)', padding: 14, marginBottom: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'var(--tata-blue)', fontSize: '0.95rem' }}>{l.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} /> {l.location}
                </div>
              </div>
              <span className={`badge status-${l.status?.toLowerCase().replace(/ /g, '-')}`} style={{ flexShrink: 0 }}>
                {l.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'var(--grey-50)', padding: '6px 10px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--grey-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Phone</div>
                <a href={`tel:${l.phone_number}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-500)' }}>{l.phone_number}</a>
              </div>
              <div style={{ background: 'var(--grey-50)', padding: '6px 10px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--grey-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Lead Date</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)' }}>{formatDate(l.lead_date)}</div>
              </div>
            </div>

            {l.follow_up_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 0', borderTop: '1px dashed var(--grey-200)' }}>
                <Clock size={12} color="var(--orange-500)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--grey-600)' }}>Next Follow-up: </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--orange-500)' }}>{formatDate(l.follow_up_date)}</span>
              </div>
            )}

            {(l.consolidated_remark || l.voice_of_customer) && (
              <div style={{ background: 'rgba(0,58,143,0.03)', padding: 10, borderRadius: 10, border: '1px solid rgba(0,58,143,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--tata-blue)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Latest Remark</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--grey-700)', fontWeight: 500, lineHeight: 1.4 }}>
                  {l.consolidated_remark || l.voice_of_customer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
