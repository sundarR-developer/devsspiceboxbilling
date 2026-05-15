import React, { useState } from 'react';

const OrderTypeSelector = ({ onSelectType }) => {
  const [type, setType] = useState('');
  const [partner, setPartner] = useState('');

  const handleNext = () => {
    if (type === 'Online' && !partner) {
      alert('Please select delivery partner');
      return;
    }
    onSelectType(type, partner || null);
  };

  return (
    <div className="card" style={{ backgroundColor: '#1a1a1a', border: '1px solid #e53935' }}>
      <h2 style={{ color: '#ff9800' }}>Select Order Type</h2>
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setType('Dine-in')} style={{ background: type === 'Dine-in' ? '#e53935' : '#333', color: 'white' }}>Dine-in</button>
        <button onClick={() => setType('Takeaway')} style={{ background: type === 'Takeaway' ? '#e53935' : '#333', color: 'white' }}>Takeaway</button>
        <button onClick={() => setType('Online')} style={{ background: type === 'Online' ? '#e53935' : '#333', color: 'white' }}>Online Delivery</button>
      </div>
      {type === 'Online' && (
        <select value={partner} onChange={e => setPartner(e.target.value)} style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}>
          <option value="">Select Partner</option>
          <option value="Swiggy">Swiggy</option>
          <option value="Zomato">Zomato</option>
        </select>
      )}
      {type && <button onClick={handleNext} style={{ marginTop: '20px' }}>Next</button>}
    </div>
  );
};

export default OrderTypeSelector;