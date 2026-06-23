import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const Home = () => {
  return (
    <div className="landing-viewport">

      {/* HERO SECTION */}
      <section className="hero-block">
        <div className="hero-grid-pattern"></div>

        <div className="hero-inner">

          <span className="pill-badge">
            Your Trusted Local Marketplace
          </span>

          <h1 className="main-headline">
            Buy and sell locally with <span className="dark-accent">confidence.</span>
          </h1>

          <p className="main-paragraph">
            MarketMate helps you discover products nearby, connect with trusted buyers and sellers, and make secure transactions within your community.
          </p>

          <div className="action-button-row">
            <Link to="/register" className="action-btn btn-dark">
              Get Started
            </Link>

            <Link to="/login" className="action-btn btn-light">
              Sign In
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="info-block">
        <div className="section-container">

          <h2 className="block-headline">
            Why Choose MarketMate?
          </h2>

          <p className="block-subparagraph">
            We make local buying and selling simple, secure, and convenient for everyone.
          </p>

          <div className="cards-layout-grid">

            {/* Feature 1 */}
            <div className="value-card">
              <div className="card-indicator">01</div>

              <h3 className="card-headline">
                Find Nearby Products
              </h3>

              <p className="card-body-text">
                Discover products and sellers near your location, making local shopping faster and more convenient.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="value-card">
              <div className="card-indicator">02</div>

              <h3 className="card-headline">
                Instant Chat
              </h3>

              <p className="card-body-text">
                Chat directly with buyers and sellers to ask questions, negotiate prices, and finalize deals easily.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="value-card">
              <div className="card-indicator">03</div>

              <h3 className="card-headline">
                Ratings & Reviews
              </h3>

              <p className="card-body-text">
                Read reviews and ratings from other users to make informed and trustworthy buying decisions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-block">
        <div className="footer-inner">
          <p>
            &copy; {new Date().getFullYear()} MarketMate. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;