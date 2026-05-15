import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DiscountForm = ({ discount, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (discount) {
      setName(discount.name);
      setType(discount.type);
      setValue(discount.value);
      setMinOrderAmount(discount.minOrderAmount);
      setIsActive(discount.isActive);
    }
  }, [discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !value) {
      alert('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    const data = {
      name,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      isActive
    };
    try {
      if (discount) await api.put(`/admin/discounts/${discount._id}`, data);
      else await api.post('/admin/discounts', data);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save discount');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '450px', background: '#1a1a1a' }}>
        <h3 style={{ color: '#ff9800' }}>{discount ? 'Edit Discount' : 'New Discount'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Name (e.g., WELCOME10)" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }} />
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
          <input type="number" placeholder="Value (e.g., 10 for 10% or 50 for ₹50)" value={value} onChange={e => setValue(e.target.value)} required style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }} />
          <input type="number" placeholder="Minimum Order Amount (₹) – 0 for no minimum" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }} />
          <label style={{ display: 'block', marginBottom: '15px', color: '#ddd' }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
          </label>
          <button type="submit" disabled={submitting} style={{ background: '#e53935' }}>{submitting ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: '10px', background: '#666' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm;