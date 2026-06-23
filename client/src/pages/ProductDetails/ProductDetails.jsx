import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || { id: null };

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5000/api/products/${id}`, config);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to read single product data stream:", error);
        alert("Product database index missing or corrupted.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSingleProduct();
  }, [id, token, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const isOwnProduct = product && Number(product.seller_id) === Number(user.id);

  // OPTION 1: COMMIT TO CART INTERFACE
  const handleAddToCart = async () => {
    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { product_id: product.id, quantity: quantity };
      
      await axios.post('http://localhost:5000/api/orders/cart', payload, config);
      alert(`Success: ${quantity} units committed to your Cart vector!`);
    } catch (error) {
      console.error("Cart insertion block fail:", error);
      alert("Unable to process cart routing transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  // OPTION 2: DIRECT BUY NOW PAYLOAD OVERPASS
  const handleBuyNowDirectly = () => {
    const singleProductPayload = [{
      product_id: product.id,
      seller_id: product.seller_id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity
    }];
    
    sessionStorage.setItem('direct_checkout_payload', JSON.stringify(singleProductPayload));
    navigate('/cart?mode=direct');
  };

  // 🚨 OPTION 3: INITIALIZE REALTIME CHAT ROOM WITH BACKEND SYNC (FIXED!)
  const handleInitiateChat = async () => {
    if (isOwnProduct) {
      alert("System Conflict: Cannot initialize chat array loops with your own identity node.");
      return;
    }

    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { 
        product_id: product.id, 
        seller_id: product.seller_id 
      };
      
      // 🚀 REST API call creates or retrieves the explicit unique chat_room database row
      await axios.post('http://localhost:5000/api/chat/room', payload, config);
      
      // Navigate safely to communication center where the list updates instantly
      navigate('/chat');
    } catch (error) {
      console.error("Failed to map websocket desk infrastructure:", error);
      alert(error.response?.data?.message || "Unable to configure negotiation desks.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="spinner"></div>
        <p>Parsing database entity attributes...</p>
      </div>
    );
  }

  return (
    <div className="details-viewport">
      <Link to="/dashboard" className="back-link-trigger">← Return to Marketplace</Link>
      
      <div className="details-grid-container">
        
        <div className="details-media-panel">
          {product.image ? (
            <img src={`http://localhost:5000${product.image}`} alt={product.title} className="details-main-img" />
          ) : (
            <div className="details-img-fallback">No Preview Payload Loaded</div>
          )}
        </div>

        <div className="details-specs-panel">
          <div className="specs-header-meta">
            <span className="specs-cat-badge">{product.category || 'General Asset'}</span>
            <h1 className="specs-title-h1">{product.title}</h1>
            
            {product.seller_name && (
              <p className="specs-seller-node">
                Verified Asset Managed By: <span>{isOwnProduct ? 'You (Own Listing)' : product.seller_name}</span>
              </p>
            )}
          </div>

          <div className="specs-price-tier">
            <span className="tier-label">UNIT PRICE INDEX</span>
            <h2 className="tier-value">₹{Number(product.price).toLocaleString('en-IN')}</h2>
          </div>

          <div className="specs-description-block">
            <h3>Description Blueprint</h3>
            <p>{product.description}</p>
          </div>

          <hr className="specs-divider" />

          {/* RENDERING GATEWAY CONTROLS */}
          <div className="cart-action-interface">
            <div className="quantity-toggle-cluster">
              <span className="qty-label">Quantity:</span>
              <div className="qty-controls-row">
                <button onClick={() => handleQuantityChange('dec')} className="qty-btn-flat">-</button>
                <span className="qty-current-value">{quantity}</span>
                <button onClick={() => handleQuantityChange('inc')} className="qty-btn-flat">+</button>
              </div>
            </div>

            <div className="triple-action-cluster" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
              
              {!isOwnProduct ? (
                <>
                  <div className="dual-purchase-row" style={{ display: 'flex', gap: '12px' }}>
                    {/* BUTTON 1: ADD TO CART */}
                    <button 
                      onClick={handleAddToCart} 
                      className="flat-add-to-cart-action" 
                      style={{ flex: 1, backgroundColor: 'transparent', color: '#111111', border: '1px solid #111111' }}
                      disabled={actionLoading}
                    >
                      Add to Cart
                    </button>

                    {/* BUTTON 2: ORDER PLACE DIRECTLY */}
                    <button 
                      onClick={handleBuyNowDirectly} 
                      className="flat-add-to-cart-action" 
                      style={{ flex: 1, backgroundColor: '#111111', color: '#ffffff' }}
                      disabled={actionLoading}
                    >
                      Buy Now (Order Place)
                    </button>
                  </div>

                  {/* BUTTON 3: CHAT GATEWAY SIGNALER WITH SPIN LOADING SUPPORT */}
                  <button 
                    onClick={handleInitiateChat} 
                    className="flat-chat-action-btn"
                    style={{ width: '100%', padding: '1rem', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.88rem', letterSpacing: '0.02em', background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#333333', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Syncing Chat Desk..." : "💬 Contact Seller (Chat)"}
                  </button>
                </>
              ) : (
                <Link 
                  to="/manage-products" 
                  className="flat-add-to-cart-action" 
                  style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#eaeaea', color: '#666666', border: '1px solid #dcdcdc', cursor: 'not-allowed' }}
                  onClick={(e) => e.preventDefault()}
                >
                  Your Active Product Listing Node
                </Link>
              )}
              
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ProductDetails;