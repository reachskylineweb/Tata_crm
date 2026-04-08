import React, { useState, useEffect } from 'react';
import { Search, FileX, Calendar, MapPin, Truck, Phone } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function DuplicateLeads() {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, total_pages: 0 });

  const fetchDuplicates = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/leads/duplicates/all', {
        params: { page, limit: pagination.limit, search }
      });
      setDuplicates(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load duplicate leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, [pagination.page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--grey-900)', marginBottom: 8 }}>
            Duplicate Datas
          </h1>
          <p style={{ color: 'var(--grey-500)', fontSize: '0.9rem' }}>
            Leads skipped during upload because their phone number already exists in the system.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-input-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search duplicates..." 
              value={search}
              onChange={handleSearch}
              style={{ width: 300, minHeight: 40, borderRadius: 100 }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)', borderRadius: 16, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 150, paddingLeft: 24 }}>Lead Date</th>
                <th style={{ minWidth: 200 }}>Name</th>
                <th style={{ minWidth: 150 }}>Phone Number</th>
                <th style={{ minWidth: 150 }}>Location</th>
                <th style={{ minWidth: 150 }}>Vehicle Model</th>
                <th style={{ minWidth: 250, paddingRight: 24 }}>Upload Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>Loading duplicates...</td></tr>
              ) : duplicates.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 60, color: 'var(--grey-400)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <FileX size={40} style={{ opacity: 0.5 }} />
                      <p style={{ fontWeight: 600, fontSize: '1rem' }}>No duplicate leads found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                duplicates.map(lead => (
                  <tr key={lead.id}>
                    <td style={{ paddingLeft: 24 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--grey-600)', background: 'var(--grey-50)', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>
                        <Calendar size={12} />
                        {new Date(lead.lead_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 700, color: 'var(--tata-blue)' }}>{lead.full_name}</span></td>
                    <td>
                      <span style={{ color: 'var(--red-600)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} /> {lead.phone_number || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--grey-700)' }}>
                        <MapPin size={12} style={{ color: 'var(--grey-400)' }} /> {lead.location}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--tata-blue)', background: 'var(--tata-blue-50)', padding: '4px 10px', borderRadius: 6 }}>
                        <Truck size={12} /> {lead.model || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ paddingRight: 24, fontSize: '0.8rem', color: 'var(--grey-500)' }}>{lead.upload_file || 'Unknown'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.total_pages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--grey-50)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--grey-500)', fontWeight: 600 }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} duplicates
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-secondary" 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary" 
                disabled={pagination.page === pagination.total_pages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
