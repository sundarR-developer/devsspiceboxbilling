import React, { useState } from 'react';
import PaymentModal from './PaymentModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import api from '../../services/api';

const OrderCart = ({ cart, onUpdateQuantity, onRemove, orderType, tableNumber, deliveryPartner, comboId }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    // For Dine-in and Takeaway, ask for customer details first
    if (orderType === 'Dine-in' || orderType === 'Takeaway') {
      setShowCustomerModal(true);
    } else {
      // Online orders: proceed directly without details
      createOrder({});
    }
  };

  const createOrder = async (customer) => {
    setPlacing(true);
    try {
      const orderData = {
        orderType,
        tableNumber: orderType === 'Dine-in' ? tableNumber : null,
        deliveryPartner: orderType === 'Online' ? deliveryPartner : null,
        items: cart,
        customer,
        discountCode: discountCode.trim() || undefined,
        comboId: comboId || undefined
      };
      const res = await api.post('/orders', orderData);
      setOrderToPay(res.data);
      // Save customer details for payment modal (if not already there)
      setCustomerDetails(customer);
      setTimeout(() => {
        setShowPayment(true);
        setPlacing(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert(err.response?.data?.error || 'Failed to create order');
      setPlacing(false);
    }
  };

  const handleCustomerConfirm = (details) => {
    setShowCustomerModal(false);
    createOrder(details);
  };

  const handleCustomerCancel = () => {
    setShowCustomerModal(false);
  };

  return (
    <div className="card" style={{ background: '#1a1a1a', color: '#ddd' }}>
      <h3 style={{ color: '#ff9800' }}>🛒 Current Order</h3>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={`${item.productId}-${item.unitPrice}`} style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
              <span>{item.name} x </span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.productId, item.unitPrice, parseInt(e.target.value))}
                style={{ width: '50px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}
                min="1"
              />
              <span> = ₹{item.total}</span>
              <button onClick={() => onRemove(item.productId, item.unitPrice)} style={{ marginLeft: '10px', background: '#dc3545' }}>X</button>
            </div>
          ))}
          <hr style={{ borderColor: '#333' }} />
          <p>Subtotal: ₹{subtotal}</p>
          <h4 style={{ color: '#ff9800' }}>Total: ₹{total}</h4>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Discount Code (optional)"
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }}
            />
          </div>

          <button onClick={handlePlaceOrderClick} disabled={placing} style={{ background: '#e53935' , width: '100%', padding: '10px', fontSize: '16px', color: 'white' }}>
            {placing ? 'Placing order...' : 'Place Order & Pay'}
          </button>
          {placing && <p style={{ fontSize: '12px', marginTop: '5px' }}>Order sent to kitchen. Payment will open in 2 seconds...</p>}
        </>
      )}

      {showCustomerModal && (
        <CustomerDetailsModal
          onConfirm={handleCustomerConfirm}
          onCancel={handleCustomerCancel}
        />
      )}

      {showPayment && orderToPay && (
        <PaymentModal
          order={orderToPay}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            window.location.reload();
          }}
          preFilledCustomer={customerDetails}
        />
      )}
    </div>
  );
};

export default OrderCart;