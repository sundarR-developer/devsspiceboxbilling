import React, { useState } from 'react';

const CustomerDetailsModal = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleConfirm = () => {
    if (!name.trim() || !phone.trim()) {
      alert('Please enter both name and phone number');
      return;
    }
    onConfirm({ name, phone });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onCancel}></div>
      <div className="modal" style={{ background: '#1a1a1a', width: '350px' }}>
        <h3 style={{ color: '#ff9800' }}>Customer Details</h3>
        <input
          type="text"
          placeholder="Customer Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', padding: '8px', borderRadius: '8px' }}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width: '100%', marginBottom: '20px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', padding: '8px', borderRadius: '8px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleConfirm} style={{ background: '#e53935', flex: 1 }}>Proceed to Payment</button>
          <button onClick={onCancel} style={{ background: '#666', flex: 1 }}>Cancel</button>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailsModal;