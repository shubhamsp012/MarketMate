import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 🚨 FIXED: Purana 'react-serif' galti se likha import remove kar diya!
import { Link } from 'react-router-dom'; 
import './Dashboard.css';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user')) || { role: 'buyer', name: 'User', id: null };
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGlobalMarketplace = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get('http://localhost:5000/api/products', config);
        const dataRows = response.data || [];

        // Sort constraints: own items shift to absolute end of listings system
        const otherSellersProducts = dataRows.filter(p => Number(p.seller_id) !== Number(user.id));
        const currentSellerOwnProducts = dataRows.filter(p => Number(p.seller_id) === Number(user.id));

        const finalPrioritizedGrid = [...otherSellersProducts, ...currentSellerOwnProducts];
        setProducts(finalPrioritizedGrid);
      } catch (error) {
        console.error("Global marketplace fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchGlobalMarketplace();
    }
  }, [token, user.id]);

  // STRICT FILTER OPERATION LAYER: TITLE MATCHING ONLY
  const filteredProducts = products.filter(product => {
    return product.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Synchronizing live local marketplace...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-viewport">
      
      {/* GLOBAL DISCOVERY HEADER */}
      <div className="dashboard-header-block">
        <div className="header-meta">
          <span className="role-badge">{user.role.toUpperCase()} VIEW</span>
          <h1>Live Marketplace Index</h1>
          <p>Discover, evaluate, and acquire physical inventory listings broadcasted inside your local community.</p>
          
          {/* 🚨 EXACT LOCATION: Positioned right under 'local community.' layout descriptor paragraph */}
          <div className="dashboard-search-wrapper compact-header-search">
            <input 
              type="text" 
              placeholder="Filter by title name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dashboard-search-input"
            />
          </div>
        </div>
      </div>

      <hr className="divider-line" />

      {/* CORE PRODUCTS RENDERING ENGINE */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state-card">
          <h3>No listing records found matching the title "{searchQuery}".</h3>
          <p>Check back later for newly broadcasted data rows.</p>
        </div>
      ) : (
        <div className="products-grid-system">
          {filteredProducts.map((product) => {
            const isOwnProduct = Number(product.seller_id) === Number(user.id);

            return (
              <div key={product.id} className="product-premium-card">
                
                <div className="product-image-container">
                  {product.image ? (
                    <img 
                      src={`http://localhost:5000${product.image}`} 
                      alt={product.title} 
                      className="product-media-frame"
                    />
                  ) : (
                    <div className="media-fallback-box">
                      <span>No Preview Payload</span>
                    </div>
                  )}
                  <span className="category-tag-indicator">{product.category || 'General'}</span>
                </div>

                <div className="product-card-body">
                  <h3 className="product-title-text">{product.title}</h3>
                  <p className="product-description-snippet">{product.description}</p>
                  
                  {product.seller_name && (
                    <div className="seller-attribution">
                      By Seller: <span>{isOwnProduct ? 'You (Own Listing)' : product.seller_name}</span>
                    </div>
                  )}
                </div>

                <div className="product-card-footer" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                  <div className="price-and-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="price-matrix">
                      <span className="price-label">PRICE VECTOR</span>
                      <span className="price-value">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    </div>
                    
                    {isOwnProduct && (
                      <span className="own-product-badge" style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#f0f0f0', color: '#666666', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        YOUR ITEM
                      </span>
                    )}
                  </div>
                  
                  {!isOwnProduct ? (
                    <div className="buyer-actions-wrapper" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <Link 
                        to={`/product/${product.id}`} 
                        className="flat-buy-btn" 
                        style={{ textDecoration: 'none', textAlign: 'center', flex: 1, backgroundColor: 'transparent', color: '#111111', border: '1px solid #111111' }}
                      >
                        Details
                      </Link>
                      <Link
                        to={`/product/${product.id}`}
                        className="flat-buy-btn"
                        style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}
                      >
                        Acquire
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      to="/manage-products" 
                      className="flat-manage-shortcut-btn" 
                      style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#111111', color: '#ffffff', padding: '0.5rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '4px' }}
                    >
                      Manage This Item
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Dashboard;