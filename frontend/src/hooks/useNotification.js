import { useState, useEffect } from 'react';
import { notificationAPI } from '../api/notification.api';
import { message } from 'antd';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async (params) => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll(params);
      const data = response.data || response;
      // Backend returns { notifications, pagination, unreadCount }
      setNotifications(data.notifications || []);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      message.error(error.response?.data?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Unread count is included in getAll response, so we fetch notifications with limit 1
      const response = await notificationAPI.getAll({ limit: 1 });
      const data = response.data || response;
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
      message.error(error.response?.data?.message || 'Gagal menandai notifikasi');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      message.success('Semua notifikasi telah ditandai sebagai dibaca');
    } catch (error) {
      console.error('Mark all as read error:', error);
      message.error(error.response?.data?.message || 'Gagal menandai semua notifikasi');
    }
  };

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications({ limit: 20 });
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
