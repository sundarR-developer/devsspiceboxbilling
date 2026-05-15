import React, { useState, useEffect } from 'react';
import socket from '../services/socket';
import api from '../services/api';
import Layout from '../components/Layout';
import shopConfig from '../config/shopConfig';

const KitchenView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/pending');
      setOrders(res.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    socket.emit('join-kitchen');
    socket.on('new-order', order => { if (order.status !== 'Paid') setOrders(prev => [...prev, order]); });
    socket.on('order-status-updated', ({ orderId, status }) => setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o)));
    socket.on('order-updated', ({ orderId, order }) => setOrders(prev => prev.map(o => o._id === orderId ? order : o)));
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
      socket.off('order-updated');
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async (orderId, status) => await api.put('/orders/status', { orderId, status });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#ff9800';
      case 'Preparing': return '#2196f3';
      case 'Ready': return '#4caf50';
      default: return '#999';
    }
  };

  return (
    <Layout title="Kitchen Display">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={fetchPendingOrders} disabled={loading} style={{ background: '#e53935', padding: '10px 20px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <p style={{ marginBottom: '10px', color: '#ddd' }}>Last updated: {lastUpdate.toLocaleTimeString()} | Orders shown: Pending, Preparing, Ready (Paid hidden)</p>
      <div className="grid">
        {orders.length === 0 ? <p>No pending orders.</p> : orders.map(order => (
          <div key={order._id} className="card" style={{ borderLeft: `5px solid ${getStatusColor(order.status)}`, background: '#1a1a1a' }}>
            <h3 style={{ color: '#ff9800' }}>{order.orderType} {order.tableNumber && `- Table ${order.tableNumber}`}</h3>
            <p>Order ID: {order._id.slice(-6)}</p>
            <p>Status: <strong style={{ color: getStatusColor(order.status) }}>{order.status}</strong></p>
            <p>Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
            <ul style={{ color: '#ddd' }}>
              {order.items.map((item, idx) => (
                <li key={idx} style={{ fontWeight: item.isNew ? 'bold' : 'normal' }}>
                  {item.name} x {item.quantity}
                  {item.isNew && <span style={{ marginLeft: '8px', color: '#e53935' }}>(new)</span>}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '10px' }}>
              {order.status === 'Pending' && <button onClick={() => updateStatus(order._id, 'Preparing')}>Start Preparing</button>}
              {order.status === 'Preparing' && <button onClick={() => updateStatus(order._id, 'Ready')}>Mark Ready</button>}
              {order.status === 'Ready' && <button disabled>Ready for serving</button>}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default KitchenView;