import React, { useState, useEffect } from 'react';
import ComboForm from '../components/Admin/ComboForm';
import api from '../services/api';
import Layout from '../components/Layout';

const AdminCombos = () => {
  const [combos, setCombos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchCombos(); }, []);

  const fetchCombos = async () => {
    const res = await api.get('/admin/combos');
    setCombos(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this combo?')) {
      await api.delete(`/admin/combos/${id}`);
      fetchCombos();
    }
  };

  return (
    <Layout title="Combo Offers">
      <button style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { setEditing(null); setShowForm(true); }}>
        Add Combo
      </button>
      {showForm && <ComboForm combo={editing} onSuccess={() => { setShowForm(false); fetchCombos(); }} onCancel={() => setShowForm(false)} />}
      <table className="product-table" style={{ marginTop: '20px' }}>
        <thead><tr><th>Offer Code</th><th>Name</th><th>Original</th><th>Discounted</th><th>Valid Until</th><th>Uses Left</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {combos.map(c => (
            <tr key={c._id}>
              <td>{c.offerCode}</td><td>{c.name}</td><td>₹{c.originalPrice}</td><td>₹{c.discountedPrice}</td>
              <td>{c.validUntilDate ? new Date(c.validUntilDate).toLocaleDateString() : 'No expiry'}</td>
              <td>{c.maxUses ? c.maxUses - (c.usedCount || 0) : 'Unlimited'}</td>
              <td>{c.isActive ? 'Yes' : 'No'}</td>
              <td><button onClick={() => { setEditing(c); setShowForm(true); }} style={{ background: 'blue', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit
              </button> <button onClick={() => handleDelete(c._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default AdminCombos;