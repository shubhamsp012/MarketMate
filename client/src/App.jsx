import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import AddProduct from './pages/AddProduct/AddProduct';
import EditProduct from './pages/EditProduct/EditProduct';
import ManageProducts from './pages/ManageProducts/ManageProducts';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart'; 
import Orders from './pages/Orders/Orders';
import Chat from './pages/Chat/Chat'; // 🚨 ADDED: Real-time Chat component reference

import ProtectedRoute from './routes/ProtectedRoute';

function AppContent() {
  const location = useLocation();

  // Array containing all public auth route paths
  const publicRoutes = ['/', '/login', '/register'];
  
  // FIXED NAVBAR INTERCEPT CONDITIONS: Appended path tracking patterns smoothly
  const showNavbar = !publicRoutes.includes(location.pathname) && !location.pathname.startsWith('/edit-product/');
  
  const isProtectedRoute = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/profile') || 
                           location.pathname.startsWith('/add-product') || 
                           location.pathname.startsWith('/edit-product') ||
                           location.pathname.startsWith('/manage-products') ||
                           location.pathname.startsWith('/product/') ||
                           location.pathname.startsWith('/cart') ||
                           location.pathname.startsWith('/my-orders') || // 🚨 ADDED: Orders navigation tracking
                           location.pathname.startsWith('/chat'); // 🚨 ADDED: Real-time chat navbar tracking

  return (
    <>
      {/* Navbar rendered globally across the protected control panels framework */}
      {(showNavbar || isProtectedRoute) && <Navbar />}

      <Routes>
        {/* Public Authentication Gateways */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Control Panel Pipelines */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* SECURED EDIT ROUTE PIPELINE: Wrapped cleanly inside validation locks */}
        <Route 
          path="/edit-product/:id" 
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/manage-products"
          element={
            <ProtectedRoute>
              <ManageProducts />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/product/:id" 
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          } 
        />

        {/* REGISTERING SECURE CART ROUTE TERMINAL GATEWAY */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />

        {/* DEDICATED SEPARATE ORDERS VIEW (IF ACCESSED DIRECTLY) */}
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />

        {/* 🚨 NEWLY INTEGRATED: REGISTERING CHAT REAL-TIME COMMUNICATION ROUTE */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;