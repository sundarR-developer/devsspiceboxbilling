import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OrderTypeSelector from '../components/Dashboard/OrderTypeSelector';
import TableAllocation from '../components/Dashboard/TableAllocation';
import OrderCart from '../components/Orders/OrderCart';
import PaymentModal from '../components/Orders/PaymentModal';
import api from '../services/api';
import shopConfig from '../config/shopConfig';

const AdminDashboard = () => {
  const location = useLocation();

  // --- All existing state variables (unchanged) ---
  const [step, setStep] = useState('orderType');
  const [orderType, setOrderType] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComboId, setSelectedComboId] = useState(null);

  const [settleTableNumber, setSettleTableNumber] = useState('');
  const [tableOrders, setTableOrders] = useState([]);
  const [showSettleModal, setShowSettleModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [pendingTakeawayOrders, setPendingTakeawayOrders] = useState([]);
  const [showTakeawayModal, setShowTakeawayModal] = useState(false);

  const [selectedOrderForAdd, setSelectedOrderForAdd] = useState(null);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [extraItems, setExtraItems] = useState([]);
  const [addingItems, setAddingItems] = useState(false);

  const [orderToPay, setOrderToPay] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const theme = shopConfig.theme;

  // --- All existing useEffect, fetch, cart functions (no changes) ---
  useEffect(() => {
    fetchProducts();
    fetchCombos();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchCombos = async () => {
    try {
      const res = await api.get('/admin/combos');
      setCombos(res.data);
    } catch (err) {
      console.error('Failed to fetch combos', err);
    }
  };

  const fetchOrdersByTable = async () => {
    if (!settleTableNumber) return alert('Enter table number');
    try {
      const res = await api.get(`/orders/table/${settleTableNumber}`);
      setTableOrders(res.data);
      if (res.data.length === 0) alert('No pending orders');
      else setShowSettleModal(true);
    } catch (err) {
      alert('Error fetching orders');
    }
  };

  const searchOrders = async () => {
    if (!searchQuery.trim()) return alert('Enter Order ID or Phone');
    try {
      const res = await api.get(`/orders/search?q=${searchQuery}`);
      setSearchResults(res.data);
      if (res.data.length === 0) alert('No pending orders');
      else setShowSearchModal(true);
    } catch (err) {
      alert('Error searching');
    }
  };

  const fetchAllPendingTakeawayOnline = async () => {
    try {
      const res = await api.get('/orders/pending?type=takeaway-online');
      setPendingTakeawayOrders(res.data);
      if (res.data.length === 0) alert('No pending Takeaway/Online orders');
      else setShowTakeawayModal(true);
    } catch (err) {
      alert('Error fetching');
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product._id && item.unitPrice === product.price);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product._id && item.unitPrice === product.price
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }]);
    }
    setSelectedComboId(null);
  };

  const addComboToCart = (combo) => {
    const discountFactor = combo.discountedPrice / combo.originalPrice;
    const comboItems = combo.products.map(p => {
      const originalUnitPrice = p.productId.price;
      const discountedUnitPrice = originalUnitPrice * discountFactor;
      return {
        productId: p.productId._id,
        name: p.productId.name,
        quantity: p.quantity,
        unitPrice: discountedUnitPrice,
        total: discountedUnitPrice * p.quantity
      };
    });
    setCart(comboItems);
    setSelectedComboId(combo._id);
  };

  const removeFromCart = (productId, unitPrice) => {
    setCart(cart.filter(item => !(item.productId === productId && item.unitPrice === unitPrice)));
  };

  const updateQuantity = (productId, unitPrice, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, unitPrice);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId && item.unitPrice === unitPrice
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setOrderToPay(null);
    setShowSettleModal(false);
    setShowSearchModal(false);
    setShowTakeawayModal(false);
    setSelectedComboId(null);
    window.location.reload();
  };

  const addExtraItemToOrder = (product) => {
    const existing = extraItems.find(i => i.productId === product._id);
    if (existing) {
      setExtraItems(extraItems.map(i =>
        i.productId === product._id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
          : i
      ));
    } else {
      setExtraItems([...extraItems, {
        productId: product._id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }]);
    }
  };

  const removeExtraItem = (productId) => setExtraItems(extraItems.filter(i => i.productId !== productId));

  const updateExtraItemQuantity = (productId, qty) => {
    if (qty <= 0) return removeExtraItem(productId);
    setExtraItems(extraItems.map(i =>
      i.productId === productId
        ? { ...i, quantity: qty, total: qty * i.unitPrice }
        : i
    ));
  };

  const confirmAddItems = async () => {
    if (extraItems.length === 0) return alert('No items to add');
    setAddingItems(true);
    try {
      await api.put(`/orders/${selectedOrderForAdd._id}/add-items`, { items: extraItems });
      alert('Items added. Order updated.');
      setShowAddItemsModal(false);
      setExtraItems([]);
      setSelectedOrderForAdd(null);
      if (showSettleModal) fetchOrdersByTable();
      if (showSearchModal) searchOrders();
      if (showTakeawayModal) fetchAllPendingTakeawayOnline();
    } catch (err) {
      alert('Failed to add items');
    }
    setAddingItems(false);
  };

  // Category filter
  const categories = ['All', ...new Set(products.map(p => p.category).filter(c => c && c !== 'Uncategorized'))];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
  const groupedProducts = filteredProducts.reduce((groups, p) => {
    const cat = p.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
    return groups;
  }, {});

  const goHome = () => {
    setStep('orderType');
    setCart([]);
    setSelectedComboId(null);
  };

  // Sidebar navigation items (active detection based on current path)
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Kitchen Display', path: '/kitchen', icon: '🍳' },
    { name: 'Products', path: '/admin/products', icon: '🍔' },
    { name: 'Discounts', path: '/admin/discounts', icon: '🏷️' },
    { name: 'Combos', path: '/admin/combos', icon: '🎁' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📊' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Combo Reports', path: '/combo-reports', icon: '📋' },
    { name: 'Customer Reports', path: '/customer-reports', icon: '👥' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* 🔴 SIDEBAR */}
      <div style={{
        width: '260px',
        background: '#000000',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        borderRight: '1px solid #e53935'
      }}>
        <div>
          {shopConfig.logoUrl && (
            <img
              src={shopConfig.logoUrl}
              alt="Logo"
              style={{ width: '100%', marginBottom: '30px', borderRadius: '12px' }}
            />
          )}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#ff9800', marginBottom: '15px' }}>🍗 MENU</h3>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
              return (
                <Link
                  to={item.path}
                  key={item.name}
                  onClick={() => {
                    // If clicking Dashboard (home), reset the flow
                    if (item.path === '/') goHome();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    background: isActive ? '#e53935' : 'transparent',
                    cursor: 'pointer',
                    color: 'white',
                    textDecoration: 'none',
                    transition: '0.2s'
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{
          border: '1px solid #ff3d00',
          borderRadius: '16px',
          padding: '15px',
          textAlign: 'center',
          background: '#111'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🌶️</div>
          <p style={{ color: '#ff9800', margin: 0, fontWeight: 'bold' }}>
            Come Hungry,<br />Leave Happy!
          </p>
        </div>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
        {/* 🔥 HERO BANNER */}
        <div style={{
          background: 'linear-gradient(90deg, #000000, #e53935)',
          borderRadius: '24px',
          padding: '30px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px' }}>Welcome Back! 👋</h1>
            <p style={{ color: '#ff9800', fontSize: '1.2rem', marginBottom: '8px' }}>Smart Billing for Smarter Business</p>
            <p style={{ color: '#ddd', maxWidth: '500px' }}>
              Fast. Simple. Reliable. Manage your dine‑in, takeaway & online orders effortlessly.
            </p>
            <button
              onClick={() => document.getElementById('order-type-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'linear-gradient(90deg, #ff3d00, #ff9800)',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '40px',
                color: 'white',
                fontWeight: 'bold',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            >
              🚀 Let's Get Started →
            </button>
          </div>
          <img
            src="/images/banner.jpeg"
            alt="Spicy Food"
            style={{
              width: '380px',
              maxWidth: '100%',
              borderRadius: '24px',
              boxShadow: '0 10px 30px rgba(255,61,0,0.3)'
            }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/380x200?text=Spice+Box'; }}
          />
        </div>

        {/* Only show action cards & order type selection when on main dashboard (step === 'orderType') */}
        {step === 'orderType' && (
          <>
            {/* 🔥 ACTION CARDS */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
              <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00' }}>
                <h3 style={{ color: '#ff9800', marginBottom: '12px' }}>🧾 Settle Bill</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="Table No"
                    value={settleTableNumber}
                    onChange={e => setSettleTableNumber(e.target.value)}
                    style={{ flex: 1, background: '#2a2a2a', border: 'none', color: 'white', padding: '10px' }}
                  />
                  <button onClick={fetchOrdersByTable} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                    Find
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00' }}>
                <h3 style={{ color: '#ff9800', marginBottom: '12px' }}>🔍 Search Orders</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Order ID / Phone"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, background: '#2a2a2a', border: 'none', color: 'white', padding: '10px' }}
                  />
                  <button onClick={searchOrders} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                    Search
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00' }}>
                <h3 style={{ color: '#ff9800', marginBottom: '12px' }}>📦 Pending Orders</h3>
                <button onClick={fetchAllPendingTakeawayOnline} style={{ width: '100%', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                  Show All Pending
                </button>
              </div>
            </div>

            {/* 🔥 ORDER TYPE CARDS */}
            <div id="order-type-section" style={{ textAlign: 'center', marginTop: '20px' }}>
              <h2 style={{ color: '#ff9800', marginBottom: '25px' }}>🔥 Select Order Type 🔥</h2>
              <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { type: 'Dine-in', icon: '🍽️', title: 'Dine-in' },
                  { type: 'Takeaway', icon: '📦', title: 'Takeaway' },
                  { type: 'Online', icon: '🚚', title: 'Online Delivery' }
                ].map(opt => (
                  <div
                    key={opt.type}
                    style={{
                      width: '240px',
                      background: '#111',
                      padding: '25px',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      border: '1px solid #ff3d00',
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => {
                      setOrderType(opt.type);
                      setDeliveryPartner(null);
                      setStep(opt.type === 'Dine-in' ? 'table' : 'ordering');
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '3rem' }}>{opt.icon}</div>
                    <h3 style={{ color: '#ff9800', marginTop: '10px' }}>{opt.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* EXISTING ORDER FLOW (Table selection + ordering) – kept exactly as before */}
        {step !== 'orderType' && (
          <>
            {step === 'table' && (
              <TableAllocation
                onSelectTable={(table) => {
                  setSelectedTable(table);
                  setStep('ordering');
                }}
              />
            )}

            {step === 'ordering' && (
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 2 }}>
                  <h3 style={{ color: '#ff9800' }}>🍽️ Menu</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          background: selectedCategory === cat ? theme.primary : '#333',
                          borderRadius: theme.buttonRadius,
                          color: 'white',
                          padding: '6px 18px',
                          border: 'none'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {Object.keys(groupedProducts).map(category => (
                    <div key={category}>
                      <h3 style={{ color: theme.primary }}>{category}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        {groupedProducts[category].map(p => p.isAvailable && (
                          <div key={p._id} className="card" style={{ background: 'black', borderRadius: '16px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '50%', height: '15%', objectFit: 'cover', padding: '10px' }} />}
                              <div>
                                <h4>{p.name}</h4>
                                <p>₹{p.price}</p>
                                {p.description && <small>{p.description.substring(0, 60)}</small>}
                                <button onClick={() => addToCart(p)} style={{ background: theme.primary, borderRadius:'20px', padding: '10px 20px', border: 'none', marginTop: '50px' }}>Add to Cart</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <h3 style={{ color: theme.primary }}>🎁 Combos</h3>
                  <div className="grid">
                    {combos.map(combo => (
                      <div key={combo._id} className="card">
                        <h4>{combo.name}</h4>
                        <p><strong>Code:</strong> {combo.offerCode}</p>
                        <p><strong>Original:</strong> ₹{combo.originalPrice}</p>
                        <p><strong>Discounted:</strong> ₹{combo.discountedPrice}</p>
                        <p><strong>Includes:</strong> {combo.products.map(p => `${p.quantity}x ${p.productId.name}`).join(', ')}</p>
                        <p><small>Validity: {combo.validUntilDate ? `Until ${new Date(combo.validUntilDate).toLocaleDateString()}` : 'No expiry'} | {combo.maxUses ? `${combo.maxUses - (combo.usedCount || 0)} uses left` : 'Unlimited uses'}</small></p>
                        <button onClick={() => addComboToCart(combo)} style={{ background: theme.primary, borderRadius: theme.buttonRadius, padding: '10px 20px' }}>Add Combo</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <OrderCart
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    orderType={orderType}
                    tableNumber={selectedTable}
                    deliveryPartner={deliveryPartner}
                    comboId={selectedComboId}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ----- MODALS (unchanged) ----- */}
        {showSettleModal && (
          <div className="modal-overlay" style={{width: '25%', background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00', marginTop: '50px' }}><div className="modal">
            <h3 style={{ color: theme.primary }}>Table {settleTableNumber} Orders</h3>
            {tableOrders.map(order => (
              <div key={order._id} className="card">
                <p style={{ color: '#ff9800' }}>Order: {order._id.slice(-6)} | ₹{order.totalAmount} | {order.status}</p>
                <button onClick={() => { setOrderToPay(order); setShowSettleModal(false); setShowPayment(true); }} style={{ width: '50%', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
                <button onClick={() => { setSelectedOrderForAdd(order); setExtraItems([]); setShowAddItemsModal(true); setShowSettleModal(false); }} style={{ width: '50%', background: '#ffaa00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Add Items</button>
              </div>
            ))}
            <button style={ { background:'#2D2D2D', color:'#ffff', border:'1px solid #FF6B35'}} onClick={() => setShowSettleModal(false)}>Close</button>
          </div></div>
        )}

        {showSearchModal && (
          <div className="modal-overlay" style={{ background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00', marginTop: '50px' }}><div className="modal">
            <h3 style={{ color: theme.primary }}>Search Results</h3>
            {searchResults.map(order => (
              <div key={order._id} className="card">
                <p style={{ color: '#ff9800' }}>{order.orderType} | {order.customer?.name} | ₹{order.totalAmount}</p>
                <button onClick={() => { setOrderToPay(order); setShowSearchModal(false); setShowPayment(true); }} style={{ width: '50%', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
                <button onClick={() => { setSelectedOrderForAdd(order); setExtraItems([]); setShowAddItemsModal(true); setShowSearchModal(false); }} style={{  background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Add Items</button>
              </div>
            ))}
            <button style={ { background:'#2D2D2D', color:'#ffff', border:'1px solid #FF6B35'}} onClick={() => setShowSearchModal(false)}>Close</button>
          </div></div>
        )}

        {showTakeawayModal && (
          <div className="modal-overlay" style={{ background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00', marginTop: '50px' }}><div className="modal">
            <h3 style={{ color: theme.primary }}>Pending Takeaway/Online Orders</h3>
            {pendingTakeawayOrders.map(order => (
              <div key={order._id} className="card">
                <p style={{ color: '#ff9800' }}>{order.orderType} – {order.customer?.name} | ₹{order.totalAmount}</p>
                <button onClick={() => { setOrderToPay(order); setShowTakeawayModal(false); setShowPayment(true); }} style={{ width: '50%', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
                <button onClick={() => { setSelectedOrderForAdd(order); setExtraItems([]); setShowAddItemsModal(true); setShowTakeawayModal(false); }} style={{ width: '50%', background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Add Items</button>
              </div>
            ))}
            <button style={ { background:'#2D2D2D', color:'#ffff', border:'1px solid #FF6B35'}} onClick={() => setShowTakeawayModal(false)}>Close</button>
          </div></div>
        )}

        {showAddItemsModal && (
          <div className="modal-overlay" style={{ background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #ff3d00', marginTop: '50px' }}><div className="modal" style={{ width: '600px' }}>
            <h3 style={{ color: theme.primary }}>Add Items to Order #{selectedOrderForAdd?._id?.slice(-6)}</h3>
            <div className="grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {products.filter(p => p.isAvailable).map(p => (
                <div key={p._id} className="card">
                  <h5>{p.name} ₹{p.price}</h5>
                  <button onClick={() => addExtraItemToOrder(p)}>Add</button>
                </div>
              ))}
            </div>
            {extraItems.length > 0 && (
              <>
                <h4>Extra Items</h4>
                {extraItems.map(item => (
                  <div key={item.productId}>
                    {item.name} x <input type="number" value={item.quantity} onChange={e => updateExtraItemQuantity(item.productId, parseInt(e.target.value))} style={{ width: '60px' }} min="1" /> = ₹{item.total}
                    <button onClick={() => removeExtraItem(item.productId)}>X</button>
                  </div>
                ))}
                <button onClick={confirmAddItems} disabled={addingItems}>Confirm Add</button>
              </>
            )}
            <button style={ { background:'#2D2D2D', color:'#ffff', border:'1px solid #FF6B35'}} onClick={() => setShowAddItemsModal(false)}>Cancel</button>
          </div></div>
        )}

        {showPayment && orderToPay && (
          <PaymentModal order={orderToPay} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;