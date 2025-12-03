// pages/dosen/DosenDashboard.jsx
import React, { useState, useEffect } from 'react';
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
  Badge,
  List,
  Avatar,
  Progress,
  message,
  Modal,
  Input,
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
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { guidanceApi } from '../../api/guidance.api';
import Loading from '../../components/common/Loading';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text } = Typography;
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
    return <Loading tip="Memuat dashboard..." />;
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
          >
            Setujui
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleRejectClick(record)}
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
      render: (type) => <Tag color="blue">{type}</Tag>,
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
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Memenuhi Syarat
          </Tag>
        ) : (
          <Tag color="warning" icon={<WarningOutlined />}>
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
    <div>
      <Title level={2}>Dashboard Dosen</Title>
      <Text type="secondary">
        Selamat datang, {user?.profile?.nama || 'Dosen'}
      </Text>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Mahasiswa Bimbingan"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/dosen/sessions?status=PENDING')}>
            <Statistic
              title="Permintaan Menunggu"
              value={stats.pendingRequests}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bimbingan Hari Ini"
              value={stats.todaySessions}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Selesai Bulan Ini"
              value={stats.completedThisMonth}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Pending Requests */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Permintaan Bimbingan Menunggu</span>
                {stats.pendingRequests > 0 && (
                  <Badge count={stats.pendingRequests} />
                )}
              </Space>
            }
            extra={
              <Button onClick={() => navigate('/dosen/sessions?status=PENDING')}>
                Lihat Semua
              </Button>
            }
          >
            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Tidak ada permintaan bimbingan</Text>
              </div>
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
            title={
              <Space>
                <CalendarOutlined />
                <span>Jadwal Hari Ini</span>
              </Space>
            }
          >
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Tidak ada jadwal hari ini</Text>
              </div>
            ) : (
              <List
                dataSource={todaySessions}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dosen/sessions/${item.id}`)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <Text strong>
                            {item.start_time?.substring(0, 5)}
                          </Text>
                          <Tag color="blue">{item.tipe}</Tag>
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

      {/* Offered Sessions Alert */}
      {stats.offeredSessions > 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card
              style={{ 
                backgroundColor: '#e6f7ff',
                borderColor: '#91d5ff'
              }}
            >
              <Space>
                <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Text strong>
                    Ada {stats.offeredSessions} tawaran bimbingan menunggu respons mahasiswa
                  </Text>
                  <br />
                  <Button 
                    type="link" 
                    style={{ padding: 0 }}
                    onClick={() => navigate('/dosen/sessions?status=OFFERED')}
                  >
                    Lihat tawaran →
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Student Progress */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Progress Mahasiswa Bimbingan</span>
              </Space>
            }
            extra={
              <Button onClick={() => navigate('/dosen/students')}>
                Lihat Detail
              </Button>
            }
          >
            {studentProgress.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Belum ada mahasiswa bimbingan</Text>
              </div>
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