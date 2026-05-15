import React, { useState, useEffect } from 'react';
import ProductForm from '../components/Admin/ProductForm';
import api from '../services/api';
import Layout from '../components/Layout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await api.get('/admin/products');
    setProducts(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <Layout title="Product Management">
      <button onClick={() => { setEditing(null); setShowForm(true); }} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
        Add Product
      </button>
      {showForm && <ProductForm product={editing} onSuccess={() => { setShowForm(false); fetchProducts(); }} onCancel={() => setShowForm(false)} />}
      <table className="product-table" style={{ marginTop: '20px' }}>
        <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Description</th><th>Available</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />}</td>
              <td>{p.name}</td><td>₹{p.price}</td><td>{p.category}</td><td>{p.description?.substring(0, 30)}</td><td>{p.isAvailable ? 'Yes' : 'No'}</td>
              <td><button onClick={() => { setEditing(p); setShowForm(true); }} style={{ background: 'blue', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Edit
              </button> <button onClick={() => handleDelete(p._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default AdminProducts;