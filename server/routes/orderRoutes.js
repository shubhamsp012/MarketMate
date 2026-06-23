const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// SINGLE CLEAN IMPORT BLOCK: No duplicates allowed here
const {
    addToCart,
    getCart,
    placeOrder,
    getBuyerOrders,
    getSellerSales,
    removeFromCart,
    updateOrderStatus
} = require('../controllers/orderController');

// Cart Management Endpoints Pipeline
router.post('/cart', protect, addToCart);
router.get('/cart', protect, getCart);
router.delete('/cart/:id', protect, removeFromCart);
router.put('/status/:id', protect, updateOrderStatus);

// Order Placement & Log Feeds Endpoints Pipeline
router.post('/checkout', protect, placeOrder);
router.get('/buyer-orders', protect, getBuyerOrders);
router.get('/seller-sales', protect, getSellerSales);

module.exports = router;