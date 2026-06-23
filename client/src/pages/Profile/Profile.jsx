import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  
  // TABS MATRIX: 'parameters' (Account) | 'ledger' (Orders/Sales)
  const [activeSection, setActiveSection] = useState('parameters');
  
  // SUB-TAB FOR SELLERS WHO ALSO BUY: 'sales' | 'purchases'
  const [sellerSubTab, setSellerSubTab] = useState('sales');

  // 🚨 EDIT MODE CONTROLLERS STATE NODES
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  const [orderLogs, setOrderLogs] = useState([]); 
  const [salesLogs, setSalesLogs] = useState([]);  
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  // Parse local session profile storage parameters
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com', role: 'buyer', id: null, address: '' };
  const token = localStorage.getItem('token');

  // Synchronize form states whenever edit container triggers open
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [isEditing]);

  const fetchCompleteHistoryNodes = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      setLoadingFeeds(true);

      if (user.role === 'seller') {
        const [salesRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/orders/seller-sales', config),
          axios.get('http://localhost:5000/api/orders/buyer-orders', config)
        ]);
        setSalesLogs(salesRes.data || []);
        setOrderLogs(ordersRes.data || []);
      } else {
        const response = await axios.get('http://localhost:5000/api/orders/buyer-orders', config);
        setOrderLogs(response.data || []);
      }
    } catch (error) {
      console.error("Error mining full history maps:", error);
    } finally {
      setLoadingFeeds(false);
    }
  };

  useEffect(() => {
    if (token) fetchCompleteHistoryNodes();
  }, [token, user.role]);

  // UPDATE PROFILE METRICS HANDLER DISPATCHER
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Axios request to update user details backend table arrays
      const response = await axios.put('http://localhost:5000/api/auth/update-profile', editFormData, config);
      
      // Update LocalStorage token metadata mapping fields
      const updatedUser = { ...user, ...editFormData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert("Profile updated successfully!");
      setIsEditing(false);
      
      // Force reload layout states arrays execution loops
      window.location.reload(); 
    } catch (error) {
      console.error("Profile synchronization collapsed:", error);
      alert(error.response?.data?.message || "Unable to re-index profile properties variables.");
    }
  };

  const handleStatusChange = async (orderId, currentTargetValue) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/status/${orderId}`, { order_status: currentTargetValue }, config);
      
      alert("Logistics operational status updated!");
      fetchCompleteHistoryNodes(); 
    } catch (error) {
      console.error("Status synchronization failed:", error);
      alert("Unable to override order state metrics.");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="profile-fullpage-viewport">
      <div className="profile-dashboard-layout">
        
        {/* LEFT COLUMN: IDENTITY & SECTION CONTROLS */}
        <aside className="profile-sidebar-node">
          <div className="sidebar-identity-card">
            <div className="profile-avatar-sphere">
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <h2 className="user-title-h2">{user.name}</h2>
            <span className="user-role-chip">{user.role.toUpperCase()}</span>
            <p className="user-email-meta">{user.email}</p>
          </div>

          <div className="sidebar-action-menu">
            <h3>Menu</h3>
            
            <button 
              onClick={() => { setActiveSection('parameters'); setIsEditing(false); }} 
              className={`sidebar-tab-btn ${activeSection === 'parameters' ? 'active-accent' : ''}`}
            >
              Account Details
            </button>

            <button 
              onClick={() => { setActiveSection('ledger'); setIsEditing(false); }} 
              className={`sidebar-tab-btn ${activeSection === 'ledger' ? 'active-accent' : ''}`}
            >
              📦 Activity & Order Logs
            </button>

            <hr className="inner-menu-divider" style={{ border: '0', height: '1px', background: '#eee', margin: '1rem 0' }} />
            
            <h3>Utilities</h3>
            {user?.role === 'seller' && (
              <>
                <Link to="/add-product" className="sidebar-link-btn">
                  ➕ Add New Product
                </Link>
                <Link to="/manage-products" className="sidebar-link-btn">
                  📋 Manage My Listings
                </Link>
              </>
            )}
            
            <Link to="/dashboard" className="sidebar-link-btn">
              🛍️ Open Marketplace
            </Link>
          </div>

          <div className="sidebar-footer-lock">
            <button className="profile-logout-trigger-flat" onClick={logout}>
              Logout
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: DYNAMIC SYSTEM FEED PANELS */}
        <main className="profile-main-content-stream">
          
          {/* SECTION 1: ACCOUNT DETAILS / PROFILE EDIT SYSTEM CONTAINER */}
          {activeSection === 'parameters' && (
            <div className="data-ledger-wrapper info-section-fade">
              <div className="ledger-header-row">
                <h2>{isEditing ? "⚙️ Edit Profile Specifications" : "🛡️ Core Account Parameters"}</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="profile-edit-trigger-btn">
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
              
              {!isEditing ? (
                /* RAW READ-ONLY MODE LAYOUT VIEW SHEET */
                <div className="profile-info-grid-embedded">
                  <div className="info-row-item">
                    <span className="row-item-label">Full Profile Identity</span>
                    <strong className="row-item-value">{user.name}</strong>
                  </div>
                  <div className="info-row-item">
                    <span className="row-item-label">Verified Email Node</span>
                    <strong className="row-item-value">{user.email}</strong>
                  </div>
                  <div className="info-row-item">
                    <span className="row-item-label">System Security Role</span>
                    <strong className="row-item-value role-badge-pill">{user.role.toUpperCase()} LEVEL</strong>
                  </div>
                  <div className="info-row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span className="row-item-label">Physical Shipping / Node Address</span>
                    <strong className="row-item-value" style={{ fontSize: '0.92rem', color: '#333', lineHeight: '1.4', fontWeight: '600' }}>
                      {user.address || '⚠️ No delivery parameters logged inside this account node yet.'}
                    </strong>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE EDIT INPUT INTERFACE COMPONENT LAYER */
                <form onSubmit={handleUpdateProfile} className="profile-edit-form-wrapper">
                  <div className="edit-input-group">
                    <label>Profile Identifier Name:</label>
                    <input 
                      type="text" 
                      value={editFormData.name} 
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="edit-input-group">
                    <label>System Email Location Node:</label>
                    <input 
                      type="email" 
                      value={editFormData.email} 
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                      required 
                    />
                  </div>

                  <div className="edit-input-group">
                    <label>Physical Shipping / Destination Matrix Address:</label>
                    <textarea 
                      value={editFormData.address} 
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} 
                      rows="4"
                      placeholder="Enter full routing destination details..."
                    />
                  </div>

                  <div className="edit-actions-block-flex">
                    <button type="submit" className="save-metrics-btn">Commit Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-edit-btn">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* SECTION 2: DUAL ACTIVITY LEDGERS CONTAINER */}
          {activeSection === 'ledger' && (
            <div className="info-section-fade">
              {loadingFeeds ? (
                <div className="feed-sync-spinner"><div className="spinner-ring"></div><p>Syncing activity ledger arrays...</p></div>
              ) : (
                <div className="data-ledger-wrapper">
                  
                  {user.role === 'seller' ? (
                    <div className="seller-dual-profile-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.75rem' }}>
                      <button 
                        onClick={() => setSellerSubTab('sales')} 
                        style={{ background: sellerSubTab === 'sales' ? '#111' : 'transparent', color: sellerSubTab === 'sales' ? '#fff' : '#111', border: '1px solid #111', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        📈 My Sales Performance ({salesLogs.length})
                      </button>
                      <button 
                        onClick={() => setSellerSubTab('purchases')} 
                        style={{ background: sellerSubTab === 'purchases' ? '#111' : 'transparent', color: sellerSubTab === 'purchases' ? '#fff' : '#111', border: '1px solid #111', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🛍️ My Procured Purchases ({orderLogs.length})
                      </button>
                    </div>
                  ) : (
                    <div className="ledger-header-row">
                      <h2>📦 Order History Registry</h2>
                      <span className="row-count-badge">{orderLogs.length} Requests</span>
                    </div>
                  )}

                  {user.role === 'seller' && sellerSubTab === 'sales' ? (
                    <div className="ledger-items-stack">
                      {salesLogs.length === 0 ? <p style={{ color: '#888' }}>No incoming sales lines recorded.</p> : salesLogs.map((log, i) => (
                        <div key={log.id || i} className="ledger-row-card detailed-card">
                          <div className="card-main-info-segment">
                            <div className="order-item-thumbnail">{log.image ? <img src={`http://localhost:5000${log.image}`} alt="" /> : <div className="fallback-box">No Img</div>}</div>
                            <div className="item-details-block">
                              <div className="order-identity-tag">INBOUND REFER: #MM-SALE-{log.id}</div>
                              <h4>{log.title}</h4>
                              <div className="meta-specs-row"><span>Client: <strong>{log.buyer_name || 'Buyer'}</strong></span><span className="divider-dot">•</span><span>Qty: <strong>{log.quantity}</strong></span></div>
                            </div>
                          </div>
                          <div className="item-actions-block">
                            <div className="pricing-manifest"><span className="price-tag-value">₹{Number(log.total_price).toLocaleString('en-IN')}</span><span className="payment-badge-pill">{log.payment_method}</span></div>
                            <select value={log.order_status} onChange={(e) => handleStatusChange(log.id, e.target.value)} className={`status-select-dropdown ${log.order_status.toLowerCase()}`}>
                              <option value="PENDING">PENDING</option><option value="SHIPPED">SHIPPED</option><option value="DELIVERED">DELIVERED</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ledger-items-stack">
                      {orderLogs.length === 0 ? <p style={{ color: '#888' }}>You haven't placed any orders yet.</p> : orderLogs.map((log, i) => (
                        <div key={log.id || i} className="ledger-row-card detailed-card">
                          <div className="card-main-info-segment">
                            <div className="order-item-thumbnail">{log.image ? <img src={`http://localhost:5000${log.image}`} alt="" /> : <div className="fallback-box">No Img</div>}</div>
                            <div className="item-details-block">
                              <div className="order-identity-tag">OUTBOUND REFER: #MM-ORD-{log.id}</div>
                              <h4>{log.title}</h4>
                              <div className="meta-specs-row"><span>Merchant: <strong>{log.seller_name || 'Vendor'}</strong></span><span className="divider-dot">•</span><span>Qty: <strong>{log.quantity}</strong></span></div>
                            </div>
                          </div>
                          <div className="item-actions-block">
                            <div className="pricing-manifest text-alignment-right"><span className="price-tag-value">₹{Number(log.total_price).toLocaleString('en-IN')}</span><span className="payment-badge-pill">{log.payment_method}</span></div>
                            <span className={`static-status-badge status-${log.order_status.toLowerCase()}`}>{log.order_status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Profile;