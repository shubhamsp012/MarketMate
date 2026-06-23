import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

function Orders() {
  const navigate = useNavigate();
  const [orderLogs, setOrderLogs] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user')) || { role: 'buyer', id: null };
  const token = localStorage.getItem('token');

  const fetchOrderHistoryData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (user.role === 'seller') {
        const response = await axios.get('http://localhost:5000/api/orders/seller-sales', config);
        setSalesLogs(response.data || []);
      } else {
        const response = await axios.get('http://localhost:5000/api/orders/buyer-orders', config);
        setOrderLogs(response.data || []);
      }
    } catch (error) {
      console.error("Error retrieving order registry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrderHistoryData();
  }, [token, user.role]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, { order_status: newStatus }, config);
      alert("Logistics status updated!");
      fetchOrderHistoryData(); 
    } catch (error) {
      alert("Unable to modify order state metrics.");
    }
  };

  if (loading) {
    return (
      <div className="orders-page-loading">
        <div className="spinner"></div>
        <p>Syncing your transaction ledger history...</p>
      </div>
    );
  }

  return (
    <div className="orders-fullpage-container" style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="orders-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>
            {user.role === 'seller' ? '📈 Merchant Sales Registry' : '📦 Procurement Order History'}
          </h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0 0' }}>Manage and track all dedicated marketplace transactions.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="back-profile-btn" style={{ background: '#111', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          ← Back to Profile
        </button>
      </div>

      {user.role === 'seller' ? (
        /* SELLER CONTENT STREAM */
        <div className="ledger-items-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {salesLogs.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>No incoming sales logged yet.</p>
          ) : (
            salesLogs.map((log, i) => (
              <div key={log.id || i} className="ledger-row-card detailed-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e9ecef', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  
                  {/* 🚨 FIXED: object-fit renamed to objectFit camelCase property syntax */}
                  <div className="order-item-thumbnail" style={{ width: '70px', height: '70px', background: '#f8f9fa', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {log.image ? (
                      <img src={`http://localhost:5000${log.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#999' }}>No Image</span>
                    )}
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>ID: #MM-SALE-{log.id}</span>
                    <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: '#111' }}>{log.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>Customer: <strong>{log.buyer_name || 'Verified Buyer'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: '800', fontSize: '1.2rem' }}>₹{Number(log.total_price).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Qty: {log.quantity} ({log.payment_method})</span>
                  </div>
                  <select 
                    value={log.order_status} 
                    onChange={(e) => handleStatusChange(log.id, e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', border: '1px solid #111' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* BUYER CONTENT STREAM */
        <div className="ledger-items-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orderLogs.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>You haven't committed any checkout query orders yet.</p>
          ) : (
            orderLogs.map((log, i) => (
              <div key={log.id || i} className="ledger-row-card detailed-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e9ecef', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  
                  {/* 🚨 FIXED: object-fit renamed to objectFit camelCase property syntax */}
                  <div className="order-item-thumbnail" style={{ width: '70px', height: '70px', background: '#f8f9fa', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {log.image ? (
                      <img src={`http://localhost:5000${log.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#999' }}>No Image</span>
                    )}
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>ID: #MM-ORD-{log.id}</span>
                    <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: '#111' }}>{log.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>Merchant: <strong>{log.seller_name || 'Verified Merchant'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: '800', fontSize: '1.2rem' }}>₹{Number(log.total_price).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Qty: {log.quantity} ({log.payment_method})</span>
                  </div>
                  <span style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '800', background: log.order_status === 'DELIVERED' ? '#e0f0e0' : '#e5f0fa', color: log.order_status === 'DELIVERED' ? '#006600' : '#0044cc' }}>
                    {log.order_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;