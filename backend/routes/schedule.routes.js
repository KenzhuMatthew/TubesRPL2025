// routes/schedule.routes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// ===== COMMON ROUTES =====
// Check schedule conflict
router.post('/check-conflict', scheduleController.checkConflict);

// Get available rooms
router.get('/rooms', scheduleController.getRooms);

module.exports = router;