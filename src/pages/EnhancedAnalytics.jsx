import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SalesCharts from '../components/Analytics/SalesCharts';
import api from '../services/api';
import Layout from '../components/Layout';

const EnhancedAnalytics = () => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    api.get('/analytics/top-items').then(res => setTopProducts(res.data));
  }, []);

  return (
    <Layout title="Advanced Analytics">
      <SalesCharts />
      <div className="card" style={{ background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>Top Selling Products (All time)</h3>
        <ul style={{ color: '#ddd' }}>
          {topProducts.map(p => <li key={p.name}>{p.name} – {p.qty} units</li>)}
        </ul>
      </div>
    </Layout>
  );
};

export default EnhancedAnalytics;