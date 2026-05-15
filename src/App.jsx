import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import KitchenView from './pages/KitchenView';
import AdminProducts from './pages/AdminProducts';
import AdminDiscounts from './pages/AdminDiscounts';
import AdminCombos from './pages/AdminCombos';
import EnhancedAnalytics from './pages/EnhancedAnalytics';
import ReportsPage from './pages/ReportsPage';
import api from './services/api';
import ComboReports from './pages/ComboReports';
import CustomerReports from './pages/CustomerReports';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete api.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/kitchen" element={token ? <KitchenView /> : <Navigate to="/login" />} />
        <Route path="/admin/products" element={token ? <AdminProducts /> : <Navigate to="/login" />} />
        <Route path="/admin/discounts" element={token ? <AdminDiscounts /> : <Navigate to="/login" />} />
        <Route path="/admin/combos" element={token ? <AdminCombos /> : <Navigate to="/login" />} />
        <Route path="/admin/analytics" element={token ? <EnhancedAnalytics /> : <Navigate to="/login" />} />
        <Route path="/reports" element={token ? <ReportsPage /> : <Navigate to="/login" />} />
        <Route path="/combo-reports" element={token ? <ComboReports /> : <Navigate to="/login" />} />
        <Route path="/customer-reports" element={token ? <CustomerReports /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;