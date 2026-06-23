import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post(
        'http://localhost:5000/api/products/add',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Product added successfully!');
      navigate('/dashboard');

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        'Unable to add product'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-viewport">
      <div className="form-card">

        <div className="form-header">
          <h2>Add New Product</h2>
          <p>
            Fill in the details below to list your product on MarketMate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="product-submission-form">

          <div className="input-group">
            <label>Product Name</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., iPhone 15 Pro, Study Table"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-split">

            <div className="input-group">
              <label>Price (INR)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                placeholder="e.g., Electronics, Furniture"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-group">
            <label>Upload Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-custom-input"
            />
          </div>

          <div className="input-group">
            <label>Product Description</label>
            <textarea
              name="description"
              placeholder="Provide details about the product, its condition, features, and any additional information."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            className="form-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Adding Product...'
              : 'Publish Product'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AddProduct;