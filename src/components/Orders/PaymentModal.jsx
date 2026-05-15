import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import shopConfig from '../../config/shopConfig';

const PaymentModal = ({ order, onClose, onSuccess, preFilledCustomer }) => {
  const [customer, setCustomer] = useState(preFilledCustomer || { name: '', phone: '' });
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const orderType = order.orderType;

  useEffect(() => {
    if (orderType === 'Online') setMethod('Online');
    else setMethod('Cash');
  }, [orderType]);

  const printBill = (order, customer, paymentMethod) => {
    // ... (same as before, unchanged)
  };

  const handlePayment = async () => {
    // Only ask for details if they are not already provided and not Online
    if (orderType !== 'Online' && (!customer.name || !customer.phone)) {
      alert('Please enter name and phone number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/payment/process', {
        orderId: order._id,
        paymentMethod: method,
        customerName: customer.name,
        customerPhone: customer.phone
      });
      printBill(order, customer, method);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    socket.emit('join-order-room', order._id);
    socket.on('payment-confirmed', () => onSuccess());
    return () => socket.off('payment-confirmed');
  }, [order._id, onSuccess]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal" style={{ background: '#1a1a1a', color: '#ddd' }}>
        <h3 style={{ color: '#ff9800' }}>Payment for Order #{order._id.slice(-6)}</h3>
        <p>Total Amount: ₹{order.totalAmount}</p>
        {order.loyaltyApplied && <p style={{ color: '#ff9800' }}>🎉 Loyalty discount applied!</p>}
        
        {/* Only show customer input fields if no preFilledCustomer and order is not Online */}
        {orderType !== 'Online' && !preFilledCustomer && (
          <>
            <input
              type="text"
              placeholder="Customer Name"
              value={customer.name}
              onChange={e => setCustomer({...customer, name: e.target.value})}
              style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={e => setCustomer({...customer, phone: e.target.value})}
              style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}
            />
          </>
        )}

        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}
          disabled={orderType === 'Online'}
        >
          {orderType === 'Online' ? <option value="Online">Online</option> : <><option value="Cash">Cash</option><option value="UPI">UPI</option></>}
        </select>

        <button onClick={handlePayment} disabled={loading} style={{ background: '#e53935' }}>{loading ? 'Processing...' : 'Pay Now'}</button>
        <button onClick={onClose} style={{ background: '#666', marginTop: '10px' }}>Cancel</button>
      </div>
    </>
  );
};

export default PaymentModal;