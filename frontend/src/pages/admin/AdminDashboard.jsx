// pages/admin/AdminDashboard.jsx - Modern Premium Design
import React from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Progress,
  Spin,
  Empty,
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
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import StatCard from '../../components/common/StatCard';

const { Title, Text, Paragraph } = Typography;

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
        <Tag color={type === 'TA1' ? 'blue' : 'green'} style={{ borderRadius: '8px' }}>
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
            <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '8px' }}>
              Memenuhi Syarat
            </Tag>
          );
        } else {
          return (
            <Tag color="error" icon={<WarningOutlined />} style={{ borderRadius: '8px' }}>
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
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Memuat dashboard..." />
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderLeft: '4px solid #f43f5e',
          padding: '20px 24px',
          boxShadow: '0 4px 16px rgba(244, 63, 94, 0.1)',
        }}
      >
        <Space>
          <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f43f5e' }} />
          <div>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
              Error Memuat Data
            </Text>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {statsError.message || 'Gagal memuat data dashboard'}
            </Text>
            <Button
              size="small"
              onClick={handleRefresh}
              style={{ marginTop: 8, borderRadius: '8px' }}
            >
              Coba Lagi
            </Button>
          </div>
        </Space>
      </div>
    );
  }

  const completionRate = stats?.totalSessions > 0 
    ? ((stats.completedSessions / stats.totalSessions) * 100).toFixed(1)
    : 0;

  const avgSessionsPerStudent = stats?.totalMahasiswa > 0
    ? (stats.completedSessions / stats.totalMahasiswa).toFixed(1)
    : 0;

  return (
    <div style={{ padding: 0 }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
            Dashboard Admin
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Overview sistem manajemen bimbingan
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            borderRadius: '12px',
            height: 40,
          }}
        >
          Refresh
        </Button>
      </div>

      {/* User Statistics - Modern Bento Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pengguna"
            value={stats?.totalUsers || 0}
            icon={UserOutlined}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Dosen"
            value={stats?.totalDosen || 0}
            icon={TeamOutlined}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Mahasiswa"
            value={stats?.totalMahasiswa || 0}
            icon={TeamOutlined}
            color="purple"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Belum Memenuhi Syarat"
            value={notMeetingStudents.length}
            icon={WarningOutlined}
            color="rose"
          />
        </Col>
      </Row>

      {/* Session Statistics - Modern Bento Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Bimbingan"
            value={stats?.totalSessions || 0}
            icon={FileTextOutlined}
            color="indigo"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Menunggu Persetujuan"
            value={stats?.pendingSessions || 0}
            icon={ClockCircleOutlined}
            color="amber"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Selesai"
            value={stats?.completedSessions || 0}
            suffix={`(${completionRate}%)`}
            icon={CheckCircleOutlined}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Rata-rata per Mahasiswa"
            value={avgSessionsPerStudent}
            icon={BarChartOutlined}
            color="purple"
          />
        </Col>
      </Row>

      {/* Students Not Meeting Requirements */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
            }}
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <Text strong style={{ fontSize: 18 }}>
                  Mahasiswa Belum Memenuhi Syarat Sidang
                </Text>
                <Tag color="error" style={{ borderRadius: '8px' }}>
                  {notMeetingStudents.length}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refetchNotMeeting}
                  loading={notMeetingLoading}
                  size="small"
                  style={{ borderRadius: '8px' }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/admin/monitoring')}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                >
                  Lihat Laporan Lengkap
                </Button>
              </Space>
            }
            loading={notMeetingLoading}
          >
            {notMeetingError ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  borderLeft: '4px solid #f43f5e',
                  padding: '20px 24px',
                  boxShadow: '0 4px 16px rgba(244, 63, 94, 0.1)',
                }}
              >
                <Space>
                  <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f43f5e' }} />
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Error Memuat Data
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {notMeetingError.message}
                    </Text>
                  </div>
                </Space>
              </div>
            ) : notMeetingStudents.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderLeft: '4px solid #10b981',
                  padding: '20px 24px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
                }}
              >
                <Space>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />
                  <div>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                      Semua Mahasiswa Memenuhi Syarat
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Tidak ada mahasiswa yang belum memenuhi syarat bimbingan untuk saat ini.
                    </Text>
                  </div>
                </Space>
              </div>
            ) : (
              <>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderLeft: '4px solid #f59e0b',
                    padding: '20px 24px',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
                    marginBottom: 16,
                  }}
                >
                  <Space align="start" size="middle">
                    <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f59e0b', marginTop: 2 }} />
                    <div>
                      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                        {notMeetingStudents.length} mahasiswa belum memenuhi syarat minimum bimbingan
                      </Text>
                      <Paragraph style={{ marginBottom: 0, color: '#64748b' }}>
                        Mahasiswa memerlukan minimal 4 kali bimbingan sebelum UTS dan 4 kali sebelum UAS untuk dapat mengikuti sidang.
                      </Paragraph>
                    </div>
                  </Space>
                </div>
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
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
            }}
            title={
              <Text strong style={{ fontSize: 18 }}>
                Aksi Cepat
              </Text>
            }
          >
            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate('/admin/users')}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  height: 48,
                }}
              >
                Kelola Pengguna
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => navigate('/admin/import')}
                size="large"
                style={{ borderRadius: '12px', height: 48 }}
              >
                Import Data
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate('/admin/monitoring')}
                size="large"
                style={{ borderRadius: '12px', height: 48 }}
              >
                Monitoring & Laporan
              </Button>
              <Button
                onClick={() => navigate('/admin/academic-periods')}
                size="large"
                style={{ borderRadius: '12px', height: 48 }}
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
