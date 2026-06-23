import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client'; // 🚨 IMPORT SOCKET CLIENT FOR LIVE BADGES
import './Navbar.css';

// Reuse the global network socket instance channel
const socket = io('http://localhost:5000');

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // 🚨 NOTIFICATION MATRIX STATE
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user) return;

    // Listen to incoming messages globally across the system network
    socket.on('receive_message', (incomingMsg) => {
      // Increment counter only if user is NOT currently inside the active chat screen view
      if (location.pathname !== '/chat' && Number(incomingMsg.sender_id) !== Number(user.id)) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => socket.off('receive_message');
  }, [token, user, location.pathname]);

  // Clear notifications immediately when user enters the chat window view node
  useEffect(() => {
    if (location.pathname === '/chat') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? 'nav-item-active' : '';

  return (
    <nav className="marketmate-premium-navbar">
      <div className="nav-container-fluid">
        
        {/* BRAND LOGO */}
        <div className="nav-brand-block" onClick={() => navigate('/dashboard')}>
          <span className="brand-logo-cube">M</span>
          <span className="brand-text-main">Market<span className="text-accent">Mate</span></span>
        </div>

        {/* NAVIGATION LINK CLUSTER */}
        <div className="nav-links-wrapper">
          {token ? (
            <>
              {/* CHAT ROUTE WITH DYNAMIC BADGE COUNT CONTAINER */}
              <Link to="/chat" className={`nav-link-item ${isActive('/chat')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>💬 {user?.role === 'seller' ? 'Client Enquiries' : 'Negotiations'}</span>
                
                {/* 🚨 UNREAD NOTIFICATION BADGE CONTROLLER */}
                {unreadCount > 0 && (
                  <span className="nav-notification-badge-pill">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* CART OPTION */}
              <Link to="/cart" className={`nav-link-item ${isActive('/cart')}`}>
                🛒 Cart
              </Link>

              {/* PROFILE CHIP */}
              <Link to="/profile" className={`nav-profile-chip ${isActive('/profile')}`}>
                <div className="nav-avatar-sphere">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="nav-profile-name">{user?.name || 'Account'}</span>
                <span className="nav-profile-role-badge">{user?.role}</span>
              </Link>
            </>
          ) : (
            <div className="nav-auth-actions">
              <Link to="/login" className="nav-login-link">Sign In</Link>
              <Link to="/register" className="nav-register-btn">Sign Up</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;