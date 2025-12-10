import React from 'react';
import { Menu, Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  ImportOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        {
          key: '/admin',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/admin/users',
          icon: <UserOutlined />,
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
          label: 'Laporan & Monitoring',
        },
      ];
    }

    if (user?.role === 'DOSEN') {
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
          label: 'Ketersediaan',
        },
        {
          key: '/dosen/sessions',
          icon: <FileTextOutlined />,
          label: 'Sesi Bimbingan',
        },
        {
          key: '/dosen/students',
          icon: <TeamOutlined />,
          label: 'Mahasiswa Bimbingan',
        },
      ];
    }

    if (user?.role === 'MAHASISWA') {
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

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? '16px' : '20px',
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {collapsed ? 'BTA' : 'Bimbingan TA'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={getMenuItems()}
        onClick={handleMenuClick}
        style={{ marginTop: '8px' }}
      />
    </Sider>
  );
};

export default Sidebar;