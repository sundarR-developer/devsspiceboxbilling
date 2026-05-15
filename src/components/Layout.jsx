import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import shopConfig from '../config/shopConfig';

const Layout = ({ children, title }) => {
  const location = useLocation();

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
      {/* Sidebar */}
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
            <img src={shopConfig.logoUrl} alt="Logo" style={{ width: '100%', marginBottom: '30px', borderRadius: '12px' }} />
          )}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#ff9800', marginBottom: '15px' }}>🍗 MENU</h3>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
              return (
                <Link
                  to={item.path}
                  key={item.name}
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
        {title && <h1 style={{ color: '#ff9800', marginBottom: '20px' }}>{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default Layout;