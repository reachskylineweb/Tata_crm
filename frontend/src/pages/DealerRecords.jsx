import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserPlus, Search, Filter, Calendar, 
  CheckCircle, Clock, AlertCircle, Phone, 
  ChevronRight, Mail, Lock, User, X, Briefcase, Activity, FileSpreadsheet
} from 'lucide-react';
import api from '../services/apiClient';
import toast from 'react-hot-toast';
import { ASSET_BASE_URL } from '../config/api';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={20} /></div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value?.toLocaleString() ?? '0'}</div>
        {sub && <div className="stat-change">{sub}</div>}
      </div>
    </div>
  );
}

const AddDseModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ 
    username: '', 
    full_name: '', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/dealers/my/dses', form);
      toast.success('DSE User created successfully!');
      onSuccess();
      onClose();
      setForm({ username: '', full_name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create DSE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" style={{ maxWidth: 460, margin: 'auto', borderRadius: 20, border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
        <div className="modal-header" style={{ background: 'var(--grey-50)', padding: '24px 30px', borderBottom: '1px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: 'var(--tata-blue-pale)', color: 'var(--tata-blue)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--grey-900)' }}>Add New DSE</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--grey-500)' }}>Register a new sales executive account</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--grey-100)', color: 'var(--grey-500)', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '30px', background: '#fff' }}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--grey-400)', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>FULL NAME</label>
            <div className="search-bar" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--grey-200)', background: 'var(--grey-50)44' }}>
              <User size={18} style={{ color: 'var(--tata-blue)', opacity: 0.6, flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="Ex. Ramesh Kumar"
                style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 600 }}
                required
                value={form.full_name}
                onChange={e => setForm({...form, full_name: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--grey-400)', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>USERNAME</label>
            <div className="search-bar" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--grey-200)', background: 'var(--grey-50)44' }}>
              <Users size={18} style={{ color: 'var(--tata-blue)', opacity: 0.6, flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="ramesh_tata"
                style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 600 }}
                required
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--grey-400)', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>EMAIL ADDRESS</label>
            <div className="search-bar" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--grey-200)', background: 'var(--grey-50)44' }}>
              <Mail size={18} style={{ color: 'var(--tata-blue)', opacity: 0.6, flexShrink: 0 }} />
              <input 
                type="email" 
                placeholder="ramesh@tatamotors.com"
                style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 600 }}
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--grey-400)', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>PASSWORD</label>
            <div className="search-bar" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--grey-200)', background: 'var(--grey-50)44' }}>
              <Lock size={18} style={{ color: 'var(--tata-blue)', opacity: 0.6, flexShrink: 0 }} />
              <input 
                type="password" 
                placeholder="••••••••"
                style={{ marginLeft: 10, fontSize: '0.9rem', fontWeight: 600 }}
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#fff', border: '1px solid var(--grey-200)', color: 'var(--grey-700)', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn" style={{ flex: 2, background: 'var(--tata-blue)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', boxShadow: 'var(--shadow-blue)' }}>
              {loading ? 'Creating Account...' : 'Create DSE Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DealerRecords() {
  const { isDealer, user } = useAuth();
  const [dses, setDses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDse, setSelectedDse] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);

  const fetchDses = useCallback(async () => {
    try {
      const res = await api.get('/dealers/my/dses-stats');
      setDses(res.data.data);
      // Auto-select based on logic: If DSE, select themselves. If dealer, select first.
      if (res.data.data.length > 0) {
          if (user?.role === 'dse') {
              const me = res.data.data.find(d => d.full_name === user.full_name);
              setSelectedDse(me || res.data.data[0]);
          } else if (!selectedDse) {
              setSelectedDse(res.data.data[0]);
          } else {
              // Update stats for currently selected DSE
              const updatedSelection = res.data.data.find(d => d.id === selectedDse.id);
              if (updatedSelection) setSelectedDse(updatedSelection);
          }
      }
    } catch (err) {
      toast.error('Failed to load DSEs');
    } finally {
      setLoading(false);
    }
  }, [selectedDse, user]);

  useEffect(() => {
    fetchDses();
  }, []);

  const fetchLeads = useCallback(async (dseName) => {
    setLeadsLoading(true);
    try {
      const res = await api.get('/leads', { 
        params: { assigned_to_dse: dseName, limit: 100 } 
      });
      setLeads(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load leads for ' + dseName);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDse) {
      fetchLeads(selectedDse.full_name);
    } else {
        setLeads([]);
    }
  }, [selectedDse?.id, fetchLeads]);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>DSE Records</h2>
          <p>Sales Executive (DSE) Performance & Lead Tracking</p>
        </div>
        <div className="page-header-actions">
          {isDealer && (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsModalOpen(true)}
              style={{ borderRadius: 12, height: 44, padding: '0 20px', boxShadow: 'var(--shadow-blue)', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <UserPlus size={16} /> Add DSE
            </button>
          )}
        </div>
      </div>

      {dses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 24 }}>
          <div className="stat-icon blue" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: 16 }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No Sales Executives Found</h3>
          <p style={{ color: 'var(--grey-500)', maxWidth: 450, margin: '12px auto 24px', lineHeight: 1.6 }}>
            You haven't registered any DSEs for your dealership yet. New DSEs can be added by the dealer to start assigning tasks and tracking productivity.
          </p>
          {isDealer && (
            <button className="btn btn-primary" style={{ height: 48, padding: '0 32px' }} onClick={() => setIsModalOpen(true)}>
              <UserPlus size={18} /> Add Your First DSE
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Employee Tabs / Buttons */}
          <div className="nav-section-label" style={{ marginBottom: 12 }}>Select Team Member</div>
          <div className="dse-selection-strip" style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 24, 
            overflowX: 'auto', 
            padding: '4px 2px 14px',
            scrollbarWidth: 'thin'
          }}>
            {dses.map(dse => (
              <button
                key={dse.id}
                onClick={() => setSelectedDse(dse)}
                className={`dse-item-btn ${selectedDse?.id === dse.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderRadius: 16,
                  border: '1px solid',
                  borderColor: selectedDse?.id === dse.id ? 'var(--tata-blue)' : 'var(--grey-100)',
                  background: selectedDse?.id === dse.id ? 'var(--tata-blue)' : '#fff',
                  color: selectedDse?.id === dse.id ? '#fff' : 'var(--grey-700)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedDse?.id === dse.id ? '0 8px 16px -4px rgba(0, 58, 143, 0.25)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  background: selectedDse?.id === dse.id ? 'rgba(255,255,255,0.2)' : 'var(--grey-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 900
                }}>
                  {dse.full_name.charAt(0).toUpperCase()}
                </div>
                {dse.full_name}
                {user?.full_name === dse.full_name && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginLeft: 4 }}>You</span>}
              </button>
            ))}
          </div>

          {selectedDse && (
            <>
              {/* KPI Cards */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                <StatCard 
                    label="Total Appointments" 
                    value={selectedDse.total_assigned} 
                    icon={Briefcase} 
                    color="blue" 
                    sub="Overall workload" 
                />
                <StatCard 
                    label="Active Pending" 
                    value={selectedDse.total_pending} 
                    icon={AlertCircle} 
                    color="orange" 
                    sub="In Progress" 
                />
                <StatCard 
                    label="Total Completed" 
                    value={selectedDse.total_completed} 
                    icon={CheckCircle} 
                    color="green" 
                    sub="Visits Done" 
                />
                <StatCard 
                    label="Total Follow-ups" 
                    value={selectedDse.total_follow_up} 
                    icon={Clock} 
                    color="purple" 
                    sub="Scheduled Tasks" 
                />
              </div>

              {/* Leads Table */}
              <div className="card" style={{ border: 'none', boxShadow: '0 4px 25px rgba(0,0,0,0.06)', borderRadius: 20 }}>
                <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--grey-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                  <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--grey-900)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="stat-icon blue" style={{ width: 36, height: 36, borderRadius: 10 }}><Activity size={18} /></div>
                    {selectedDse.full_name}'s Assignment Records
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--grey-500)', fontWeight: 700, padding: '6px 14px', background: 'var(--grey-50)', borderRadius: 30 }}>
                      {leads.length} Records Found
                    </span>
                  </div>
                </div>
                
                <div className="card-body" style={{ padding: 0 }}>
                  {leadsLoading ? (
                    <div style={{ padding: 80, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                  ) : leads.length === 0 ? (
                    <div style={{ padding: 80, textAlign: 'center' }}>
                      <div style={{ color: 'var(--grey-200)', marginBottom: 16 }}><FileSpreadsheet size={48} /></div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--grey-400)' }}>No assignment history found for this DSE.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: 20 }}>
                      <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
                        <thead style={{ background: 'var(--grey-50)' }}>
                          <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px', width: '20%' }}>Customer Details</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interest</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                            <th style={{ padding: '16px 12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Field Visit</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>DSE Next Visit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((lead, idx) => (
                            <tr key={lead.id} style={{ 
                                transition: 'background 0.2s',
                                borderBottom: idx === leads.length - 1 ? 'none' : '1px solid var(--grey-50)'
                            }}>
                              <td style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                                <div style={{ fontWeight: 800, color: 'var(--grey-900)', fontSize: '0.9rem', marginBottom: 2 }}>{lead.full_name}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--grey-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--tata-blue)', opacity: 0.4 }} />
                                    Appointment: {new Date(lead.lead_date).toLocaleDateString()}
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 6, 
                                    fontWeight: 700, 
                                    color: 'var(--tata-blue)', 
                                    fontSize: '0.8rem', 
                                    background: 'var(--tata-blue-50)', 
                                    padding: '4px 8px', 
                                    borderRadius: 6, 
                                    width: 'fit-content',
                                    whiteSpace: 'nowrap'
                                }}>
                                  <Phone size={12} /> {lead.phone_number}
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--grey-600)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{lead.location}</div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <span className="badge badge-blue-soft" style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px' }}>{lead.model}</span>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--grey-700)' }}>
                                    {lead.budget ? (lead.budget.includes('₹') ? lead.budget : `₹${lead.budget}`) : '—'}
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <div style={{ 
                                    fontSize: '0.68rem', 
                                    fontWeight: 800, 
                                    padding: '3px 8px', 
                                    borderRadius: 6,
                                    background: lead.interest_level === 'Warm' ? 'var(--orange-50)' : (lead.interest_level === 'Hot' ? 'var(--red-50)' : 'var(--green-50)'),
                                    color: lead.interest_level === 'Warm' ? 'var(--yellow-700)' : (lead.interest_level === 'Hot' ? 'var(--red-700)' : 'var(--green-700)'),
                                    width: 'fit-content'
                                }}>
                                    {lead.interest_level || 'Cold'}
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                <span className={`badge status-${(lead.dse_status || 'In Progress').toLowerCase().replace(/ /g, '-')}`} style={{ fontWeight: 800, fontSize: '0.68rem', padding: '4px 10px' }}>
                                  {lead.dse_status || 'In Progress'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                                {lead.jio_tag_photo ? (
                                    <button 
                                        className="btn btn-sm btn-secondary" 
                                        style={{ fontSize: '0.65rem', height: 28, padding: '0 10px', borderRadius: 8 }}
                                        onClick={() => setPreviewImage(`${ASSET_BASE_URL}${lead.jio_tag_photo}`)}
                                    >
                                        View Image
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--grey-300)', fontWeight: 600 }}>No Image</span>
                                )}
                              </td>
                              <td style={{ padding: '16px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                                {lead.dse_follow_up_date ? (
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: 6, 
                                        color: 'var(--purple-700)', 
                                        background: '#F5F3FF',
                                        padding: '5px 10px', 
                                        borderRadius: 8, 
                                        fontWeight: 800, 
                                        fontSize: '0.78rem',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <Calendar size={12} />
                                        {new Date(lead.dse_follow_up_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </div>
                                ) : <span style={{ opacity: 0.15 }}>—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <AddDseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDses}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
                onClick={() => setPreviewImage(null)} 
                style={{ 
                    position: 'absolute', 
                    top: -40, 
                    right: 0, 
                    background: '#fff', 
                    border: 'none', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
              <X size={20} />
            </button>
            <img 
                src={previewImage} 
                alt="Field Visit" 
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
