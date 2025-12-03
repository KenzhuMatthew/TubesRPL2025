// frontend/src/layouts/Header.jsx (FINAL FIX)
import React from 'react';
import { Layout, Button, Avatar, Dropdown, Badge, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotification } from '../hooks/useNotification';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotification();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => {
        const basePath = user?.role?.toLowerCase() || '';
        navigate(basePath ? `/${basePath}/profile` : '/profile');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Pengaturan',
      onClick: () => {
        const basePath = user?.role?.toLowerCase() || '';
        navigate(basePath ? `/${basePath}/settings` : '/settings');
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />

      <Space align="center" size="large">
        <Badge count={unreadCount} offset={[-5, 5]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '20px' }} />}
            onClick={() => {
              const basePath = user?.role?.toLowerCase() || '';
              navigate(basePath ? `/${basePath}/notifications` : '/notifications');
            }}
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '0 8px' }}>
            <Avatar size="default" icon={<UserOutlined />} />
            
            {/* ▼▼▼ PERUBAHAN KUNCI ADA DI SINI ▼▼▼ */}
            <div style={{ lineHeight: 'normal' }}>
              <Typography.Text strong style={{ display: 'block' }}>
                {user?.name || user?.email || 'Pengguna'}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block', lineHeight: 1.2, textTransform: 'capitalize' }}>
                {user?.role?.toLowerCase() || 'Administrator'}
              </Typography.Text>
            </div>
            {/* ▲▲▲ ----------------------------- ▲▲▲ */}

          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;