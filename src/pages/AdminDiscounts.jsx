import React, { useState, useEffect } from 'react';
import DiscountForm from '../components/Admin/DiscountForm';
import api from '../services/api';
import Layout from '../components/Layout';

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchDiscounts(); }, []);

  const fetchDiscounts = async () => {
    const res = await api.get('/admin/discounts');
    setDiscounts(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this discount?')) {
      await api.delete(`/admin/discounts/${id}`);
      fetchDiscounts();
    }
  };

  return (
    <Layout title="Discount Management">
      <button onClick={() => { setEditing(null); setShowForm(true); }} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
        Add Discount
      </button>
      {showForm && <DiscountForm discount={editing} onSuccess={() => { setShowForm(false); fetchDiscounts(); }} onCancel={() => setShowForm(false)} />}
      <table className="product-table" style={{ marginTop: '20px' }}>
        <thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Min Order</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {discounts.map(d => (
            <tr key={d._id}>
              <td>{d.name}</td><td>{d.type === 'percentage' ? 'Percentage (%)' : 'Fixed (₹)'}</td><td>{d.value}{d.type === 'percentage' ? '%' : '₹'}</td>
              <td>₹{d.minOrderAmount}</td><td>{d.isActive ? 'Yes' : 'No'}</td>
              <td><button onClick={() => { setEditing(d); setShowForm(true); }} style={{ background: 'blue', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit
              </button> <button onClick={() => handleDelete(d._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default AdminDiscounts;