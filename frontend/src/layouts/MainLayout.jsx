// layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Typography,
  Button,
  Space,
} from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined,
  ImportOutlined,
  BarChartOutlined,
  CheckSquareOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Menu items based on role
  const getMenuItems = () => {
    const role = user?.role;

    if (role === 'ADMIN') {
      return [
        {
          key: '/admin',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/admin/users',
          icon: <TeamOutlined />,
          label: 'Kelola Pengguna',
        },
        {
          key: '/admin/import',
          icon: <ImportOutlined />,
          label: 'Import Data',
        },
        {
          key: '/admin/monitoring',
          icon: <BarChartOutlined />,
          label: 'Monitoring & Laporan',
        },
      ];
    }

    if (role === 'DOSEN') {
      return [
        {
          key: '/dosen',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/dosen/schedule',
          icon: <CalendarOutlined />,
          label: 'Jadwal Mengajar',
        },
        {
          key: '/dosen/availability',
          icon: <ClockCircleOutlined />,
          label: 'Waktu Tersedia',
        },
        {
          key: '/dosen/sessions',
          icon: <CheckSquareOutlined />,
          label: 'Sesi Bimbingan',
        },
        {
          key: '/dosen/students',
          icon: <TeamOutlined />,
          label: 'Mahasiswa Bimbingan',
        },
      ];
    }

    if (role === 'MAHASISWA') {
      return [
        {
          key: '/mahasiswa',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/mahasiswa/schedule',
          icon: <CalendarOutlined />,
          label: 'Jadwal Kuliah',
        },
        {
          key: '/mahasiswa/request-guidance',
          icon: <FileTextOutlined />,
          label: 'Ajukan Bimbingan',
        },
        {
          key: '/mahasiswa/history',
          icon: <HistoryOutlined />,
          label: 'Riwayat Bimbingan',
        },
      ];
    }

    return [];
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate(`/${user?.role?.toLowerCase()}/profile`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Pengaturan',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Keluar',
      onClick: handleLogout,
      danger: true,
    },
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleNotificationClick = () => {
    navigate(`/${user?.role?.toLowerCase()}/notifications`);
  };

  // Get current selected key based on pathname
  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? 'SIAP' : 'SIAP Bimbingan'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size="large">
            <Badge count={unreadNotifications} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20 }} />}
                onClick={handleNotificationClick}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ display: collapsed ? 'none' : 'block' }}>
                  <Text strong>{user?.profile?.nama || user?.email}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user?.role === 'ADMIN' && 'Administrator'}
                    {user?.role === 'DOSEN' && 'Dosen Pembimbing'}
                    {user?.role === 'MAHASISWA' && 'Mahasiswa'}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;