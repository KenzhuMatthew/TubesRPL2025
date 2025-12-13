// pages/mahasiswa/MahasiswaDashboard.jsx - Modern Premium Design
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Calendar,
  Badge,
  Empty,
  Spin,
  message,
  Card,
  Timeline,
  Modal,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getDashboard, acceptOfferedSession, declineOfferedSession } from '../../api/mahasiswa.api';
import StatCard from '../../components/common/StatCard';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text, Paragraph } = Typography;

dayjs.locale('id');

const MahasiswaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState({
    totalGuidance: 0,
    pendingSessions: 0,
    completedSessions: 0,
    beforeUTS: 0,
    beforeUAS: 0,
    offeredSessions: 0,
  });
  const [thesisProject, setThesisProject] = useState(null);
  const [hasThesisProject, setHasThesisProject] = useState(false);
  const [offeredSessions, setOfferedSessions] = useState([]);
  const [processingSession, setProcessingSession] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      const data = response.data || response;

      if (data.hasThesisProject && data.thesisProject) {
        setStats({
          totalGuidance: data.stats?.totalGuidance || 0,
          pendingSessions: data.stats?.pendingSessions || 0,
          completedSessions: data.stats?.totalGuidance || 0,
          beforeUTS: data.stats?.beforeUTS || 0,
          beforeUAS: data.stats?.beforeUAS || 0,
          offeredSessions: data.stats?.offeredSessions || 0,
        });

        // Separate offered sessions
        const offered = (data.upcomingSessions || []).filter(
          (s) => s.status?.toUpperCase() === 'OFFERED'
        );
        setOfferedSessions(offered);

        setThesisProject(data.thesisProject);
        setHasThesisProject(true);

        // Map upcoming sessions from API format to UI format (exclude OFFERED as they're shown separately)
        const mappedSessions = (data.upcomingSessions || [])
          .filter((s) => s.status?.toUpperCase() !== 'OFFERED')
          .map((session) => {
            const primarySupervisor = session.supervisors?.find(
              (s) => s.supervisor_order === 1
            ) || session.supervisors?.[0] || { nama: 'Dosen Pembimbing' };

            const timeStr = session.start_time || '';
            const formattedTime = timeStr.substring(0, 5);

            return {
              id: session.id,
              date: session.scheduled_date,
              time: formattedTime,
              dosen: primarySupervisor.nama,
              location: session.location || 'TBD',
              status: session.status?.toLowerCase() || 'pending',
              session: session,
            };
          });

        setUpcomingSessions(mappedSessions);
      } else {
        setStats({
          totalGuidance: 0,
          pendingSessions: 0,
          completedSessions: 0,
          beforeUTS: 0,
          beforeUAS: 0,
        });
        setUpcomingSessions([]);
        setHasThesisProject(false);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      message.error(error.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const meetsRequirements = () => {
    const thesisType = thesisProject?.tipe || user?.profile?.thesisType || 'TA1';
    if (thesisType === 'TA1') {
      return stats.beforeUTS >= 2 && stats.beforeUAS >= 2;
    } else {
      return stats.beforeUTS >= 3 && stats.beforeUAS >= 3;
    }
  };

  const getThesisType = () => {
    return thesisProject?.tipe || user?.profile?.thesisType || 'TA1';
  };

  const handleAcceptOffer = async (sessionId) => {
    try {
      setProcessingSession(sessionId);
      await acceptOfferedSession(sessionId);
      message.success('Tawaran bimbingan berhasil diterima');
      fetchDashboardData();
    } catch (error) {
      console.error('Accept offer error:', error);
      message.error(error.response?.data?.message || 'Gagal menerima tawaran');
    } finally {
      setProcessingSession(null);
    }
  };

  const handleDeclineOffer = async (sessionId) => {
    Modal.confirm({
      title: 'Tolak Tawaran Bimbingan',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Apakah Anda yakin ingin menolak tawaran bimbingan ini?',
      okText: 'Ya, Tolak',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          setProcessingSession(sessionId);
          await declineOfferedSession(sessionId, 'Ditolak oleh mahasiswa');
          message.success('Tawaran bimbingan ditolak');
          fetchDashboardData();
        } catch (error) {
          console.error('Decline offer error:', error);
          message.error(error.response?.data?.message || 'Gagal menolak tawaran');
        } finally {
          setProcessingSession(null);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'offered':
        return 'processing';
      case 'rejected':
      case 'declined':
        return 'error';
      case 'completed':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Disetujui';
      case 'pending':
        return 'Menunggu';
      case 'offered':
        return 'Tawaran dari Dosen';
      case 'rejected':
      case 'declined':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      default:
        return status || 'Menunggu';
    }
  };

  const renderCalendarCell = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const session = upcomingSessions.find((s) => {
      const sessionDate = dayjs(s.date).format('YYYY-MM-DD');
      return sessionDate === dateStr;
    });

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Memuat dashboard..." />
      </div>
    );
  }

  const thesisType = getThesisType();
  const minBeforeUTS = thesisType === 'TA2' ? 3 : 2;
  const minBeforeUAS = thesisType === 'TA2' ? 3 : 2;

  return (
    <div style={{ padding: 0 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
          Dashboard Mahasiswa
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Selamat datang, <Text strong>{user?.profile?.nama || 'Mahasiswa'}</Text>
        </Text>
      </div>

      {/* Offered Sessions Alert - Modern Design */}
      {offeredSessions.length > 0 && (
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
            <Space align="start" size="middle" style={{ width: '100%' }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                  Ada {offeredSessions.length} tawaran bimbingan dari dosen
                </Text>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {offeredSessions.map((session) => {
                    const primarySupervisor = session.supervisors?.find(
                      (s) => s.supervisor_order === 1
                    ) || session.supervisors?.[0] || { nama: 'Dosen Pembimbing' };
                    const timeStr = session.start_time || '';
                    const formattedTime = timeStr.substring(0, 5);
                    return (
                      <div
                        key={session.id}
                        style={{
                          background: 'rgba(24, 144, 255, 0.05)',
                          borderRadius: '12px',
                          padding: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <Text strong style={{ display: 'block' }}>
                            {primarySupervisor.nama}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {dayjs(session.scheduled_date).format('DD MMMM YYYY')} - {formattedTime}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                            Lokasi: {session.location || 'TBD'}
                          </Text>
                        </div>
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            loading={processingSession === session.id}
                            onClick={() => handleAcceptOffer(session.id)}
                            style={{
                              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                              border: 'none',
                              borderRadius: '8px',
                            }}
                          >
                            Terima
                          </Button>
                          <Button
                            danger
                            size="small"
                            loading={processingSession === session.id}
                            onClick={() => handleDeclineOffer(session.id)}
                            style={{ borderRadius: '8px' }}
                          >
                            Tolak
                          </Button>
                        </Space>
                      </div>
                    );
                  })}
                </Space>
              </div>
            </Space>
          </div>
        </div>
      )}

      {/* Alert Section - Modern Design */}
      {!hasThesisProject && (
        <div style={{ marginBottom: 24 }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderLeft: '4px solid #f59e0b',
                padding: '20px 24px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
              }}
            >
              <Space>
                <WarningOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                    Data Tugas Akhir Tidak Ditemukan
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Silakan hubungi administrator untuk mengatur data tugas akhir Anda.
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        )}

        {hasThesisProject && (
          <div style={{ marginBottom: 24 }}>
            {!meetsRequirements() ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderLeft: '4px solid #f59e0b',
                  padding: '20px 24px',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
                }}
              >
                <Space align="start" size="middle">
                  <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f59e0b', marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                      Peringatan: Belum Memenuhi Syarat Sidang
                    </Text>
                    <Paragraph style={{ marginBottom: 8, color: '#64748b' }}>
                      Anda belum memenuhi jumlah minimum bimbingan untuk sidang {thesisType}.
                    </Paragraph>
                    <Space direction="vertical" size="small">
                      <Text style={{ fontSize: 14 }}>
                        Sebelum UTS: <Text strong>{stats.beforeUTS}</Text> / {minBeforeUTS}
                      </Text>
                      <Text style={{ fontSize: 14 }}>
                        Sebelum UAS: <Text strong>{stats.beforeUAS}</Text> / {minBeforeUAS}
                      </Text>
                    </Space>
                  </div>
                </Space>
              </div>
            ) : (
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
                      Selamat! Anda Sudah Memenuhi Syarat Sidang
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Anda telah menyelesaikan jumlah minimum bimbingan untuk sidang {thesisType}.
                    </Text>
                  </div>
                </Space>
              </div>
            )}
          </div>
        )}

      {/* Modern Bento Grid Stats Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Bimbingan"
              value={stats.totalGuidance}
              icon={FileTextOutlined}
              color="indigo"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Menunggu Persetujuan"
              value={stats.pendingSessions}
              icon={ClockCircleOutlined}
              color="amber"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Bimbingan Sebelum UTS"
              value={stats.beforeUTS}
              suffix={`/ ${minBeforeUTS}`}
              icon={CheckCircleOutlined}
              color={stats.beforeUTS >= minBeforeUTS ? 'green' : 'rose'}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Bimbingan Sebelum UAS"
              value={stats.beforeUAS}
              suffix={`/ ${minBeforeUAS}`}
              icon={CheckCircleOutlined}
              color={stats.beforeUAS >= minBeforeUAS ? 'green' : 'rose'}
            />
          </Col>
        </Row>

      {/* Content Section */}
      <Row gutter={[20, 20]}>
        {/* Upcoming Sessions */}
        <Col xs={24} lg={12}>
          <Card
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.08)',
                height: '100%',
              }}
              title={
                <Text strong style={{ fontSize: 18 }}>
                  Jadwal Bimbingan Mendatang
                </Text>
              }
              extra={
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={() => navigate('/mahasiswa/request-guidance')}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: 36,
                  }}
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
                      color={session.status === 'approved' ? '#10b981' : '#f59e0b'}
                    >
                        <Space direction="vertical" size="small">
                          <Text strong style={{ fontSize: 15 }}>
                            {dayjs(session.date).format('dddd, DD MMMM YYYY')} - {session.time}
                          </Text>
                          <Text style={{ color: '#64748b' }}>
                            <UserOutlined /> {session.dosen}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            <CalendarOutlined /> {session.location || 'TBD'}
                          </Text>
                          <Tag
                            color={getStatusColor(session.status)}
                            style={{ borderRadius: '8px', marginTop: 4 }}
                          >
                            {getStatusText(session.status)}
                          </Tag>
                        </Space>
                      </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty
                  description="Belum ada jadwal bimbingan"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={12}>
          <Card
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.08)',
                height: '100%',
              }}
              title={
                <Text strong style={{ fontSize: 18 }}>
                  Kalender Bimbingan
                </Text>
              }
            >
              <Calendar
                fullscreen={false}
                cellRender={renderCalendarCell}
                style={{ borderRadius: '16px' }}
              />
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MahasiswaDashboard;
