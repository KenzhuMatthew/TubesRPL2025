// pages/admin/ManageUsers.jsx - Manage Users with Tabs
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Space,
  message,
  Modal,
  Tag,
  Dropdown,
  Tooltip,
  Table,
  Avatar,
  Tabs,
  Typography,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MoreOutlined,
  ExportOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { USER_ROLES } from '../../utils/constants';

const { Search } = Input;
const { Title, Text } = Typography;

const ManageUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Get role filter based on active tab
  const getRoleFilter = () => {
    if (activeTab === 'ALL') return undefined;
    return activeTab;
  };

  // Fetch users with filters
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', pagination.current, pagination.pageSize, searchText, activeTab],
    queryFn: () => adminApi.getUsers({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchText || undefined,
      role: getRoleFilter(),
    }),
    keepPreviousData: true,
  });

  // Count users by role
  const countByRole = React.useMemo(() => {
    if (!usersData?.users) return { ADMIN: 0, DOSEN: 0, MAHASISWA: 0, ALL: 0 };
    
    const counts = usersData.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      acc.ALL += 1;
      return acc;
    }, { ADMIN: 0, DOSEN: 0, MAHASISWA: 0, ALL: 0 });
    
    return counts;
  }, [usersData?.users]);

  // Transform users data
  const users = React.useMemo(() => {
    if (!usersData?.users) return [];
    
    return usersData.users.map(user => {
      const profile = user.dosen || user.mahasiswa || {};
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile.nama || user.email.split('@')[0],
        npm: user.mahasiswa?.npm || null,
        nip: user.dosen?.nip || null,
        angkatan: user.mahasiswa?.angkatan || null,
        isActive: user.isActive ?? user.is_active ?? true,
        profile: profile,
      };
    });
  }, [usersData?.users]);

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      message.success('Pengguna berhasil dihapus');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => adminApi.toggleUserStatus(userId, isActive),
    onSuccess: () => {
      message.success('Status pengguna berhasil diubah');
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Gagal mengubah status');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => adminApi.resetPassword(userId),
    onSuccess: (data) => {
      Modal.success({
        title: 'Password Berhasil Direset',
        content: (
          <div>
            <p>Password baru: <strong>{data.newPassword}</strong></p>
            <p style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
              Silakan berikan password ini kepada pengguna
            </p>
          </div>
        ),
      });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Gagal mereset password');
    },
  });

  // Handlers
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = (user) => {
    Modal.confirm({
      title: 'Hapus Pengguna',
      content: `Apakah Anda yakin ingin menghapus ${user.name}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: () => deleteMutation.mutate(user.id),
    });
  };

  const handleToggleStatus = (user) => {
    const newStatus = !user.isActive;
    Modal.confirm({
      title: newStatus ? 'Aktifkan Pengguna' : 'Nonaktifkan Pengguna',
      content: `Apakah Anda yakin ingin ${newStatus ? 'mengaktifkan' : 'menonaktifkan'} ${user.name}?`,
      okText: newStatus ? 'Aktifkan' : 'Nonaktifkan',
      cancelText: 'Batal',
      onOk: () => toggleStatusMutation.mutate({ userId: user.id, isActive: newStatus }),
    });
  };

  const handleResetPassword = (user) => {
    Modal.confirm({
      title: 'Reset Password',
      content: `Reset password untuk ${user.name}?`,
      okText: 'Reset',
      cancelText: 'Batal',
      onOk: () => resetPasswordMutation.mutate(user.id),
    });
  };

  // Action menu items
  const getActionMenuItems = (record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(record),
    },
    {
      key: 'toggle',
      icon: record.isActive ? <LockOutlined /> : <UnlockOutlined />,
      label: record.isActive ? 'Nonaktifkan' : 'Aktifkan',
      onClick: () => handleToggleStatus(record),
    },
    {
      key: 'reset',
      icon: <LockOutlined />,
      label: 'Reset Password',
      onClick: () => handleResetPassword(record),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Hapus',
      danger: true,
      onClick: () => handleDelete(record),
    },
  ];

  // Common columns
  const commonColumns = [
    {
      title: 'Pengguna',
      key: 'user',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.role === 'ADMIN' ? '#ff4d4f' : 
                               record.role === 'DOSEN' ? '#1890ff' : '#52c41a' 
            }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Admin specific columns
  const adminColumns = [
    commonColumns[0],
    {
      title: 'Role',
      key: 'role',
      width: 120,
      render: () => <Tag color="red" icon={<CrownOutlined />}>Administrator</Tag>,
    },
    commonColumns[1],
    commonColumns[2],
  ];

  // Dosen specific columns
  const dosenColumns = [
    commonColumns[0],
    {
      title: 'NIDN/NIP',
      dataIndex: 'nip',
      key: 'nip',
      width: 150,
      render: (nip) => <Text code>{nip || '-'}</Text>,
    },
    commonColumns[1],
    commonColumns[2],
  ];

  // Mahasiswa specific columns
  const mahasiswaColumns = [
    commonColumns[0],
    {
      title: 'NPM',
      dataIndex: 'npm',
      key: 'npm',
      width: 150,
      render: (npm) => <Text code>{npm || '-'}</Text>,
    },
    {
      title: 'Angkatan',
      dataIndex: 'angkatan',
      key: 'angkatan',
      width: 100,
      render: (angkatan) => angkatan || '-',
    },
    commonColumns[1],
    commonColumns[2],
  ];

  // All users columns (with role)
  const allUsersColumns = [
    commonColumns[0],
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const config = {
          ADMIN: { color: 'red', icon: <CrownOutlined />, label: 'Admin' },
          DOSEN: { color: 'blue', icon: <TeamOutlined />, label: 'Dosen' },
          MAHASISWA: { color: 'green', icon: <IdcardOutlined />, label: 'Mahasiswa' },
        };
        const { color, icon, label } = config[role] || {};
        return <Tag color={color} icon={icon}>{label}</Tag>;
      },
    },
    {
      title: 'NPM/NIDN',
      key: 'identifier',
      width: 150,
      render: (_, record) => (
        <Text code>{record.npm || record.nip || '-'}</Text>
      ),
    },
    commonColumns[1],
    commonColumns[2],
  ];

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case 'ADMIN': return adminColumns;
      case 'DOSEN': return dosenColumns;
      case 'MAHASISWA': return mahasiswaColumns;
      default: return allUsersColumns;
    }
  };

  // Tab items
  const tabItems = [
    {
      key: 'ALL',
      label: (
        <span>
          <TeamOutlined /> Semua{' '}
          {usersData?.pagination?.total > 0 && (
            <Badge count={usersData.pagination.total} style={{ backgroundColor: '#52c41a' }} />
          )}
        </span>
      ),
    },
    {
      key: 'ADMIN',
      label: (
        <span>
          <CrownOutlined /> Admin{' '}
          {countByRole.ADMIN > 0 && (
            <Badge count={countByRole.ADMIN} style={{ backgroundColor: '#ff4d4f' }} />
          )}
        </span>
      ),
    },
    {
      key: 'DOSEN',
      label: (
        <span>
          <TeamOutlined /> Dosen{' '}
          {countByRole.DOSEN > 0 && (
            <Badge count={countByRole.DOSEN} style={{ backgroundColor: '#1890ff' }} />
          )}
        </span>
      ),
    },
    {
      key: 'MAHASISWA',
      label: (
        <span>
          <IdcardOutlined /> Mahasiswa{' '}
          {countByRole.MAHASISWA > 0 && (
            <Badge count={countByRole.MAHASISWA} style={{ backgroundColor: '#52c41a' }} />
          )}
        </span>
      ),
    },
  ];

  if (isLoading && !usersData) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Kelola Pengguna
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Kelola data pengguna sistem (Admin, Dosen, dan Mahasiswa)
        </Text>
      </div>

      {/* Toolbar */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Search
              placeholder="Cari nama atau email..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              prefix={<SearchOutlined />}
            />
            <Tooltip title="Refresh">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
          </Space>

          <Space>
            <Button 
              icon={<ExportOutlined />}
              onClick={() => message.info('Fitur export dalam pengembangan')}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/users/create')}
            >
              Tambah Pengguna
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Tabs with Tables */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination({ current: 1, pageSize: 10 });
          }}
          items={tabItems}
        />

        {users.length === 0 && !searchText ? (
          <EmptyState
            description={`Belum ada ${activeTab === 'ALL' ? 'pengguna' : activeTab.toLowerCase()}`}
            actionText="Tambah Pengguna"
            onAction={() => navigate('/admin/users/create')}
          />
        ) : (
          <Table
            columns={getColumns()}
            dataSource={users}
            loading={isLoading}
            pagination={{
              ...pagination,
              total: usersData?.pagination?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} pengguna`,
            }}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ManageUsers;