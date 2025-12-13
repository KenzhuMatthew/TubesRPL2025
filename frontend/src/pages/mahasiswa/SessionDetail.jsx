// pages/mahasiswa/SessionDetail.jsx - Modern Premium Design
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Descriptions,
  Modal,
  message,
  Spin,
  Empty,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useGuidance } from '../../hooks/useGuidance';
import { formatDate } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu Persetujuan',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
    description: 'Menunggu persetujuan dari dosen',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    icon: <CheckCircleOutlined />,
    description: 'Sesi bimbingan telah disetujui',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'error',
    icon: <CloseCircleOutlined />,
    description: 'Pengajuan ditolak oleh dosen',
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'processing',
    icon: <CheckCircleOutlined />,
    description: 'Sesi bimbingan telah selesai',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'default',
    icon: <CloseCircleOutlined />,
    description: 'Sesi bimbingan dibatalkan',
  },
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSessionDetail, cancelSessionRequest } = useGuidance();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadSessionDetail();
  }, [id]);

  const loadSessionDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchSessionDetail(id);
      setSession(response.session);
    } catch (error) {
      console.error('Error loading session:', error);
      message.error('Gagal memuat detail sesi bimbingan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/mahasiswa/sessions/${id}/edit`);
  };

  const handleCancel = () => {
    confirm({
      title: 'Batalkan Sesi Bimbingan',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Apakah Anda yakin ingin membatalkan sesi bimbingan ini? Tindakan ini tidak dapat dibatalkan.',
      okText: 'Ya, Batalkan',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        setIsCancelling(true);
        try {
          await cancelSessionRequest(id);
          message.success('Sesi bimbingan berhasil dibatalkan');
          navigate('/mahasiswa/history', {
            state: { message: 'Sesi bimbingan berhasil dibatalkan' }
          });
        } catch (error) {
          console.error('Cancel error:', error);
          setIsCancelling(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Memuat detail sesi..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Empty
          description={
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                Sesi tidak ditemukan
              </Title>
              <Text type="secondary">Sesi bimbingan yang Anda cari tidak ditemukan</Text>
            </div>
          }
        >
          <Button
            type="primary"
            onClick={() => navigate('/mahasiswa/history')}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              borderRadius: '12px',
            }}
          >
            Kembali ke Riwayat
          </Button>
        </Empty>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.PENDING;
  const supervisors = session.thesisProject?.supervisors || [];
  const canEdit = session.status === 'PENDING';
  const canCancel = ['PENDING', 'APPROVED'].includes(session.status);

  // Format date and time
  const scheduledDate = session.scheduled_date || session.scheduledDate;
  const startTime = session.start_time || session.startTime;
  const endTime = session.end_time || session.endTime;
  const formattedDate = scheduledDate ? dayjs(scheduledDate).format('dddd, DD MMMM YYYY') : '-';
  const formattedTime = startTime 
    ? `${startTime.substring(0, 5)}${endTime ? ` - ${endTime.substring(0, 5)}` : ''}`
    : '-';

  return (
    <div style={{ padding: 0 }}>
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24, borderRadius: '12px' }}
      >
        Kembali
      </Button>

      {/* Status Header */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: statusConfig.color === 'success' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : statusConfig.color === 'warning'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : statusConfig.color === 'error'
                  ? 'rgba(244, 63, 94, 0.1)'
                  : 'rgba(24, 144, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(statusConfig.icon, {
                style: {
                  fontSize: 28,
                  color: statusConfig.color === 'success' 
                    ? '#10b981' 
                    : statusConfig.color === 'warning'
                    ? '#f59e0b'
                    : statusConfig.color === 'error'
                    ? '#f43f5e'
                    : '#1890ff',
                },
              })}
            </div>
            <div>
              <Title level={3} style={{ marginBottom: 4, fontSize: 24 }}>
                {statusConfig.label}
              </Title>
              <Text type="secondary">{statusConfig.description}</Text>
            </div>
          </Space>

          {/* Action Buttons */}
          {(canEdit || canCancel) && (
            <Space>
              {canEdit && (
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  style={{ borderRadius: '12px' }}
                >
                  Edit
                </Button>
              )}
              {canCancel && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleCancel}
                  loading={isCancelling}
                  style={{ borderRadius: '12px' }}
                >
                  Batalkan
                </Button>
              )}
            </Space>
          )}
        </div>
      </Card>

      {/* Session Details */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
          marginBottom: 24,
        }}
        title={
          <Space>
            <FileTextOutlined />
            <Text strong style={{ fontSize: 18 }}>
              Detail Sesi Bimbingan
            </Text>
          </Space>
        }
      >
        <Descriptions column={1} labelStyle={{ fontWeight: 500, width: 200 }}>
          {/* Supervisors */}
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                <span>Dosen Pembimbing</span>
              </Space>
            }
          >
            <Space direction="vertical" size={4}>
              {supervisors.length > 0 ? (
                supervisors.map((supervisor, idx) => (
                  <div key={idx}>
                    <Text strong>{supervisor.dosen?.nama || supervisor.nama}</Text>
                    {supervisor.dosen?.nip && (
                      <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                        ({supervisor.dosen.nip})
                      </Text>
                    )}
                    {supervisor.supervisor_order && (
                      <Tag color="blue" style={{ marginLeft: 8, borderRadius: '8px' }}>
                        Pembimbing {supervisor.supervisor_order}
                      </Tag>
                    )}
                  </div>
                ))
              ) : (
                <Text type="secondary">Tidak ada data dosen pembimbing</Text>
              )}
            </Space>
          </Descriptions.Item>

          {/* Date */}
          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>Tanggal</span>
              </Space>
            }
          >
            {formattedDate}
          </Descriptions.Item>

          {/* Time */}
          <Descriptions.Item
            label={
              <Space>
                <ClockCircleOutlined />
                <span>Waktu</span>
              </Space>
            }
          >
            {formattedTime}
          </Descriptions.Item>

          {/* Location */}
          <Descriptions.Item
            label={
              <Space>
                <EnvironmentOutlined />
                <span>Lokasi</span>
              </Space>
            }
          >
            {session.location || 'TBD'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Thesis Info */}
        {session.thesisProject && (
          <div>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
              Tugas Akhir
            </Text>
            <div
              style={{
                background: 'rgba(24, 144, 255, 0.05)',
                borderRadius: '12px',
                padding: 16,
              }}
            >
              <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
                {session.thesisProject.judul || 'Tidak ada judul'}
              </Text>
              <Tag color="blue" style={{ borderRadius: '8px' }}>
                {session.thesisProject.tipe || 'TA1'}
              </Tag>
            </div>
          </div>
        )}
      </Card>

      {/* Notes from Dosen */}
      {session.notes && session.notes.length > 0 && (
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
                Catatan Bimbingan
              </Text>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {session.notes.map((note, idx) => (
              <div
                key={note.id || idx}
                style={{
                  borderLeft: '4px solid #1890ff',
                  background: 'rgba(24, 144, 255, 0.05)',
                  borderRadius: '12px',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <Text strong>{note.dosen?.nama || 'Dosen'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {note.created_at 
                        ? dayjs(note.created_at).format('DD MMMM YYYY, HH:mm')
                        : note.createdAt
                        ? formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')
                        : '-'}
                    </Text>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {note.content && (
                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        Catatan Pertemuan:
                      </Text>
                      <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </Paragraph>
                    </div>
                  )}

                  {note.tasks && (
                    <div>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        Tugas untuk Pertemuan Berikutnya:
                      </Text>
                      <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {note.tasks}
                      </Paragraph>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default SessionDetail;
