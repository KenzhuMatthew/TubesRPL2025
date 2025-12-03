// components/user/UserTable.jsx - Reusable User Table Component
import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Avatar, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, CrownOutlined, TeamOutlined, IdcardOutlined } from '@ant-design/icons';
import { USER_ROLES } from '../../utils/constants';

const { Text } = Typography;

const UserTable = ({ 
  data = [], 
  loading = false, 
  pagination, 
  onEdit, 
  onDelete,
  onChange,
  showRole = true,
  role = null, // 'ADMIN', 'DOSEN', 'MAHASISWA', or null for all
}) => {
  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.ADMIN]: 'red',
      [USER_ROLES.DOSEN]: 'blue',
      [USER_ROLES.MAHASISWA]: 'green',
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    const icons = {
      [USER_ROLES.ADMIN]: <CrownOutlined />,
      [USER_ROLES.DOSEN]: <TeamOutlined />,
      [USER_ROLES.MAHASISWA]: <IdcardOutlined />,
    };
    return icons[role] || null;
  };

  const getRoleLabel = (role) => {
    const labels = {
      [USER_ROLES.ADMIN]: 'Admin',
      [USER_ROLES.DOSEN]: 'Dosen',
      [USER_ROLES.MAHASISWA]: 'Mahasiswa',
    };
    return labels[role] || role;
  };

  // Common columns
  const userColumn = {
    title: 'Pengguna',
    key: 'user',
    width: 300,
    render: (_, record) => (
      <Space>
        <Avatar 
          icon={<UserOutlined />} 
          src={record.avatar}
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
  };

  const statusColumn = {
    title: 'Status',
    dataIndex: 'isActive',
    key: 'isActive',
    width: 100,
    render: (isActive) => (
      <Tag color={isActive ? 'success' : 'default'}>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </Tag>
    ),
  };

  const actionColumn = {
    title: 'Aksi',
    key: 'action',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <Space>
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit && onEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Hapus">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete && onDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  };

  // Build columns based on role
  const getColumns = () => {
    const columns = [userColumn];

    // Add role-specific columns
    if (role === USER_ROLES.DOSEN) {
      columns.push({
        title: 'NIDN/NIP',
        dataIndex: 'nidn',
        key: 'nidn',
        width: 150,
        render: (nidn) => <Text code>{nidn || '-'}</Text>,
      });
    } else if (role === USER_ROLES.MAHASISWA) {
      columns.push({
        title: 'NPM',
        dataIndex: 'nim',
        key: 'nim',
        width: 150,
        render: (nim) => <Text code>{nim || '-'}</Text>,
      });
      columns.push({
        title: 'Angkatan',
        dataIndex: 'angkatan',
        key: 'angkatan',
        width: 100,
      });
    } else if (showRole) {
      // Show role column for all users or admin
      columns.push({
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        width: 120,
        render: (role) => (
          <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
            {getRoleLabel(role)}
          </Tag>
        ),
      });
      
      // Show identifier for all users
      columns.push({
        title: 'NPM/NIDN',
        key: 'identifier',
        width: 150,
        render: (_, record) => (
          <Text code>{record.nim || record.nidn || '-'}</Text>
        ),
      });
    }

    columns.push(statusColumn);
    columns.push(actionColumn);

    return columns;
  };

  return (
    <Table
      columns={getColumns()}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      rowKey="id"
      scroll={{ x: 800 }}
    />
  );
};

export default UserTable;