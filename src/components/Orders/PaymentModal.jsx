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

  // ========== PRINT FUNCTION (with pop‑up, but catches blockers) ==========
  const printBill = (order, customer, paymentMethod) => {
    const logoAbsoluteUrl = shopConfig.logoUrl ? `${window.location.origin}${shopConfig.logoUrl}` : '';
    const printContent = `
      <html>
        <head>
          <title>Bill Receipt</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .items { width: 100%; margin: 10px 0; }
            .items th, .items td { text-align: left; padding: 5px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoAbsoluteUrl ? `<img src="${logoAbsoluteUrl}" style="width:80px; height:auto; margin-bottom:8px;" />` : ''}
            <h2>${shopConfig.name}</h2>
            <p>${shopConfig.address}</p>
            <p>Phone: ${shopConfig.phone}</p>
            <p>GST: ${shopConfig.gst}</p>
          </div>
          <div class="divider"></div>
          <p><strong>Order #:</strong> ${order._id.slice(-6)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Customer:</strong> ${customer.name || 'N/A'} (${customer.phone || 'N/A'})</p>
          <p><strong>Order Type:</strong> ${order.orderType} ${order.tableNumber ? `Table ${order.tableNumber}` : ''}</p>
          <div class="divider"></div>
          <table class="items">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice}</td>
                  <td>₹${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
          ${order.loyaltyApplied ? '<p><strong>Loyalty Discount (10%):</strong> Applied</p>' : ''}
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <div class="divider"></div>
          <div class="footer">
            <p>Thank you for visiting us!</p>
            <p>** Computer generated receipt **</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    } else {
      alert('Please allow pop-ups for this site to print the bill.');
    }
  };
  // ========== END PRINT FUNCTION ==========

  const handlePayment = async () => {
    // For Dine-in/Takeaway, require customer details if not already provided
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
      // Auto‑print after successful payment
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
        
        {/* Customer details fields – only show if not pre‑filled and not Online */}
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
          {orderType === 'Online' ? (
            <option value="Online">Online</option>
          ) : (
            <>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </>
          )}
        </select>

        <button onClick={handlePayment} disabled={loading} style={{ background: '#e53935' }}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
        <button onClick={onClose} style={{ background: '#666', marginTop: '10px' }}>Cancel</button>
      </div>
    </>
  );
};

export default PaymentModal;