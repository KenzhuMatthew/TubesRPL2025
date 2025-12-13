// pages/mahasiswa/GuidanceHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Tabs, 
  Tag, 
  Space, 
  Empty, 
  Spin,
  Badge,
  Typography,
  List,
  message
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useGuidance } from '../../hooks/useGuidance';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text } = Typography;

dayjs.locale('id');

const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu Persetujuan',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'error',
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

const GuidanceHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessions, loading, fetchSessions } = useGuidance();

  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Show success message if redirected from request page
  useEffect(() => {
    if (location.state?.message) {
      message.success(location.state.message);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const filteredSessions = activeTab === 'ALL' 
    ? sessions 
    : sessions.filter(s => s.status === activeTab);

  const handleViewDetail = (sessionId) => {
    navigate(`/mahasiswa/sessions/${sessionId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return dayjs(dateString).format('dddd, DD MMMM YYYY');
    } catch (error) {
      return '-';
    }
  };

  const tabItems = [
    {
      key: 'ALL',
      label: `Semua${sessions.length > 0 ? ` (${sessions.length})` : ''}`,
    },
    {
      key: 'PENDING',
      label: `Pending${sessions.filter(s => s.status === 'PENDING').length > 0 ? ` (${sessions.filter(s => s.status === 'PENDING').length})` : ''}`,
    },
    {
      key: 'APPROVED',
      label: `Disetujui${sessions.filter(s => s.status === 'APPROVED').length > 0 ? ` (${sessions.filter(s => s.status === 'APPROVED').length})` : ''}`,
    },
    {
      key: 'COMPLETED',
      label: `Selesai${sessions.filter(s => s.status === 'COMPLETED').length > 0 ? ` (${sessions.filter(s => s.status === 'COMPLETED').length})` : ''}`,
    },
    {
      key: 'REJECTED',
      label: `Ditolak${sessions.filter(s => s.status === 'REJECTED').length > 0 ? ` (${sessions.filter(s => s.status === 'REJECTED').length})` : ''}`,
    },
  ];

  if (loading && sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Memuat data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Riwayat Bimbingan
          </Title>
          <Text type="secondary">
            Lihat semua riwayat pengajuan dan sesi bimbingan Anda
          </Text>
        </div>

        {/* Filter Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '24px' }}
        />

        {/* Sessions List */}
        <Spin spinning={loading && sessions.length > 0}>
          {filteredSessions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                activeTab === 'ALL' 
                  ? 'Belum ada riwayat bimbingan. Ajukan bimbingan pertama Anda sekarang!' 
                  : `Tidak ada sesi dengan status ${STATUS_CONFIG[activeTab]?.label}`
              }
            />
          ) : (
            <List
              dataSource={filteredSessions}
              renderItem={(session) => {
                // Handle both camelCase and snake_case from API
                const supervisors = session.thesisProject?.supervisors || session.supervisors || [];
                const statusConfig = STATUS_CONFIG[session.status];
                
                return (
                  <List.Item
                    style={{ 
                      cursor: 'pointer',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s',
                    }}
                    onClick={() => handleViewDetail(session.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#1890ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#f0f0f0';
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      {/* Status and Type Badges */}
                      <Space style={{ marginBottom: '12px' }}>
                        <Tag 
                          icon={statusConfig?.icon} 
                          color={statusConfig?.color}
                        >
                          {statusConfig?.label}
                        </Tag>
                        
                        {session.sessionType === 'GROUP' && (
                          <Tag icon={<TeamOutlined />} color="purple">
                            Kelompok
                          </Tag>
                        )}
                      </Space>

                      {/* Supervisors */}
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ fontSize: '16px' }}>
                          Bimbingan dengan {
                            supervisors.length > 0
                              ? supervisors.map(s => s.dosen?.nama || s.nama || 'Dosen Pembimbing').filter(Boolean).join(', ')
                              : 'Dosen Pembimbing'
                          }
                        </Text>
                      </div>

                      {/* Session Details */}
                      <Space split="|" wrap style={{ marginBottom: '12px' }}>
                        <Space>
                          <CalendarOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">
                            {formatDate(session.scheduled_date || session.scheduledDate)}
                          </Text>
                        </Space>
                        
                        <Space>
                          <ClockCircleOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">
                            {session.start_time 
                              ? `${session.start_time.substring(0, 5)}${session.end_time ? ` - ${session.end_time.substring(0, 5)}` : ''}`
                              : session.startTime
                              ? `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}`
                              : '-'}
                          </Text>
                        </Space>
                        
                        <Space>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">{session.location || 'TBD'}</Text>
                        </Space>
                      </Space>

                      {/* Notes Preview */}
                      {session.notes && session.notes.length > 0 && (
                        <div style={{ 
                          marginTop: '12px', 
                          paddingTop: '12px', 
                          borderTop: '1px solid #f0f0f0' 
                        }}>
                          <Space>
                            <Badge count={session.notes.length} showZero>
                              <FileTextOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                            </Badge>
                            <Text type="secondary">
                              {session.notes.length} catatan dari dosen
                            </Text>
                          </Space>
                        </div>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <RightOutlined style={{ color: '#bfbfbf', fontSize: '16px' }} />
                  </List.Item>
                );
              }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default GuidanceHistory;