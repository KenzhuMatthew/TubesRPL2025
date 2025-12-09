import React from 'react';
import { Card, Descriptions, Avatar, Tag, Space, Button } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { USER_ROLES } from '../../utils/constants';

const ProfileCard = ({ user, onEdit }) => {
  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.ADMIN]: 'red',
      [USER_ROLES.DOSEN]: 'blue',
      [USER_ROLES.MAHASISWA]: 'green',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      [USER_ROLES.ADMIN]: 'Admin',
      [USER_ROLES.DOSEN]: 'Dosen',
      [USER_ROLES.MAHASISWA]: 'Mahasiswa',
    };
    return labels[role] || role;
  };

  return (
    <Card
      title="Profil Pengguna"
      extra={
        onEdit && (
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit Profil
          </Button>
        )
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Avatar 
            size={120} 
            icon={<UserOutlined />} 
            src={user?.avatar}
            style={{ marginBottom: '16px' }}
          />
          <h2 style={{ margin: '8px 0' }}>{user?.name}</h2>
          <Tag color={getRoleColor(user?.role)}>
            {getRoleLabel(user?.role)}
          </Tag>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item 
            label={<Space><MailOutlined /> Email</Space>}
          >
            {user?.email}
          </Descriptions.Item>
          
          {user?.nim && (
            <Descriptions.Item label="NIM">
              {user.nim}
            </Descriptions.Item>
          )}
          
          {user?.nidn && (
            <Descriptions.Item label="NIDN">
              {user.nidn}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item 
            label={<Space><PhoneOutlined /> No. Telepon</Space>}
          >
            {user?.phone || '-'}
          </Descriptions.Item>
          
          {user?.role === USER_ROLES.MAHASISWA && (
            <>
              <Descriptions.Item label="Program Studi">
                {user?.studyProgram || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Angkatan">
                {user?.batch || '-'}
              </Descriptions.Item>
            </>
          )}
          
          {user?.role === USER_ROLES.DOSEN && (
            <>
              <Descriptions.Item label="Departemen">
                {user?.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Jabatan">
                {user?.position || '-'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Space>
    </Card>
  );
};

export default ProfileCard;