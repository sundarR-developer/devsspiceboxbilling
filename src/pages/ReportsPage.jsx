import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);

  const downloadReport = async (type, period, partner = '') => {
    setLoading(true);
    let url = '';
    if (type === 'payment') url = `/reports/payment?period=${period}`;
    else if (type === 'partner') url = `/reports/partner?period=${period}`;
    else if (type === 'top-products') url = `/reports/top-products-partner?period=${period}&partner=${partner}`;
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `${type}_${period}_${partner}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error(err);
      alert('Download failed');
    }
    setLoading(false);
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="card" style={{ background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>Payment Report (Cash vs Online)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('payment', 'daily')} disabled={loading}>Daily</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('payment', 'weekly')} disabled={loading}>Weekly</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('payment', 'monthly')} disabled={loading}>Monthly</button>
        </div>
      </div>

      <div className="card" style={{ background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>Swiggy & Zomato Orders Report</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('partner', 'daily')} disabled={loading}>Daily</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('partner', 'weekly')} disabled={loading}>Weekly</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('partner', 'monthly')} disabled={loading}>Monthly</button>
        </div>
      </div>

      <div className="card" style={{ background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>Most Sold Products (Swiggy & Zomato)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'daily', 'Swiggy')} disabled={loading}>Swiggy Daily</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'weekly', 'Swiggy')} disabled={loading}>Swiggy Weekly</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'monthly', 'Swiggy')} disabled={loading}>Swiggy Monthly</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'daily', 'Zomato')} disabled={loading}>Zomato Daily</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'weekly', 'Zomato')} disabled={loading}>Zomato Weekly</button>
          <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => downloadReport('top-products', 'monthly', 'Zomato')} disabled={loading}>Zomato Monthly</button>
        </div>
      </div>
      {loading && <p style={{ marginTop: '10px', color: '#ddd' }}>Generating report...</p>}
    </Layout>
  );
};

export default ReportsPage;