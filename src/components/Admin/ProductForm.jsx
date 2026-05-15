import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setCategory(product.category);
      setDescription(product.description || '');
      setImageUrl(product.imageUrl || '');
      setIsAvailable(product.isAvailable);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', Number(price));
    formData.append('category', category);
    formData.append('description', description);
    formData.append('isAvailable', isAvailable);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl && !product?.imageUrl?.startsWith('/uploads')) {
      formData.append('imageUrl', imageUrl);
    }
    try {
      if (product) {
        await api.put(`/admin/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
    setUploading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '600px', background: '#1a1a1a', paddingLeft: '20px', paddingRight: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
        <h3 style={{ color: '#ff9800' }}>{product ? 'Edit Product' : 'New Product'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required style={{ width: '95%',borderRadius: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', paddingLeft: '10px' }} />
          <input type="number" placeholder="Price (₹)" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '95%', borderRadius: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', paddingLeft: '10px' }} />
          <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} style={{ width: '95%', borderRadius: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', paddingLeft: '10px' }} />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ width: '95%', borderRadius: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', paddingLeft: '10px' }} />
          <input type="text" placeholder="Image URL (optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: '95%', borderRadius: '10px', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935', paddingLeft: '10px' }} />
          <div style={{ marginBottom: '10px' }}>
            <label style={{ color: '#ff9800' }}>OR upload image file:</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ background: 'none', display: 'block', marginTop: '5px', background: '#e81515', color: 'white', border: '1px solid #e53935' }} />
          </div>
          <label style={{ display: 'block', marginBottom: '10px', color: '#ff9800' }}>
            <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} /> Available
          </label>
          <button type="submit" disabled={uploading} style={{ background: '#e53935', padding: '10px 20px', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer' }}>{uploading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: '10px', background: '#666', padding: '10px 20px', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;