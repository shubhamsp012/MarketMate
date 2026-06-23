import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ManageProducts.css';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchMyProducts = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      // Hitting the seller specific endpoint
      const response = await axios.get('http://localhost:5000/api/products/myproducts', config);
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading seller inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyProducts();
    }
  }, [token]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product listing?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`http://localhost:5000/api/products/${productId}`, config);
        alert("Product successfully deleted!");
        fetchMyProducts(); // Refresh listings matrix
      } catch (error) {
        console.error("Deletion query failed:", error);
        alert("Failed to delete the product.");
      }
    }
  };

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading your catalog cluster...</p>
      </div>
    );
  }

  return (
    <div className="manage-viewport">
      <div className="manage-header-block">
        <div>
          <h1>Manage Your Listings</h1>
          <p>Review, modify, or delete your active marketplace inventory records.</p>
        </div>
        <Link to="/add-product" className="action-trigger-btn">
          + Add New Product
        </Link>
      </div>

      <hr className="divider-line" />

      {products.length === 0 ? (
        <div className="empty-state-card">
          <h3>You haven't broadcasted any products yet.</h3>
          <p>Click on "+ Add New Product" to deploy your first listing into the schema.</p>
        </div>
      ) : (
        <div className="manage-table-wrapper">
          <table className="manage-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Title</th>
                <th>Category</th>
                <th>Price Index</th>
                <th>Action Gateways</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-img-container">
                      {product.image ? (
                        <img src={`http://localhost:5000${product.image}`} alt={product.title} />
                      ) : (
                        <span className="no-img-text">No Media</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-info-cell">
                      <span className="prod-title">{product.title}</span>
                      <span className="prod-desc">{product.description}</span>
                    </div>
                  </td>
                  <td><span className="table-cat-badge">{product.category || 'General'}</span></td>
                  <td className="prod-price">₹{Number(product.price).toLocaleString('en-IN')}</td>
                  <td>
                    <div className="table-action-cluster">
                      <Link to={`/edit-product/${product.id}`} className="table-btn-edit">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="table-btn-delete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;