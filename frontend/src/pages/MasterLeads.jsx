import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Edit2, ChevronLeft, ChevronRight, X, Building2, AlertCircle, Calendar, MapPin, Truck, Phone } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function EditDealerModal({ lead, dealers, onClose, onSave }) {
  const [selectedDealerId, setSelectedDealerId] = useState(lead.dealer_id || '');
  const [newLocation, setNewLocation] = useState(lead.location);
  const [saving, setSaving] = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  useEffect(() => {
    if (selectedDealerId && selectedDealerId !== lead.dealer_id) {
      setFetchingLoc(true);
      api.get(`/dealers/${selectedDealerId}`)
        .then(res => {
          if (res.data.data.districts && res.data.data.districts.length > 0) {
            const rawDist = res.data.data.districts[0].district;
            const formattedDist = rawDist.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            setNewLocation(formattedDist);
          } else {
            setNewLocation('Others');
          }
        })
        .finally(() => setFetchingLoc(false));
    } else if (selectedDealerId === lead.dealer_id) {
      setNewLocation(lead.location);
    }
  }, [selectedDealerId, lead.dealer_id, lead.location]);

  const handleSave = async () => {
    if (!selectedDealerId) { toast.error('Please select a dealer'); return; }
    setSaving(true);
    try {
      await api.put(`/leads/${lead.id}`, { dealer_id: selectedDealerId });
      toast.success('Lead reassigned');
      onSave(); onClose();
    } catch {
      toast.error('Reassignment failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>Reassign Lead</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Assign New Dealer Partner</label>
            <select className="form-select" value={selectedDealerId} onChange={e => setSelectedDealerId(e.target.value)}>
              <option value="">— Select Dealer —</option>
              {dealers.map(d => (<option key={d.id} value={d.id}>{d.dealer_name}</option>))}
            </select>
          </div>
          <div style={{ background: 'var(--grey-50)', padding: 12, borderRadius: 10, marginTop: 16 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--grey-500)', fontWeight: 700 }}>PREVIEW LOCATION</span>
            <div style={{ fontWeight: 800, color: 'var(--tata-blue)', marginTop: 4 }}>{fetchingLoc ? 'Detecting...' : newLocation}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || fetchingLoc}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function MasterLeads() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 100, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dealerFilter, setDealerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dealers, setDealers] = useState([]);
  const [editLead, setEditLead] = useState(null);

  useEffect(() => {
    api.get('/dealers').then(r => setDealers(r.data.data)).catch(() => {});
  }, []);

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 100, search, status: statusFilter, date_from: dateFrom, date_to: dateTo, dealer_id: dealerFilter };
      const res = await api.get('/leads', { params });
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo, dealerFilter]);

  useEffect(() => { fetchLeads(1); }, [fetchLeads]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="master-leads-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Master Lead Workspace</h2>
          <p>Global lead repository — {pagination.total.toLocaleString()} Records</p>
        </div>
      </div>

      {/* Responsive Filters */}
      <div className="card" style={{ marginBottom: 24, borderRadius: 16 }}>
        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: '2 1 300px' }}>
              <Search size={16} className="search-icon" />
              <input placeholder="Search name, phone, location..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchLeads(1)} />
            </div>
            <select className="form-select" style={{ flex: '1 1 150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['In Progress', 'On Call', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ flex: '1 1 200px' }} value={dealerFilter} onChange={e => setDealerFilter(e.target.value)}>
              <option value="">All Dealer Partners</option>
              {dealers.map(d => (
                <option key={d.id} value={d.id}>{d.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--grey-50)', padding: '0 12px', borderRadius: 10, border: '1px solid var(--grey-200)', flex: '1 1 280px', minHeight: 44 }}>
              <Calendar size={14} color="var(--grey-400)" />
              <input type="date" className="form-control" style={{ border: 'none', background: 'transparent', height: 40, fontSize: '0.82rem', flex: 1, minWidth: 110 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ color: 'var(--grey-300)' }}>→</span>
              <input type="date" className="form-control" style={{ border: 'none', background: 'transparent', height: 40, fontSize: '0.82rem', flex: 1, minWidth: 110 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ padding: '0 24px', height: 44, borderRadius: 10, flexShrink: 0 }} onClick={() => fetchLeads(1)}><Filter size={16} /> Filter Results</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" /></div>
      ) : leads.length === 0 ? (
        <div className="empty-state"><h3>No results found</h3><p>Try broadening your filter criteria.</p></div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-wrapper desktop-table-view" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr style={{ background: 'var(--grey-50)' }}>
                  <th style={{ paddingLeft: 20 }}>S.No</th>
                  <th>Date</th>
                  <th>Lead Information</th>
                  <th>Vehicle & Location</th>
                  <th>Allocation</th>
                  {isAdmin && <th style={{ textAlign: 'right', paddingRight: 20 }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={l.id}>
                    <td style={{ paddingLeft: 20, color: 'var(--grey-400)', fontSize: '0.75rem', fontWeight: 700 }}>{(pagination.page - 1) * pagination.limit + i + 1}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(l.lead_date)}</td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--tata-blue)', fontSize: '0.9rem' }}>{l.full_name}</div>
                      <a href={`tel:${l.phone_number}`} style={{ fontSize: '0.82rem', color: 'var(--green-500)', fontWeight: 600 }}>{l.phone_number}</a>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--grey-800)' }}>{l.model}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--grey-400)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {l.location}</div>
                    </td>
                    <td><span className="badge badge-blue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{l.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')}</span></td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right', paddingRight: 20 }}>
                        <button onClick={() => setEditLead(l)} style={{ background: 'none', border: 'none', color: 'var(--tata-blue)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}><Edit2 size={14} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View — STRICTLY FOR MOBILE */}
          <div className="mobile-only mobile-card-list">
            {leads.map((l, i) => (
              <div key={l.id} className="mobile-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--tata-blue)', fontSize: '1rem' }}>{l.full_name}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--grey-400)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(l.lead_date)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button className="btn btn-secondary btn-icon" style={{ width: 32, height: 32, padding: 0 }} onClick={() => setEditLead(l)}><Edit2 size={14} /></button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'var(--grey-50)', padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--grey-400)', textTransform: 'uppercase', marginBottom: 2 }}>Phone</div>
                    <a href={`tel:${l.phone_number}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-500)' }}>{l.phone_number}</a>
                  </div>
                  <div style={{ background: 'var(--grey-50)', padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--grey-400)', textTransform: 'uppercase', marginBottom: 2 }}>Vehicle</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--grey-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Truck size={12} style={{ marginBottom: -2 }} /> {l.model}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--grey-100)', paddingTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--grey-500)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {l.location}</div>
                  <span className="badge badge-blue">{l.dealer_name.replace(/\s*Dealer\s*Partner\s*/gi, '')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination" style={{ marginTop: 20 }}>
            <span className="pagination-info" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Records { (pagination.page - 1) * pagination.limit + 1 } - { Math.min(pagination.page * pagination.limit, pagination.total) } of { pagination.total.toLocaleString() }</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchLeads(pagination.page - 1)}><ChevronLeft size={16} /></button>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', width: 40, textAlign: 'center' }}>{pagination.page}</span>
              <button className="page-btn" disabled={pagination.page >= pagination.total_pages} onClick={() => fetchLeads(pagination.page + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      {editLead && <EditDealerModal lead={editLead} dealers={dealers} onClose={() => setEditLead(null)} onSave={() => fetchLeads(pagination.page)} />}
    </div>
  );
}
