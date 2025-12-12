// pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Typography,
  Tag,
  Space,
  Empty,
  Badge,
  Popconfirm,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api/notification.api';
import { message } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const { Title, Text } = Typography;

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll({ limit: 50 });
      const data = response.data || response;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      message.error(error.response?.data?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SESSION_APPROVED':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'SESSION_REJECTED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />;
      case 'SESSION_REQUESTED':
        return <CalendarOutlined style={{ color: '#1890ff', fontSize: 24 }} />;
      case 'SESSION_UPDATED':
        return <EditOutlined style={{ color: '#faad14', fontSize: 24 }} />;
      case 'NOTE_ADDED':
        return <CheckOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'SESSION_REMINDER':
        return <ClockCircleOutlined style={{ color: '#722ed1', fontSize: 24 }} />;
      default:
        return <BellOutlined style={{ fontSize: 24 }} />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
      message.error(error.response?.data?.message || 'Gagal menandai notifikasi');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      message.success('Semua notifikasi telah ditandai sebagai dibaca');
    } catch (error) {
      console.error('Mark all as read error:', error);
      message.error(error.response?.data?.message || 'Gagal menandai semua notifikasi');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      message.success('Notifikasi berhasil dihapus');
    } catch (error) {
      console.error('Delete notification error:', error);
      message.error(error.response?.data?.message || 'Gagal menghapus notifikasi');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 24, justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Title level={2}>Notifikasi</Title>
          {unreadCount > 0 && (
            <Text type="secondary">
              Anda memiliki {unreadCount} notifikasi yang belum dibaca
            </Text>
          )}
        </div>
        {unreadCount > 0 && (
          <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
            Tandai Semua Sudah Dibaca
          </Button>
        )}
      </Space>

      <Card loading={loading}>
        {!loading && notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => {
              const isRead = item.is_read || false;
              const createdAt = item.created_at || item.createdAt;
              
              return (
                <List.Item
                  style={{
                    backgroundColor: isRead ? 'transparent' : '#f0f5ff',
                    padding: '16px',
                    marginBottom: 8,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isRead
                      ? '#fafafa'
                      : '#e6f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isRead
                      ? 'transparent'
                      : '#f0f5ff';
                  }}
                  onClick={() => handleNotificationClick(item)}
                  actions={[
                    <Popconfirm
                      title="Hapus notifikasi ini?"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      okText="Hapus"
                      cancelText="Batal"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!isRead}>
                        {getNotificationIcon(item.type)}
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={!isRead}>{item.title}</Text>
                        {!isRead && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            Baru
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Text>{item.message}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {createdAt ? dayjs(createdAt).fromNow() : ''}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="Tidak ada notifikasi" />
        )}
      </Card>
    </div>
  );
};

export default Notifications;