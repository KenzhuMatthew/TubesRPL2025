import React from 'react';
import { Badge, Dropdown, List, Typography, Button, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import { getRelativeTime } from '../../utils/dateUtils';

const { Text } = Typography;

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotification();

  // Get recent 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const menu = (
    <div style={{ 
      width: 360, 
      maxHeight: 400, 
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      borderRadius: '8px'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong>Notifikasi</Text>
        {unreadCount > 0 && (
          <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
        )}
      </div>

      {recentNotifications.length > 0 ? (
        <>
          <List
            dataSource={recentNotifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: item.isRead ? '#fff' : '#f0f5ff',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onClick={() => handleNotificationClick(item)}
              >
                <div style={{ width: '100%' }}>
                  <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                    {item.message}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {getRelativeTime(item.createdAt)}
                  </Text>
                </div>
              </List.Item>
            )}
          />
          <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Button type="link" onClick={() => navigate('/notifications')}>
              Lihat Semua Notifikasi
            </Button>
          </div>
        </>
      ) : (
        <div style={{ padding: '40px 20px' }}>
          <Empty description="Tidak ada notifikasi" />
        </div>
      )}
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} offset={[-5, 5]}>
        <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;