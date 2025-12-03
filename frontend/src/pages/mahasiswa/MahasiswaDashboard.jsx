// pages/mahasiswa/MahasiswaDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Typography,
  Button,
  Tag,
  Alert,
  Space,
  Calendar,
  Badge,
  Empty,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text } = Typography;

dayjs.locale('id');

const MahasiswaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState({
    totalGuidance: 8,
    pendingSessions: 2,
    completedSessions: 6,
    beforeUTS: 3,
    beforeUAS: 5,
  });

  // Mock data untuk upcoming sessions
  useEffect(() => {
    setUpcomingSessions([
      {
        id: 1,
        date: '2025-10-08',
        time: '10:00',
        dosen: 'Dr. Ir. Budi Santoso, M.Kom',
        location: 'Ruang 9310',
        status: 'approved',
      },
      {
        id: 2,
        date: '2025-10-12',
        time: '14:00',
        dosen: 'Dr. Siti Rahma, S.Kom, M.T',
        location: 'Online (Zoom)',
        status: 'pending',
      },
    ]);
  }, []);

  // Check if meets requirements
  const meetsRequirements = () => {
    const thesis = user?.profile?.thesisType || 'TA1';
    if (thesis === 'TA1') {
      return stats.beforeUTS >= 2 && stats.beforeUAS >= 2;
    } else {
      return stats.beforeUTS >= 3 && stats.beforeUAS >= 3;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'pending':
        return 'Menunggu';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const renderCalendarCell = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const session = upcomingSessions.find((s) => s.date === dateStr);

    if (session) {
      return (
        <Badge
          status={session.status === 'approved' ? 'success' : 'warning'}
          text={session.time}
        />
      );
    }
    return null;
  };

  return (
    <div>
      <Title level={2}>Dashboard Mahasiswa</Title>
      <Text type="secondary">
        Selamat datang, {user?.profile?.nama || 'Mahasiswa'}
      </Text>

      {/* Requirements Check Alert */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          {!meetsRequirements() && (
            <Alert
              message="Peringatan: Belum Memenuhi Syarat Sidang"
              description={
                <div>
                  <p>
                    Anda belum memenuhi jumlah minimum bimbingan untuk sidang{' '}
                    {user?.profile?.thesisType || 'TA1'}.
                  </p>
                  <ul>
                    <li>
                      Sebelum UTS: {stats.beforeUTS} /{' '}
                      {user?.profile?.thesisType === 'TA2' ? '3' : '2'}
                    </li>
                    <li>
                      Sebelum UAS: {stats.beforeUAS} /{' '}
                      {user?.profile?.thesisType === 'TA2' ? '3' : '2'}
                    </li>
                  </ul>
                </div>
              }
              type="warning"
              icon={<WarningOutlined />}
              showIcon
            />
          )}
          {meetsRequirements() && (
            <Alert
              message="Selamat! Anda Sudah Memenuhi Syarat Sidang"
              description={`Anda telah menyelesaikan jumlah minimum bimbingan yang diperlukan untuk sidang ${
                user?.profile?.thesisType || 'TA1'
              }.`}
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
            />
          )}
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bimbingan"
              value={stats.totalGuidance}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Menunggu Persetujuan"
              value={stats.pendingSessions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bimbingan Sebelum UTS"
              value={stats.beforeUTS}
              suffix={`/ ${user?.profile?.thesisType === 'TA2' ? '3' : '2'}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: stats.beforeUTS >= (user?.profile?.thesisType === 'TA2' ? 3 : 2)
                  ? '#52c41a'
                  : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bimbingan Sebelum UAS"
              value={stats.beforeUAS}
              suffix={`/ ${user?.profile?.thesisType === 'TA2' ? '3' : '2'}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: stats.beforeUAS >= (user?.profile?.thesisType === 'TA2' ? 3 : 2)
                  ? '#52c41a'
                  : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Upcoming Sessions */}
        <Col xs={24} lg={12}>
          <Card
            title="Jadwal Bimbingan Mendatang"
            extra={
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/mahasiswa/request-guidance')}
              >
                Ajukan Bimbingan
              </Button>
            }
          >
            {upcomingSessions.length > 0 ? (
              <Timeline>
                {upcomingSessions.map((session) => (
                  <Timeline.Item
                    key={session.id}
                    color={session.status === 'approved' ? 'green' : 'orange'}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong>
                        {dayjs(session.date).format('dddd, DD MMMM YYYY')} -{' '}
                        {session.time}
                      </Text>
                      <Text>
                        <UserOutlined /> {session.dosen}
                      </Text>
                      <Text type="secondary">
                        <CalendarOutlined /> {session.location}
                      </Text>
                      <Tag color={getStatusColor(session.status)}>
                        {getStatusText(session.status)}
                      </Tag>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="Belum ada jadwal bimbingan" />
            )}
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={12}>
          <Card title="Kalender Bimbingan">
            <Calendar
              fullscreen={false}
              cellRender={renderCalendarCell}
              onSelect={(date) => {
                console.log('Selected date:', date.format('YYYY-MM-DD'));
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Aksi Cepat">
            <Space wrap>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/mahasiswa/request-guidance')}
              >
                Ajukan Bimbingan Baru
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate('/mahasiswa/history')}
              >
                Lihat Riwayat Bimbingan
              </Button>
              <Button
                icon={<CalendarOutlined />}
                onClick={() => navigate('/mahasiswa/schedule')}
              >
                Kelola Jadwal Kuliah
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MahasiswaDashboard;