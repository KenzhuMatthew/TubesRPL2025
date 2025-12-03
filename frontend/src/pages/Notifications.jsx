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
    // Mock data
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'SESSION_APPROVED',
          title: 'Bimbingan Disetujui',
          message: 'Bimbingan Anda pada 08 Oktober 2024 telah disetujui',
          link: '/mahasiswa/sessions/1',
          isRead: false,
          createdAt: '2024-10-07T14:00:00Z',
        },
        {
          id: 2,
          type: 'SESSION_REQUESTED',
          title: 'Pengajuan Bimbingan Baru',
          message: 'Ahmad Fauzi mengajukan bimbingan pada 08 Oktober 2024',
          link: '/dosen/sessions/2',
          isRead: false,
          createdAt: '2024-10-07T13:00:00Z',
        },
        {
          id: 3,
          type: 'NOTE_ADDED',
          title: 'Catatan Bimbingan Ditambahkan',
          message: 'Dosen telah menambahkan catatan hasil bimbingan',
          link: '/mahasiswa/sessions/3',
          isRead: true,
          createdAt: '2024-10-06T10:00:00Z',
        },
        {
          id: 4,
          type: 'SESSION_REMINDER',
          title: 'Pengingat Bimbingan',
          message: 'Anda memiliki jadwal bimbingan besok pukul 10:00',
          link: '/mahasiswa/sessions/4',
          isRead: true,
          createdAt: '2024-10-05T09:00:00Z',
        },
      ]);
      setUnreadCount(2);
      setLoading(false);
    }, 500);
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
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAsRead = async (id) => {
    // API call to mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // API call to mark all as read
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    // API call to delete
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

      <Card>
        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                  padding: '16px',
                  marginBottom: 8,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead
                    ? '#fafafa'
                    : '#e6f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead
                    ? 'transparent'
                    : '#f0f5ff';
                }}
                actions={[
                  <Popconfirm
                    title="Hapus notifikasi ini?"
                    onConfirm={() => deleteNotification(item.id)}
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
                    <Badge dot={!item.isRead}>
                      {getNotificationIcon(item.type)}
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      {!item.isRead && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          Baru
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div onClick={() => handleNotificationClick(item)}>
                      <Text>{item.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Tidak ada notifikasi" />
        )}
      </Card>
    </div>
  );
};

export default Notifications;