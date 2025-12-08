// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination
 * @access  Private (Any authenticated user)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @query   unreadOnly - Filter unread only (true/false)
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private (Notification owner)
 * @param   id - Notification ID
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all user notifications as read
 * @access  Private (Any authenticated user)
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete single notification
 * @access  Private (Notification owner)
 * @param   id - Notification ID
 */
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;