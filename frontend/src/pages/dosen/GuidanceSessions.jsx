// pages/dosen/GuidanceSessions.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Tabs,
  Badge,
  Space,
  Typography,
  Tag,
  Alert,
  Empty,
  Divider,
  Row,
  Col,
  Button,
  message,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import OfferSessionModal from '../../components/guidance/OfferSessionModal';
import { guidanceApi } from '../../api/guidance.api';
import { formatDate } from '../../utils/dateUtils';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  OFFERED: {
    label: 'Ditawarkan',
    color: 'processing',
    icon: <SendOutlined />,
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  DECLINED: {
    label: 'Ditolak Mahasiswa',
    color: 'default',
    icon: <CloseCircleOutlined />,
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'processing',
    icon: <CheckCircleOutlined />,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'default',
    icon: <CloseCircleOutlined />,
  },
};

const GuidanceSessions = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || 'ALL');
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load sessions
      const params = activeFilter !== 'ALL' ? { status: activeFilter } : {};
      const sessionsResponse = await guidanceApi.getDosenSessions(params);
      setSessions(sessionsResponse.sessions || []);

      // Load students for offer modal
      const studentsResponse = await guidanceApi.getStudents();
      setStudents(studentsResponse.students || []);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    if (status === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  const handleOfferSuccess = () => {
    message.success('Tawaran bimbingan berhasil dikirim');
    loadData();
  };

  const filteredSessions = activeFilter === 'ALL'
    ? sessions
    : sessions.filter(s => s.status === activeFilter);

  const pendingCount = sessions.filter(s => s.status === 'PENDING').length;
  const offeredCount = sessions.filter(s => s.status === 'OFFERED').length;

  if (loading) {
    return <Loading tip="Memuat sesi bimbingan..." />;
  }

  const tabItems = [
    {
      key: 'ALL',
      label: 'Semua',
      children: null,
    },
    {
      key: 'PENDING',
      label: (
        <Badge count={pendingCount} offset={[10, 0]}>
          <span>Pending</span>
        </Badge>
      ),
      children: null,
    },
    {
      key: 'OFFERED',
      label: (
        <Badge count={offeredCount} offset={[10, 0]}>
          <span>Ditawarkan</span>
        </Badge>
      ),
      children: null,
    },
    {
      key: 'APPROVED',
      label: 'Disetujui',
      children: null,
    },
    {
      key: 'COMPLETED',
      label: 'Selesai',
      children: null,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
              Sesi Bimbingan
            </Title>
            <Text type="secondary">
              Kelola pengajuan dan sesi bimbingan mahasiswa
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setShowOfferModal(true)}
          >
            Ajukan Bimbingan
          </Button>
        </div>
        <Divider />
      </div>

      {/* Alerts */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        {pendingCount > 0 && (
          <Alert
            message={`Ada ${pendingCount} pengajuan menunggu persetujuan`}
            description={
              <a onClick={() => handleFilterChange('PENDING')} style={{ cursor: 'pointer' }}>
                Lihat pengajuan →
              </a>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        )}

        {offeredCount > 0 && (
          <Alert
            message={`Ada ${offeredCount} tawaran bimbingan menunggu respons mahasiswa`}
            description={
              <a onClick={() => handleFilterChange('OFFERED')} style={{ cursor: 'pointer' }}>
                Lihat tawaran →
              </a>
            }
            type="info"
            showIcon
            icon={<SendOutlined />}
          />
        )}
      </Space>

      {/* Filter Tabs */}
      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={activeFilter}
          onChange={handleFilterChange}
          items={tabItems}
        />
      </Card>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong>
                  Tidak ada sesi {activeFilter === 'ALL' ? '' : STATUS_CONFIG[activeFilter]?.label.toLowerCase()}
                </Text>
                <Text type="secondary">
                  Sesi bimbingan akan muncul di sini
                </Text>
              </Space>
            }
          />
        </Card>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {filteredSessions.map(session => {
            const mahasiswa = session.mahasiswa_nama ? {
              nama: session.mahasiswa_nama,
              npm: session.npm,
            } : session.thesisProject?.mahasiswa;

            return (
              <Card
                key={session.id}
                hoverable
                onClick={() => navigate(`/dosen/sessions/${session.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {/* Status Badge */}
                      <Space>
                        <Tag
                          color={STATUS_CONFIG[session.status]?.color}
                          icon={STATUS_CONFIG[session.status]?.icon}
                        >
                          {STATUS_CONFIG[session.status]?.label}
                        </Tag>

                        {session.status === 'PENDING' && (
                          <Text type="warning" style={{ fontSize: 12 }}>
                            ⏰ Perlu persetujuan
                          </Text>
                        )}

                        {session.status === 'OFFERED' && (
                          <Text style={{ fontSize: 12, color: '#1890ff' }}>
                            📤 Menunggu respons mahasiswa
                          </Text>
                        )}

                        {session.offered_by_dosen && (
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            Anda yang mengajukan
                          </Tag>
                        )}
                      </Space>

                      {/* Student Info */}
                      <div>
                        <Space size={4}>
                          <UserOutlined style={{ color: '#8c8c8c' }} />
                          <Text strong>{mahasiswa?.nama}</Text>
                          <Text type="secondary">({mahasiswa?.npm})</Text>
                        </Space>
                      </div>

                      {/* Thesis Title */}
                      {(session.judul || session.thesisProject?.judul) && (
                        <Text
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ fontSize: 14 }}
                        >
                          {session.judul || session.thesisProject?.judul}
                        </Text>
                      )}

                      {/* Details */}
                      <Space wrap size="middle" style={{ marginTop: 8 }}>
                        <Space size={4}>
                          <CalendarOutlined style={{ color: '#8c8c8c' }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {formatDate(session.scheduled_date || session.scheduledDate)}
                          </Text>
                        </Space>

                        <Space size={4}>
                          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {session.start_time || session.startTime}
                            {(session.end_time || session.endTime) && 
                              ` - ${session.end_time || session.endTime}`}
                          </Text>
                        </Space>

                        <Space size={4}>
                          <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {session.location}
                          </Text>
                        </Space>
                      </Space>

                      {/* Notes indicator */}
                      {session.notes_count > 0 && (
                        <>
                          <Divider style={{ margin: '12px 0' }} />
                          <Space size={4}>
                            <FileTextOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {session.notes_count} catatan bimbingan
                            </Text>
                          </Space>
                        </>
                      )}
                    </Space>
                  </Col>

                  {/* Arrow Icon */}
                  <Col>
                    <RightOutlined style={{ color: '#d9d9d9' }} />
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}

      {/* Offer Session Modal - FIXED: Change isOpen to visible, onClose to onCancel */}
      <OfferSessionModal
        visible={showOfferModal}
        onCancel={() => setShowOfferModal(false)}
        onSuccess={handleOfferSuccess}
        students={students}
      />
    </div>
  );
};

export default GuidanceSessions;