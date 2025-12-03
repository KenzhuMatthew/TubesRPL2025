// controllers/notification.controller.js
const notificationService = require('../services/notification.service');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
    });

    res.json(result);
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.markAsRead(id, req.user.id);

    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);

    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id, req.user.id);

    res.json({ message: 'Notifikasi berhasil dihapus' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};