const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const { accessChatRoom, fetchRoomMessages, fetchActiveUserRooms } = require('../controllers/chatController');

router.post('/room', protect, accessChatRoom);
router.get('/rooms/all', protect, fetchActiveUserRooms);
router.get('/messages/:roomId', protect, fetchRoomMessages);

module.exports = router;