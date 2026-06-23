const express = require('express');
const router = express.Router();

// 🚨 FIXED: Dono purani destructuring lines ko merge karke ek single clean import bana diya hai!
const { register, login, protect, updateProfile } = require('../controllers/authController');

// Profile Update Route (Protected via Token Middleware)
router.put('/update-profile', protect, updateProfile);

// Auth Routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;