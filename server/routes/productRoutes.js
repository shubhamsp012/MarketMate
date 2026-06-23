const express = require('express');
const router = express.Router();

// 1. Controllers destructured imports (Added new target handlers)
const {
    getAllProducts,
    getMyProducts,
    addProduct,
    getProductById, // <-- Added for pre-populating edit form
    updateProduct   // <-- Added for handling modification requests
} = require('../controllers/productController');

// 2. Auth protection middleware
const { protect } = require('../middleware/authMiddleware');

// 3. Multer Image processing module import
const upload = require('../middleware/uploadMiddleware');


// Buyer -> All Products (GET: http://localhost:5000/api/products/)
router.get(
    '/',
    protect,
    getAllProducts
);


// Seller -> Own Products (GET: http://localhost:5000/api/products/myproducts)
router.get(
    '/myproducts',
    protect,
    getMyProducts
);


// Seller -> Add Product (POST: http://localhost:5000/api/products/add)
router.post(
    '/add',
    protect,
    upload.single('image'), 
    addProduct
);


// Seller -> Fetch Single Product Details (GET: http://localhost:5000/api/products/:id)
// FIXED: Fetches target resource attributes before updating
router.get(
    '/:id',
    protect,
    getProductById
);


// Seller -> Update Existing Product Specs (PUT: http://localhost:5000/api/products/:id)
// FIXED: Updates current model and allows optional image replacement
router.put(
    '/:id',
    protect,
    upload.single('image'),
    updateProduct
);

module.exports = router;