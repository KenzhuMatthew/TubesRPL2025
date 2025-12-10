import React from 'react';
import { List, Typography, Button, Space, Tag } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRelativeTime } from '../../utils/dateUtils';
import { NOTIFICATION_TYPES } from '../../utils/constants';

const { Text, Paragraph } = Typography;

const NotificationList = ({ 
  notifications, 
  loading,
  onMarkAsRead,
  onDelete,
  onItemClick 
}) => {
  const getNotificationIcon = (type) => {
    // Return icon based on notification type
    const icons = {
      [NOTIFICATION_TYPES.SESSION_REQUESTED]: '📝',
      [NOTIFICATION_TYPES.SESSION_APPROVED]: '✅',
      [NOTIFICATION_TYPES.SESSION_REJECTED]: '❌',
      [NOTIFICATION_TYPES.SESSION_UPDATED]: '🔄',
      [NOTIFICATION_TYPES.SESSION_CANCELLED]: '🚫',
      [NOTIFICATION_TYPES.SESSION_REMINDER]: '⏰',
      [NOTIFICATION_TYPES.NOTE_ADDED]: '📋',
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      [NOTIFICATION_TYPES.SESSION_REQUESTED]: 'blue',
      [NOTIFICATION_TYPES.SESSION_APPROVED]: 'green',
      [NOTIFICATION_TYPES.SESSION_REJECTED]: 'red',
      [NOTIFICATION_TYPES.SESSION_UPDATED]: 'orange',
      [NOTIFICATION_TYPES.SESSION_CANCELLED]: 'default',
      [NOTIFICATION_TYPES.SESSION_REMINDER]: 'purple',
      [NOTIFICATION_TYPES.NOTE_ADDED]: 'cyan',
    };
    return colors[type] || 'default';
  };

  return (
    <List
      loading={loading}
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          style={{
            background: item.isRead ? '#fff' : '#f0f5ff',
            padding: '16px',
            marginBottom: '8px',
            borderRadius: '8px',
            border: '1px solid #f0f0f0',
            cursor: 'pointer',
          }}
          onClick={() => onItemClick && onItemClick(item)}
          actions={[
            !item.isRead && (
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(item.id);
                }}
              >
                Tandai Dibaca
              </Button>
            ),
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            />,
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={
              <div style={{ fontSize: '28px' }}>
                {getNotificationIcon(item.type)}
              </div>
            }
            title={
              <Space>
                <Text strong>{item.title}</Text>
                <Tag color={getNotificationColor(item.type)}>
                  {item.typeName || 'Notifikasi'}
                </Tag>
                {!item.isRead && (
                  <Tag color="blue">Baru</Tag>
                )}
              </Space>
            }
            description={
              <>
                <Paragraph style={{ margin: '8px 0' }}>
                  {item.message}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {getRelativeTime(item.createdAt)}
                </Text>
              </>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default NotificationList;