import React, { useState } from 'react';
import { registerUser } from '../../services/authService';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    address: '' // 🚨 ADDED: State matrix holds the dynamic address string context
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Passes full object packet including newly aggregated address attribute 
      await registerUser(formData);
      alert("Registration Successful! Welcome to MarketMate.");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-viewport">
      
      {/* LEFT SECTION: BRAND DISPLAY */}
      <div className="brand-side">
        <div className="grid-overlay"></div>
        <div className="brand-content">
          <div className="logo">Market<span>Mate</span></div>
          <h1 className="brand-headline">Architecting the future of local trade.</h1>
          <p className="brand-subtext">
            Experience an optimized peer-to-peer infrastructure built with absolute security, real-time negotiation vectors, and proximity index filtering.
          </p>
          <div className="mini-features">
            <div className="feature-item">
              <strong>01 / WebSockets</strong> Native real-time chatting pipeline.
            </div>
            <div className="feature-item">
              <strong>02 / Geolocation</strong> Precise neighborhood cluster matching.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: FORM AREA */}
      <div className="form-side">
        <div className="form-container">
          <div className="form-header">
            <h2>Create an account</h2>
            <p>Get started with your free profile today.</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Email Address</label>
              <input
                type="type"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Account Framework</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="custom-select"
              >
                <option value="buyer">Join as a Buyer</option>
                <option value="seller">Join as a Seller</option>
              </select>
            </div>

            {/* 🚨 NEWLY INTEGRATED: Address Interface Textarea Layer */}
            <div className="field-group">
              <label>Physical Shipping / Node Address</label>
              <textarea
                name="address"
                placeholder="Enter detailed location data (Flat/Shop No, Street, Area Grid, Pincode)..."
                value={formData.address}
                onChange={handleChange}
                rows="3"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Profile..." : "Register Now"}
            </button>
          </form>

          <div className="form-footer">
            <p>Already have an account? <a href="/login">Sign In</a></p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Register;