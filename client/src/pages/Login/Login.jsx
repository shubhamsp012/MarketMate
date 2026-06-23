import React, { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // <-- CSS module check karo

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const res = await loginUser(formData);

      // Save credentials into browser local runtime storage engine
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Immediate redirect to the dynamic role dashboard
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-viewport">
      
      {/* LEFT SECTION: BRAND DISPLAY PANEL */}
      <div className="brand-side">
        <div className="grid-overlay"></div>
        <div className="brand-content">
          <div className="logo">Market<span>Mate</span></div>
          <h1 className="brand-headline">Secure Gateway Authentication.</h1>
          <p className="brand-subtext">
            Access your synchronized marketplace data logs, trace inventory status values, and manage neighborhood trade pools over our optimized socket tunnel layer.
          </p>
          <div className="mini-features">
            <div className="feature-item">
              <strong>Security Protocol</strong> SHA-256 state encryption vectors.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: CORE INTERFACE LOGIN FORM */}
      <div className="form-side">
        <div className="form-container">
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Please log in using your system credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="field-group">
              <label>Email Node Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Password Structure</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Authenticating Session..." : "Sign In to Platform"}
            </button>
          </form>

          <div className="form-footer">
            <p>New to the platform architecture? <Link to="/register">Create Account</Link></p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;