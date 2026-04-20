import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import api from '../services/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Reports() {
  const { dateFrom, setDateFrom, dateTo, setDateTo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const res = await api.get('/reports/dealer-performance', {
        params: { date_from: dateFrom, date_to: dateTo }
      });
      const cleanedData = (res.data.data || []).map(d => ({
        ...d,
        dealer_name: (d.dealer_name || '').replace(/\s*Dealer\s*Partner\s*/gi, '')
      }));
      setData(cleanedData);
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExportCSV = () => {
    if (!data || data.length === 0) { toast.error('No data to export'); return; }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Dealer Name,Total Leads,Completed,In Progress,On Call,Follow-ups Done,Completed Percentage %\n';
    data.forEach(d => {
      csvContent += `"${d.dealer_name}",${d.total_leads},${d.completed},${d.in_progress},${d.on_call},${d.leads_with_followup},${d.conversion_rate}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TataMotors_CRM_Report.csv');
    link.click();
    toast.success('CSV Downloaded');
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Analytics & Reports</h2>
          <p>Export and analyze lead performance data</p>
        </div>
      </div>

      {/* Optimized Filters */}
      <div className="card" style={{ marginBottom: 20, borderRadius: 16 }}>
        <div className="card-body" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
             <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                background: 'var(--grey-50)', 
                padding: '0 16px', 
                borderRadius: 12, 
                border: '1px solid var(--grey-100)',
                height: 44,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
             }}>
                <Calendar size={18} style={{ color: 'var(--tata-blue)', opacity: 0.8 }} />
                <input 
                  type="date" 
                  className="date-input-clean" 
                  style={{ border: 'none', background: 'transparent', height: '100%', fontSize: '0.85rem', fontWeight: 600, color: 'var(--grey-700)', outline: 'none', width: 125 }} 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                />
                <span style={{ color: 'var(--grey-300)', fontWeight: 700, fontSize: '0.9rem' }}>→</span>
                <input 
                  type="date" 
                  className="date-input-clean" 
                  style={{ border: 'none', background: 'transparent', height: '100%', fontSize: '0.85rem', fontWeight: 600, color: 'var(--grey-700)', outline: 'none', width: 125 }} 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                />
             </div>
             <button 
               className="btn btn-primary" 
               onClick={fetchData} 
               style={{ borderRadius: 12, padding: '0 20px', height: 44, boxShadow: 'var(--shadow-blue)' }}
             >
               <Filter size={16} /> Apply
             </button>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV} 
            style={{ borderRadius: 12, height: 44, padding: '0 20px', borderStyle: 'dashed', borderWidth: '1.5px' }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" /></div>
      ) : (
        <div className="dashboard-grid">
          <div className="card col-12">
            <div className="card-header"><div className="card-title"><TrendingUp size={16} /> Dealer Performance Analytics (%)</div></div>
            <div className="card-body chart-card-body" style={{ padding: '24px 10px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data || []} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey-50)" />
                  <XAxis dataKey="dealer_name" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--grey-500)' }} interval={0} angle={-30} textAnchor="end" dy={15} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--grey-400)' }} unit="%" />
                  <Tooltip cursor={{ fill: 'var(--grey-50)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                  <Bar dataKey="conversion_rate" name="Completed %" fill="var(--tata-blue)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

