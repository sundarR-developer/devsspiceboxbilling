import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesCharts = () => {
  const [period, setPeriod] = useState('daily');
  const [revenueData, setRevenueData] = useState({ labels: [], values: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    api.get(`/analytics/revenue?period=${period}`).then(res => {
      setTotalRevenue(res.data.totalRevenue);
      setRevenueData({
        labels: Object.keys(res.data.breakdown),
        values: Object.values(res.data.breakdown)
      });
    });
  }, [period]);

  const chartData = {
    labels: revenueData.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueData.values,
      backgroundColor: '#e53935',
      borderRadius: 8,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      tooltip: { backgroundColor: '#1f1f1f', titleColor: '#ff9800', bodyColor: '#ddd' }
    },
    scales: {
      x: { ticks: { color: '#ddd' }, grid: { color: '#333' } },
      y: { ticks: { color: '#ddd' }, grid: { color: '#333' } }
    }
  };

  return (
    <div className="card" style={{ background: '#1a1a1a', color: 'white' }}>
      <h3 style={{ color: '#ff9800' }}>Revenue Breakdown</h3>
      <select value={period} onChange={e => setPeriod(e.target.value)} style={{ marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <h2 style={{ color: '#ff9800' }}>Total Revenue: ₹{totalRevenue}</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SalesCharts;