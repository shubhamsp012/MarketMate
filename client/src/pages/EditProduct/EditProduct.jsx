import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../AddProduct/AddProduct.css'; // Reusing your clean single card form styles

function EditProduct() {
  const { id } = useParams(); // URL parameters se product ID nikalna
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Hook 1: Current data payload ko fetch karke inputs mein load karna
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get(`http://localhost:5000/api/products/${id}`, config);
        const product = response.data;
        
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || ''
        });
      } catch (error) {
        console.error("Error loading product data:", error);
        alert("Failed to read product telemetry from database.");
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Hook 2: Changes update request method trigger karna
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

      // PUT operation directly targeting specific resource index
      await axios.put(`http://localhost:5000/api/products/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Product Schema Updated Successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || 'Error executing modification query');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-viewport">
        <p style={{ color: '#666666' }}>Fetching record metrics from matrix...</p>
      </div>
    );
  }

  return (
    <div className="form-viewport">
      <div className="form-card">
        
        <div className="form-header">
          <h2>Modify Product Specs</h2>
          <p>Update database table attributes for the selected inventory node.</p>
        </div>

        <form onSubmit={handleSubmit} className="product-submission-form">
          <div className="input-group">
            <label>Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-split">
            <div className="input-group">
              <label>Price Vector (INR)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Category Node</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Change Item Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-custom-input"
            />
          </div>

          <div className="input-group">
            <label>Description Payload</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? "Updating Query Database Rows..." : "Save Product Modifications"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default EditProduct;