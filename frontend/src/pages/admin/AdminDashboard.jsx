// pages/admin/AdminDashboard.jsx
import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Progress,
  Spin,
  Alert,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard stats
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: adminApi.getDashboardStats,
  });

  // Fetch students not meeting requirements
  const { 
    data: notMeetingData, 
    isLoading: notMeetingLoading,
    error: notMeetingError,
    refetch: refetchNotMeeting
  } = useQuery({
    queryKey: ['studentsNotMeeting'],
    queryFn: () => adminApi.getStudentsNotMeetingRequirements({}),
  });

  const notMeetingStudents = notMeetingData?.students || [];

  // Table columns for students not meeting requirements
  const columns = [
    {
      title: 'NPM',
      dataIndex: 'npm',
      key: 'npm',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Nama Mahasiswa',
      dataIndex: 'nama',
      key: 'nama',
      width: 200,
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'TA1' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
      width: 80,
    },
    {
      title: 'Dosen Pembimbing',
      dataIndex: 'dosen',
      key: 'dosen',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Sebelum UTS',
      key: 'uts',
      render: (_, record) => {
        const percent = (record.beforeUTS / record.requiredBeforeUTS) * 100;
        const status = record.beforeUTS >= record.requiredBeforeUTS ? 'success' : 'exception';
        
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text type={status === 'success' ? 'success' : 'danger'}>
              {record.beforeUTS} / {record.requiredBeforeUTS}
            </Text>
            <Progress
              percent={percent}
              size="small"
              status={status}
              showInfo={false}
            />
          </Space>
        );
      },
      width: 120,
    },
    {
      title: 'Sebelum UAS',
      key: 'uas',
      render: (_, record) => {
        const percent = (record.beforeUAS / record.requiredBeforeUAS) * 100;
        const status = record.beforeUAS >= record.requiredBeforeUAS ? 'success' : 'exception';
        
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text type={status === 'success' ? 'success' : 'danger'}>
              {record.beforeUAS} / {record.requiredBeforeUAS}
            </Text>
            <Progress
              percent={percent}
              size="small"
              status={status}
              showInfo={false}
            />
          </Space>
        );
      },
      width: 120,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const meetsUTS = record.beforeUTS >= record.requiredBeforeUTS;
        const meetsUAS = record.beforeUAS >= record.requiredBeforeUAS;
        
        if (meetsUTS && meetsUAS) {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Memenuhi Syarat
            </Tag>
          );
        } else {
          return (
            <Tag color="error" icon={<WarningOutlined />}>
              Belum Memenuhi
            </Tag>
          );
        }
      },
      width: 150,
      fixed: 'right',
    },
  ];

  // Handle refresh
  const handleRefresh = () => {
    refetchStats();
    refetchNotMeeting();
  };

  // Loading state
  if (statsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Memuat data dashboard...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <Alert
        message="Error Memuat Data"
        description={statsError.message || 'Gagal memuat data dashboard'}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Coba Lagi
          </Button>
        }
      />
    );
  }

  const completionRate = stats?.totalSessions > 0 
    ? ((stats.completedSessions / stats.totalSessions) * 100).toFixed(1)
    : 0;

  const avgSessionsPerStudent = stats?.totalMahasiswa > 0
    ? (stats.completedSessions / stats.totalMahasiswa).toFixed(1)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Dashboard Admin
          </Title>
          <Text type="secondary">Overview sistem manajemen bimbingan</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* User Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Pengguna"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Semua user di sistem
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Dosen"
              value={stats?.totalDosen || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Dosen pembimbing aktif
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Mahasiswa"
              value={stats?.totalMahasiswa || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mahasiswa terdaftar
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Belum Memenuhi Syarat"
              value={notMeetingStudents.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mahasiswa perlu perhatian
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Session Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Bimbingan"
              value={stats?.totalSessions || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Semua sesi bimbingan
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Menunggu Persetujuan"
              value={stats?.pendingSessions || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Perlu review dosen
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Selesai"
              value={stats?.completedSessions || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tingkat penyelesaian: {completionRate}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Rata-rata per Mahasiswa"
              value={avgSessionsPerStudent}
              prefix={<BarChartOutlined />}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sesi per mahasiswa
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Students Not Meeting Requirements */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Mahasiswa Belum Memenuhi Syarat Sidang</span>
                <Tag color="error">{notMeetingStudents.length}</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={refetchNotMeeting}
                  loading={notMeetingLoading}
                  size="small"
                >
                  Refresh
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/admin/monitoring')}
                >
                  Lihat Laporan Lengkap
                </Button>
              </Space>
            }
            loading={notMeetingLoading}
          >
            {notMeetingError ? (
              <Alert
                message="Error Memuat Data"
                description={notMeetingError.message}
                type="error"
                showIcon
              />
            ) : notMeetingStudents.length === 0 ? (
              <Alert
                message="Semua Mahasiswa Memenuhi Syarat"
                description="Tidak ada mahasiswa yang belum memenuhi syarat bimbingan untuk saat ini."
                type="success"
                showIcon
              />
            ) : (
              <>
                <Alert
                  message={`${notMeetingStudents.length} mahasiswa belum memenuhi syarat minimum bimbingan`}
                  description="Mahasiswa memerlukan minimal 4 kali bimbingan sebelum UTS dan 4 kali sebelum UAS untuk dapat mengikuti sidang."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={columns}
                  dataSource={notMeetingStudents}
                  rowKey="npm"
                  pagination={{ 
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} mahasiswa`,
                  }}
                  scroll={{ x: 1200 }}
                  size="small"
                />
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Aksi Cepat">
            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate('/admin/users')}
                size="large"
              >
                Kelola Pengguna
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate('/admin/import')}
                size="large"
              >
                Import Data
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate('/admin/monitoring')}
                size="large"
              >
                Monitoring & Laporan
              </Button>
              <Button
                onClick={() => navigate('/admin/academic-periods')}
                size="large"
              >
                Periode Akademik
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;