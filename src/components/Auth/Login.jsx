import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import shopConfig from '../../config/shopConfig';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
      <div className="card" style={{ width: '400px', background: '#1a1a1a', border: '1px solid #e53935' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {shopConfig.logoUrl && <img src={shopConfig.logoUrl} alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />}
          <h2 style={{ color: '#ff9800' }}>Admin Login</h2>
        </div>
        {error && <p style={{ color: '#e53935', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #e53935' }} />
          <button type="submit" style={{ width: '100%', background: '#e53935' }}>Login</button>
        </form>
        <p style={{ marginTop: '10px', fontSize: '12px', textAlign: 'center', color: '#aaa' }}>Default: admin@restaurant.com / admin123</p>
      </div>
    </div>
  );
};

export default Login;