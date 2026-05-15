import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

const ComboReports = () => {
  const [loading, setLoading] = useState(false);

  const downloadReport = async (period) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/combo-usage?period=${period}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `combo_usage_${period}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    }
    setLoading(false);
  };

  return (
    <Layout title="Combo Usage Reports">
      <div className="card" style={{ background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>Combo Performance</h3>
        <p style={{ color: '#ddd' }}>Download Excel report showing how many times each combo was used, revenue generated, and average discount.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button style={{ background: '#e53935', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('daily')} disabled={loading}>Daily Report</button>
          <button style={{ background: '#e53935', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('weekly')} disabled={loading}>Weekly Report</button>
          <button style={{ background: '#e53935', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('monthly')} disabled={loading}>Monthly Report</button>
        </div>
        {loading && <p style={{ marginTop: '10px', color: '#ddd' }}>Generating report...</p>}
      </div>
    </Layout>
  );
};

export default ComboReports;