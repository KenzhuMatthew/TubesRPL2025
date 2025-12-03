// pages/dosen/SessionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Descriptions,
  Modal,
  message,
  Divider,
  Result,
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
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { 
  getSessionDetail, 
  approveSession, 
  rejectSession 
} from '../../api/dosen.api';
import { formatDate } from '../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu Persetujuan',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
    description: 'Pengajuan menunggu persetujuan Anda',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'success',
    icon: <CheckCircleOutlined />,
    description: 'Sesi telah disetujui, laksanakan sesuai jadwal',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'error',
    icon: <CloseCircleOutlined />,
    description: 'Pengajuan telah ditolak',
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
    description: 'Sesi dibatalkan oleh mahasiswa',
  },
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const response = await getSessionDetail(id);
      setSession(response.data.session);
    } catch (error) {
      console.error('Error loading session:', error);
      message.error('Gagal memuat detail sesi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    confirm({
      title: 'Setujui Pengajuan',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: 'Apakah Anda yakin ingin menyetujui pengajuan bimbingan ini?',
      okText: 'Ya, Setujui',
      okType: 'primary',
      cancelText: 'Batal',
      centered: true,
      onOk: async () => {
        setIsProcessing(true);
        try {
          await approveSession(id);
          setSession(prev => ({ ...prev, status: 'APPROVED' }));
          message.success('Pengajuan berhasil disetujui');
        } catch (error) {
          console.error('Error approving session:', error);
          message.error('Gagal menyetujui pengajuan');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleReject = () => {
    confirm({
      title: 'Tolak Pengajuan',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Apakah Anda yakin ingin menolak pengajuan bimbingan ini? Mahasiswa harus mengajukan ulang dengan jadwal yang berbeda.',
      okText: 'Ya, Tolak',
      okType: 'danger',
      cancelText: 'Batal',
      centered: true,
      onOk: async () => {
        setIsProcessing(true);
        try {
          await rejectSession(id);
          setSession(prev => ({ ...prev, status: 'REJECTED' }));
          message.success('Pengajuan berhasil ditolak');
        } catch (error) {
          console.error('Error rejecting session:', error);
          message.error('Gagal menolak pengajuan');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  if (loading) {
    return <Loading tip="Memuat detail sesi..." />;
  }

  if (!session) {
    return (
      <Result
        status="404"
        title="Sesi tidak ditemukan"
        subTitle="Sesi bimbingan yang Anda cari tidak ditemukan"
        extra={
          <Button type="primary" onClick={() => navigate('/dosen/sessions')}>
            Kembali ke Daftar Sesi
          </Button>
        }
      />
    );
  }

  const mahasiswa = session.thesisProject?.mahasiswa;
  const canApproveReject = session.status === 'PENDING';
  const canAddNotes = ['APPROVED', 'COMPLETED'].includes(session.status);
  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.PENDING;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dosen/sessions')}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Kembali
      </Button>

      {/* Status Alert */}
      <Alert
        message={statusConfig.label}
        description={statusConfig.description}
        type={statusConfig.color}
        showIcon
        icon={statusConfig.icon}
        style={{ marginBottom: 24 }}
        action={
          <Space>
            {canApproveReject && (
              <>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleReject}
                  loading={isProcessing}
                >
                  Tolak
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  loading={isProcessing}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Setujui
                </Button>
              </>
            )}

            {canAddNotes && (
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/dosen/sessions/${id}/notes`)}
              >
                {session.notes?.length > 0 ? 'Edit Catatan' : 'Tambah Catatan'}
              </Button>
            )}
          </Space>
        }
      />

      {/* Session Details */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Detail Sesi Bimbingan</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={1} labelStyle={{ fontWeight: 500 }}>
          {/* Student Info */}
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                <span>Mahasiswa</span>
              </Space>
            }
          >
            <Space direction="vertical" size={2}>
              <Text strong>{mahasiswa?.nama}</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {mahasiswa?.npm} • Angkatan {mahasiswa?.angkatan}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {mahasiswa?.email}
              </Text>
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
            {formatDate(session.scheduledDate)}
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
            {session.startTime}
            {session.endTime && ` - ${session.endTime}`}
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
            {session.location}
          </Descriptions.Item>
        </Descriptions>

        {/* Thesis Info */}
        <Divider orientation="left" style={{ fontSize: 14, fontWeight: 500 }}>
          Tugas Akhir
        </Divider>
        <Card
          size="small"
          style={{ background: '#fafafa' }}
          bordered={false}
        >
          <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
            {session.thesisProject?.judul}
          </Title>
          <Space>
            <Tag color="blue">{session.thesisProject?.tipe}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {session.thesisProject?.semester}
            </Text>
          </Space>
        </Card>
      </Card>

      {/* Notes */}
      {session.notes && session.notes.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>Catatan Bimbingan</span>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {session.notes.map((note) => (
              <Card
                key={note.id}
                size="small"
                style={{
                  borderLeft: '4px solid #1890ff',
                  background: '#e6f7ff',
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Note Header */}
                  <div>
                    <Text strong>{note.dosen?.nama}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')}
                    </Text>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  {/* Note Content */}
                  <div>
                    <Text strong style={{ fontSize: 13 }}>
                      Catatan Pertemuan:
                    </Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Paragraph>
                  </div>

                  {/* Tasks */}
                  {note.tasks && (
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        Tugas untuk Pertemuan Berikutnya:
                      </Text>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                        {note.tasks}
                      </Paragraph>
                    </div>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default SessionDetail;