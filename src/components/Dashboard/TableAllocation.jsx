import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TableAllocation = ({ onSelectTable }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      setError('Could not load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  if (loading) return <div className="card" style={{ background: '#1a1a1a', color: 'white' }}>Loading tables...</div>;
  if (error) return <div className="card" style={{ background: '#1a1a1a', color: 'white' }}>{error} <button onClick={fetchTables}>Retry</button></div>;
  if (tables.length === 0) return <div className="card" style={{ background: '#1a1a1a', color: 'white' }}>No tables found</div>;

  return (
    <div className="card" style={{ background: '#1a1a1a', border: '1px solid #e53935' }}>
      <h2 style={{ color: '#ff9800' }}>Select Table</h2>
      <div className="grid">
        {tables.map(table => (
          <button
            key={table.tableNumber}
            onClick={() => onSelectTable(table.tableNumber)}
            disabled={table.status === 'Occupied'}
            style={{
              padding: '20px',
              background: table.status === 'Occupied' ? '#555' : '#e53935',
              cursor: table.status === 'Occupied' ? 'not-allowed' : 'pointer',
              color: 'white'
            }}
          >
            Table {table.tableNumber} - {table.status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableAllocation;