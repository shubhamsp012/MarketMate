import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isDirectCheckout = window.location.search.includes('mode=direct');

  const loadCartContent = async () => {
    try {
      if (isDirectCheckout) {
        const directData = sessionStorage.getItem('direct_checkout_payload');
        if (directData) setCartItems(JSON.parse(directData));
        setLoading(false);
      } else {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/orders/cart', config);
        setCartItems(response.data || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error exception:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCartContent();
  }, [token, isDirectCheckout]);

  // DYNAMIC REMOVE DISPATCH TRIGGER
  const handleRemoveItem = async (cartId, index) => {
    if (isDirectCheckout) {
      // Direct checkout mein memory state clear karo
      sessionStorage.removeItem('direct_checkout_payload');
      setCartItems([]);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/orders/cart/${cartId}`, config);
      
      // Realtime UI state filter optimization array refresh
      setCartItems(prev => prev.filter((item, i) => item.id !== cartId));
    } catch (error) {
      console.error("Deletion crash:", error);
      alert("Could not eject item from data index.");
    }
  };

  const cartSubtotal = (cartItems || []).reduce((acc, item) => {
    return acc + (Number(item?.price || 0) * Number(item?.quantity || 1));
  }, 0);

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setCheckoutLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderPayload = {
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          seller_id: item.seller_id,
          quantity: Number(item.quantity) || 1,
          total_price: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        }))
      };
      await axios.post('http://localhost:5000/api/orders/checkout', orderPayload, config);
      alert("Order Placed Successfully!");
      if (isDirectCheckout) sessionStorage.removeItem('direct_checkout_payload');
      navigate('/dashboard');
    } catch (error) {
      alert("Checkout sequence crash.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="cart-loading"><div className="spinner"></div><p>Syncing Cart Matrix...</p></div>;

  return (
    <div className="cart-viewport" style={{ background: '#ffffff', minHeight: '100vh', padding: '2rem' }}>
      <div className="cart-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111' }}>
          {isDirectCheckout ? 'Direct Checkout Queue' : 'Your Staged Cart'}
        </h1>
        <p style={{ color: '#666' }}>Review active units before triggering server settlement.</p>
      </div>

      {(!cartItems || cartItems.length === 0) ? (
        <div className="empty-cart-card" style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed #ccc' }}>
          <h3>Your cart repository is currently empty.</h3>
          <Link to="/dashboard" style={{ color: '#111', fontWeight: '600' }}>Go back to marketplace</Link>
        </div>
      ) : (
        <div className="cart-split-system">
          
          <div className="cart-items-panel">
            {cartItems.map((item, index) => {
              const currentPrice = Number(item?.price) || 0;
              const currentQty = Number(item?.quantity) || 1;
              const currentRowCost = currentPrice * currentQty;

              return (
                <div key={item?.id || index} className="cart-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="cart-item-media">
                      {item?.image ? <img src={`http://localhost:5000${item.image}`} alt="" /> : <div className="fallback-thumb">No Preview</div>}
                    </div>
                    <div className="cart-item-meta">
                      <h3 style={{ color: '#111', margin: 0 }}>{item?.title || 'Marketplace Item'}</h3>
                      <span className="cart-item-price-tag" style={{ color: '#666' }}>₹{currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div className="cart-item-qty-box" style={{ textAlign: 'right' }}>
                      <span className="qty-badge-chip" style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>QTY: {currentQty}</span>
                      <div className="total-row-cost" style={{ fontWeight: '800', marginTop: '0.25rem' }}>₹{currentRowCost.toLocaleString('en-IN')}</div>
                    </div>
                    
                    {/* ACTION LAYER REMOVE BUTTON */}
                    <button 
                      onClick={() => handleRemoveItem(item.id, index)}
                      style={{ background: 'transparent', border: '1px solid #df2c2c', color: '#df2c2c', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-checkout-panel">
            <h2>Order Blueprint</h2>
            <hr className="panel-divider" />
            <div className="billing-summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Index Cost:</span>
              <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
            </div>
            <hr className="panel-divider" />
            <div className="payment-gateway-selection">
              <label className={`payment-radio-label ${paymentMethod === 'COD' ? 'active-radio' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <div className="radio-text-meta"><strong>Cash on Delivery (COD)</strong></div>
              </label>
              <label className={`payment-radio-label ${paymentMethod === 'ONLINE' ? 'active-radio' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} />
                <div className="radio-text-meta"><strong>Instant Online Payment</strong></div>
              </label>
            </div>
            <button className="checkout-prime-btn" onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? 'Processing...' : `Place Order`}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;