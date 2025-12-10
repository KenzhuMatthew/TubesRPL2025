// layouts/MainLayout.jsx - Modern Premium Design with Glassmorphism
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
import { useNotification } from '../hooks/useNotification';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotification();

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
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* Modern Glassmorphism Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          top: 16,
          bottom: 16,
          width: collapsed ? 80 : 280,
          height: 'calc(100vh - 32px)',
          background: 'rgba(24, 144, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.15)',
          overflow: 'hidden',
          zIndex: 1000,
          transition: 'width 0.3s ease',
        }}
        className="sidebar-container"
      >
        {/* Logo Section */}
        <div
          style={{
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            margin: '0 12px',
            width: collapsed ? 'auto' : 'calc(100% - 24px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
              flexShrink: 0,
            }}
          >
            <CalendarOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          {!collapsed && (
            <div style={{ 
              marginLeft: 12, 
              flex: 1, 
              minWidth: 0,
              position: 'relative',
              zIndex: 2,
            }}>
              <Text
                strong
                style={{
                  fontSize: 18,
                  color: '#1890ff',
                  fontWeight: 700,
                  display: 'block',
                  lineHeight: 1.2,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                SIAP Bimbingan
              </Text>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: '16px 8px', flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
            }}
            className="modern-sidebar-menu"
          />
        </div>

        {/* User Profile Section */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            margin: '0 16px',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft" trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Avatar
                size={collapsed ? 32 : 40}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                }}
              />
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      color: '#1e293b',
                      fontSize: 13,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.profile?.nama || user?.email || 'User'}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      display: 'block',
                      fontSize: 11,
                      color: '#64748b',
                    }}
                  >
                    {user?.role === 'ADMIN' && 'Administrator'}
                    {user?.role === 'DOSEN' && 'Dosen'}
                    {user?.role === 'MAHASISWA' && 'Mahasiswa'}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: collapsed ? 96 : 296,
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Modern Glassmorphism Header */}
        <div
          style={{
            position: 'relative',
            margin: '16px 16px 0 16px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
            padding: '0 24px',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 18,
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          <Space size="large">
            <Badge count={unreadCount} offset={[-5, 5]} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 20 }} />}
                onClick={handleNotificationClick}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Badge>
          </Space>
        </div>

        {/* Content */}
        <div
          style={{
            margin: '16px',
            padding: '32px',
            minHeight: 'calc(100vh - 120px)',
            background: 'transparent',
          }}
        >
          <Outlet />
        </div>
      </div>

      <style jsx global>{`
        .modern-sidebar-menu .ant-menu-item {
          border-radius: 12px !important;
          margin: 4px 0 !important;
          height: 48px !important;
          line-height: 48px !important;
          transition: all 0.2s ease !important;
        }

        .modern-sidebar-menu .ant-menu-item:hover {
          background: rgba(24, 144, 255, 0.1) !important;
          transform: translateX(4px);
        }

        .modern-sidebar-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(9, 109, 217, 0.15) 100%) !important;
          border-left: 3px solid #1890ff !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2) !important;
        }

        .modern-sidebar-menu .ant-menu-item-selected::before {
          display: none !important;
        }

        .modern-sidebar-menu .ant-menu-item-icon {
          font-size: 18px !important;
        }

        .sidebar-container::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-container::-webkit-scrollbar-thumb {
          background: rgba(24, 144, 255, 0.3);
          border-radius: 3px;
        }

        .sidebar-container::-webkit-scrollbar-thumb:hover {
          background: rgba(24, 144, 255, 0.5);
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
