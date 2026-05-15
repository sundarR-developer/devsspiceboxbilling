import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ComboForm = ({ combo, onSuccess, onCancel }) => {
  const [offerCode, setOfferCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [discountValue, setDiscountValue] = useState('');     // e.g., 350 or 20
  const [originalPrice, setOriginalPrice] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [validUntilDate, setValidUntilDate] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [computedDiscountedPrice, setComputedDiscountedPrice] = useState(0);

  useEffect(() => {
    api.get('/admin/products').then(res => setAllProducts(res.data));
    if (combo) {
      setOfferCode(combo.offerCode);
      setName(combo.name);
      setDescription(combo.description || '');
      // Determine discount type from existing data? By default assume fixed.
      // We'll store a new field 'discountType' in the combo object? Not in old combos.
      // For simplicity, we'll just populate discountedPrice and assume fixed.
      setDiscountType('fixed');
      setDiscountValue(combo.discountedPrice);
      setOriginalPrice(combo.originalPrice);
      setSelectedProducts(combo.products.map(p => ({ productId: p.productId._id, quantity: p.quantity })));
      setValidUntilDate(combo.validUntilDate ? combo.validUntilDate.split('T')[0] : '');
      setMaxUses(combo.maxUses || '');
      setIsActive(combo.isActive);
    }
  }, [combo]);

  const addProduct = () => setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  const updateProduct = (idx, field, value) => {
    const updated = [...selectedProducts];
    updated[idx][field] = value;
    setSelectedProducts(updated);
  };
  const removeProduct = (idx) => setSelectedProducts(selectedProducts.filter((_, i) => i !== idx));

  const computeOriginalPrice = () => {
    let total = 0;
    selectedProducts.forEach(item => {
      const product = allProducts.find(p => p._id === item.productId);
      if (product) total += product.price * item.quantity;
    });
    setOriginalPrice(total);
    // Recalculate discounted price if percentage type
    if (discountType === 'percentage' && discountValue) {
      setComputedDiscountedPrice(total * (1 - Number(discountValue) / 100));
    } else if (discountType === 'fixed') {
      setComputedDiscountedPrice(Number(discountValue) || 0);
    }
  };

  useEffect(() => {
    computeOriginalPrice();
  }, [selectedProducts, allProducts, discountType, discountValue]);

  const handleDiscountValueChange = (val) => {
    setDiscountValue(val);
    if (discountType === 'percentage') {
      const disc = originalPrice * (1 - Number(val) / 100);
      setComputedDiscountedPrice(isNaN(disc) ? 0 : disc);
    } else {
      setComputedDiscountedPrice(Number(val) || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerCode || !name || discountValue === '' || selectedProducts.length === 0) {
      alert('Please fill all required fields');
      return;
    }
    let finalDiscountedPrice = computedDiscountedPrice;
    if (discountType === 'percentage') {
      finalDiscountedPrice = originalPrice * (1 - Number(discountValue) / 100);
    } else {
      finalDiscountedPrice = Number(discountValue);
    }
    const data = {
      offerCode: offerCode.toUpperCase(),
      name,
      description,
      discountedPrice: Math.round(finalDiscountedPrice), // store the final price
      products: selectedProducts,
      validUntilDate: validUntilDate || null,
      maxUses: maxUses ? Number(maxUses) : null,
      isActive,
      // Optionally store the discount type/value for future editing (but not required)
    };
    try {
      if (combo) await api.put(`/admin/combos/${combo._id}`, data);
      else await api.post('/admin/combos', data);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save combo');
    }
  };

  return (
    <div className="modal-overlay"><div className="modal" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
      <h3>{combo ? 'Edit Combo' : 'New Combo'}</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Offer Code (unique, uppercase)" value={offerCode} onChange={e => setOfferCode(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
        <input placeholder="Combo Name (e.g., Chicken Bucket)" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginBottom: '10px' }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows="2" style={{ width: '100%', marginBottom: '10px' }} />
        <h4>Included Products</h4>
        {selectedProducts.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <select value={item.productId} onChange={e => updateProduct(idx, 'productId', e.target.value)} required>
              <option value="">Select Product</option>
              {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
            </select>
            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateProduct(idx, 'quantity', parseInt(e.target.value))} style={{ width: '80px' }} min="1" />
            <button type="button" onClick={() => removeProduct(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addProduct}>Add Product</button>

        <div style={{ marginTop: '10px' }}>
          <p><strong>Original Price (auto‑calculated):</strong> ₹{originalPrice}</p>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '15px' }}>
              <input type="radio" name="discountType" value="fixed" checked={discountType === 'fixed'} onChange={() => setDiscountType('fixed')} /> Fixed (₹)
            </label>
            <label>
              <input type="radio" name="discountType" value="percentage" checked={discountType === 'percentage'} onChange={() => setDiscountType('percentage')} /> Percentage (%)
            </label>
          </div>

          {discountType === 'fixed' ? (
            <input
              placeholder="Discounted Price (₹)"
              type="number"
              value={discountValue}
              onChange={e => handleDiscountValueChange(e.target.value)}
              required
              style={{ width: '100%', marginBottom: '10px' }}
            />
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                placeholder="Discount Percentage"
                type="number"
                value={discountValue}
                onChange={e => handleDiscountValueChange(e.target.value)}
                required
                style={{ flex: 1 }}
                min="0"
                max="100"
                step="1"
              />
              <span>% off</span>
            </div>
          )}
          <p><strong>Customer pays:</strong> ₹{Math.round(computedDiscountedPrice)}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Valid Until Date (optional):</label>
            <input type="date" value={validUntilDate} onChange={e => setValidUntilDate(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Max Uses (optional):</label>
            <input type="number" placeholder="Number of orders" value={maxUses} onChange={e => setMaxUses(e.target.value)} style={{ width: '100%' }} min="1" />
          </div>
        </div>
        <label style={{ display: 'block', marginBottom: '15px' }}>
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
        </label>
        <button type="submit">Save Combo</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div></div>
  );
};

export default ComboForm;