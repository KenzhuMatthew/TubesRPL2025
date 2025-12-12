// pages/dosen/DosenDashboard.jsx - Modern Premium Design
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Badge,
  List,
  Avatar,
  Progress,
  message,
  Modal,
  Input,
  Spin,
  Empty,
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { guidanceApi } from '../../api/guidance.api';
import StatCard from '../../components/common/StatCard';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

dayjs.locale('id');

const DosenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [offeredSessions, setOfferedSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRequests: 0,
    offeredSessions: 0,
    todaySessions: 0,
    completedThisMonth: 0,
  });
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [approveLocation, setApproveLocation] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all sessions
      const sessionsResponse = await guidanceApi.getDosenSessions({});
      const allSessions = sessionsResponse.sessions || [];

      // Filter sessions by status
      const pending = allSessions.filter(s => s.status === 'PENDING');
      const offered = allSessions.filter(s => s.status === 'OFFERED');
      const approved = allSessions.filter(s => s.status === 'APPROVED');
      
      // Filter today's sessions
      const today = dayjs().format('YYYY-MM-DD');
      const todayApproved = approved.filter(s => 
        dayjs(s.scheduled_date).format('YYYY-MM-DD') === today
      );

      // Count completed sessions this month
      const currentMonth = dayjs().format('YYYY-MM');
      const completedThisMonth = allSessions.filter(s => 
        s.status === 'COMPLETED' && 
        dayjs(s.scheduled_date).format('YYYY-MM') === currentMonth
      ).length;

      // Load students
      const studentsResponse = await guidanceApi.getStudents();
      const students = studentsResponse.students || [];

      setPendingRequests(pending);
      setOfferedSessions(offered);
      setTodaySessions(todayApproved);
      setStudentProgress(students);
      setStats({
        totalStudents: students.length,
        pendingRequests: pending.length,
        offeredSessions: offered.length,
        todaySessions: todayApproved.length,
        completedThisMonth,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      message.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (session) => {
    setSelectedSession(session);
    setApproveLocation(session.location || '');
    setApproveModalVisible(true);
  };

  const handleApproveConfirm = async () => {
    try {
      await guidanceApi.approveSession(selectedSession.id, approveLocation);
      message.success('Bimbingan berhasil disetujui');
      setApproveModalVisible(false);
      setApproveLocation('');
      setSelectedSession(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error approving session:', error);
      message.error(error.response?.data?.message || 'Gagal menyetujui bimbingan');
    }
  };

  const handleRejectClick = (session) => {
    setSelectedSession(session);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await guidanceApi.rejectSession(selectedSession.id, rejectReason);
      message.success('Bimbingan ditolak');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedSession(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting session:', error);
      message.error(error.response?.data?.message || 'Gagal menolak bimbingan');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Memuat dashboard..." />
      </div>
    );
  }

  const pendingColumns = [
    {
      title: 'Mahasiswa',
      key: 'mahasiswa',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.mahasiswa_nama}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.npm}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Judul',
      dataIndex: 'judul',
      key: 'judul',
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Tanggal & Waktu',
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(record.scheduled_date).format('DD MMM YYYY')}</Text>
          <Text type="secondary">
            {record.start_time?.substring(0, 5)} - {record.end_time?.substring(0, 5)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
      render: (text) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{text || 'TBD'}</Text>
        </Space>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApproveClick(record)}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Setujui
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleRejectClick(record)}
            style={{ borderRadius: '8px' }}
          >
            Tolak
          </Button>
        </Space>
      ),
    },
  ];

  const progressColumns = [
    {
      title: 'Mahasiswa',
      key: 'mahasiswa',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.nama}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.npm}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Tipe',
      dataIndex: 'thesisType',
      key: 'thesisType',
      render: (type) => <Tag color="blue" style={{ borderRadius: '8px' }}>{type}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'totalGuidance',
      key: 'totalGuidance',
      align: 'center',
    },
    {
      title: 'Sebelum UTS',
      key: 'beforeUTS',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.beforeUTS / record.requiredBeforeUTS) * 100)}
          size="small"
          status={record.beforeUTS >= record.requiredBeforeUTS ? 'success' : 'exception'}
          format={() => `${record.beforeUTS}/${record.requiredBeforeUTS}`}
        />
      ),
    },
    {
      title: 'Sebelum UAS',
      key: 'beforeUAS',
      render: (_, record) => (
        <Progress
          percent={Math.round((record.beforeUAS / record.requiredBeforeUAS) * 100)}
          size="small"
          status={record.beforeUAS >= record.requiredBeforeUAS ? 'success' : 'exception'}
          format={() => `${record.beforeUAS}/${record.requiredBeforeUAS}`}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) =>
        record.meetsRequirement ? (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '8px' }}>
            Memenuhi Syarat
          </Tag>
        ) : (
          <Tag color="warning" icon={<WarningOutlined />} style={{ borderRadius: '8px' }}>
            Belum Memenuhi
          </Tag>
        ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/dosen/students/${record.id}`)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
          Dashboard Dosen
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Selamat datang, <Text strong>{user?.profile?.nama || 'Dosen'}</Text>
        </Text>
      </div>

      {/* Modern Bento Grid Stats Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Mahasiswa Bimbingan"
            value={stats.totalStudents}
            icon={TeamOutlined}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Permintaan Menunggu"
            value={stats.pendingRequests}
            icon={ClockCircleOutlined}
            color="amber"
            onClick={() => navigate('/dosen/sessions?status=PENDING')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Bimbingan Hari Ini"
            value={stats.todaySessions}
            icon={CalendarOutlined}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Selesai Bulan Ini"
            value={stats.completedThisMonth}
            icon={CheckCircleOutlined}
            color="purple"
          />
        </Col>
      </Row>

      {/* Offered Sessions Alert - Modern Design */}
      {stats.offeredSessions > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(24, 144, 255, 0.2)',
              borderLeft: '4px solid #1890ff',
              padding: '20px 24px',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.1)',
            }}
          >
            <Space align="start" size="middle">
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                  Ada {stats.offeredSessions} tawaran bimbingan menunggu respons mahasiswa
                </Text>
                <Button
                  type="link"
                  style={{ padding: 0, height: 'auto' }}
                  onClick={() => navigate('/dosen/sessions?status=OFFERED')}
                >
                  Lihat tawaran →
                </Button>
              </div>
            </Space>
          </div>
        </div>
      )}

      {/* Content Section */}
      <Row gutter={[20, 20]}>
        {/* Pending Requests */}
        <Col xs={24} xl={14}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
              height: '100%',
            }}
            title={
              <Space>
                <ClockCircleOutlined />
                <Text strong style={{ fontSize: 18 }}>
                  Permintaan Bimbingan Menunggu
                </Text>
                {stats.pendingRequests > 0 && (
                  <Badge count={stats.pendingRequests} />
                )}
              </Space>
            }
            extra={
              <Button
                onClick={() => navigate('/dosen/sessions?status=PENDING')}
                style={{ borderRadius: '12px' }}
              >
                Lihat Semua
              </Button>
            }
          >
            {pendingRequests.length === 0 ? (
              <Empty
                description="Tidak ada permintaan bimbingan"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={pendingColumns}
                dataSource={pendingRequests.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>

        {/* Today's Sessions */}
        <Col xs={24} xl={10}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
              height: '100%',
            }}
            title={
              <Space>
                <CalendarOutlined />
                <Text strong style={{ fontSize: 18 }}>
                  Jadwal Hari Ini
                </Text>
              </Space>
            }
          >
            {todaySessions.length === 0 ? (
              <Empty
                description="Tidak ada jadwal hari ini"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={todaySessions}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '12px 0',
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(24, 144, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => navigate(`/dosen/sessions/${item.id}`)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <Text strong>
                            {item.start_time?.substring(0, 5)}
                          </Text>
                          <Tag color="blue" style={{ borderRadius: '8px' }}>{item.tipe}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>{item.mahasiswa_nama} ({item.npm})</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> {item.location}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Student Progress */}
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
                <FileTextOutlined />
                <Text strong style={{ fontSize: 18 }}>
                  Progress Mahasiswa Bimbingan
                </Text>
              </Space>
            }
            extra={
              <Button
                onClick={() => navigate('/dosen/students')}
                style={{ borderRadius: '12px' }}
              >
                Lihat Detail
              </Button>
            }
          >
            {studentProgress.length === 0 ? (
              <Empty
                description="Belum ada mahasiswa bimbingan"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={progressColumns}
                dataSource={studentProgress}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Approve Modal */}
      <Modal
        title="Setujui Bimbingan"
        open={approveModalVisible}
        onOk={handleApproveConfirm}
        onCancel={() => {
          setApproveModalVisible(false);
          setApproveLocation('');
          setSelectedSession(null);
        }}
        okText="Setujui"
        cancelText="Batal"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Setujui bimbingan dengan <Text strong>{selectedSession?.mahasiswa_nama}</Text>?
          </Text>
          <div>
            <Text>Lokasi Bimbingan:</Text>
            <Input
              value={approveLocation}
              onChange={(e) => setApproveLocation(e.target.value)}
              placeholder="Contoh: Ruang Dosen GKU Lt.3"
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Tolak Bimbingan"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedSession(null);
        }}
        okText="Tolak"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Tolak bimbingan dengan <Text strong>{selectedSession?.mahasiswa_nama}</Text>?
          </Text>
          <div>
            <Text>Alasan penolakan (opsional):</Text>
            <TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DosenDashboard;
