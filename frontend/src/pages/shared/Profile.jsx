// pages/shared/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Descriptions,
  Tag,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { USER_ROLES } from '../../utils/constants';
import { getInitials, stringToColor, formatStudentCode } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleEditProfile = () => {
    const role = user?.role?.toLowerCase();
    navigate(`/${role}/profile/edit`);
  };

  const handleChangePassword = () => {
    const role = user?.role?.toLowerCase();
    navigate(`/${role}/profile/change-password`);
  };

  const getRoleLabel = (role) => {
    const labels = {
      [USER_ROLES.ADMIN]: 'Administrator',
      [USER_ROLES.DOSEN]: 'Dosen Pembimbing',
      [USER_ROLES.MAHASISWA]: 'Mahasiswa',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.ADMIN]: 'red',
      [USER_ROLES.DOSEN]: 'blue',
      [USER_ROLES.MAHASISWA]: 'green',
    };
    return colors[role] || 'default';
  };

  if (!user) {
    return (
      <Card>
        <Text>Loading...</Text>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Profil Saya
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Lihat dan kelola informasi profil Anda
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              {/* Avatar */}
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user.avatar}
                style={{
                  backgroundColor: stringToColor(user.name || user.email),
                  fontSize: 48,
                  marginBottom: 16,
                }}
              >
                {!user.avatar && getInitials(user.name || user.email)}
              </Avatar>

              {/* Name */}
              <Title level={4} style={{ marginBottom: 8 }}>
                {user.name || 'Nama Tidak Tersedia'}
              </Title>

              {/* Role */}
              <Tag color={getRoleColor(user.role)} style={{ marginBottom: 16 }}>
                {getRoleLabel(user.role)}
              </Tag>

              {/* Email */}
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <MailOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{user.email}</Text>
                </Space>
              </div>

              {/* Phone */}
              {user.phone && (
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <PhoneOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{user.phone}</Text>
                  </Space>
                </div>
              )}

              <Divider />

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  block
                  onClick={handleEditProfile}
                >
                  Edit Profil
                </Button>
                <Button
                  icon={<LockOutlined />}
                  block
                  onClick={handleChangePassword}
                >
                  Ganti Password
                </Button>
              </Space>
            </div>
          </Card>

          {/* Status Card */}
          <Card title="Status Akun" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Status:</Text>
                <Tag color={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </Tag>
              </div>
              {user.createdAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Terdaftar:</Text>
                  <Text>{dayjs(user.createdAt).format('DD MMMM YYYY')}</Text>
                </div>
              )}
              {user.lastLogin && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Login Terakhir:</Text>
                  <Text>{dayjs(user.lastLogin).format('DD MMM YYYY, HH:mm')}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Details Card */}
        <Col xs={24} lg={16}>
          <Card title="Informasi Detail">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Nama Lengkap" span={2}>
                {user.name || '-'}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>

              <Descriptions.Item label="No. Telepon">
                {user.phone || '-'}
              </Descriptions.Item>

              {user.role === USER_ROLES.MAHASISWA && (
                <>
                  <Descriptions.Item label="NIM">
                    {user.nim ? formatStudentCode(user.nim) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Angkatan">
                    {user.angkatan || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Program Studi" span={2}>
                    {user.programStudi || '-'}
                  </Descriptions.Item>
                </>
              )}

              {user.role === USER_ROLES.DOSEN && (
                <>
                  <Descriptions.Item label="NIDN">
                    {user.nidn || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Jabatan">
                    {user.jabatan || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fakultas" span={2}>
                    {user.fakultas || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Program Studi" span={2}>
                    {user.programStudi || '-'}
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Alamat" span={2}>
                {user.alamat || '-'}
              </Descriptions.Item>

              <Descriptions.Item label="Role">
                <Tag color={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag color={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Additional Info for Students */}
          {user.role === USER_ROLES.MAHASISWA && user.thesisProject && (
            <Card title="Informasi Tugas Akhir" style={{ marginTop: 24 }}>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="Judul TA" span={2}>
                  {user.thesisProject.title || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Jenis TA">
                  <Tag color={user.thesisProject.type === 'TA1' ? 'blue' : 'green'}>
                    {user.thesisProject.type}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="processing">
                    {user.thesisProject.status || 'Aktif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Pembimbing 1" span={2}>
                  {user.thesisProject.supervisor1?.name || '-'}
                </Descriptions.Item>
                {user.thesisProject.supervisor2 && (
                  <Descriptions.Item label="Pembimbing 2" span={2}>
                    {user.thesisProject.supervisor2.name}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Additional Info for Lecturers */}
          {user.role === USER_ROLES.DOSEN && (
            <Card title="Statistik Bimbingan" style={{ marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={3} style={{ marginBottom: 0, color: '#1890ff' }}>
                        {user.stats?.totalStudents || 0}
                      </Title>
                      <Text type="secondary">Mahasiswa Bimbingan</Text>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={3} style={{ marginBottom: 0, color: '#52c41a' }}>
                        {user.stats?.completedSessions || 0}
                      </Title>
                      <Text type="secondary">Sesi Selesai</Text>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <Title level={3} style={{ marginBottom: 0, color: '#faad14' }}>
                        {user.stats?.pendingSessions || 0}
                      </Title>
                      <Text type="secondary">Sesi Pending</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Profile;