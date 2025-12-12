// pages/dosen/AddNotes.jsx - Modern Premium Design
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Input,
  Form,
  message,
  Spin,
  Empty,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  SaveOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { getSessionDetail, addNotes } from '../../api/dosen.api';
import { formatDate } from '../../utils/dateUtils';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AddNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await getSessionDetail(id);
      setSession(response.data.session);
    } catch (error) {
      console.error('Error loading session:', error);
      message.error('Gagal memuat data sesi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await addNotes(id, {
        content: values.content,
        tasks: values.tasks || null,
      });
      message.success('Catatan berhasil disimpan');
      navigate(`/dosen/sessions/${id}`);
    } catch (error) {
      console.error('Error adding notes:', error);
      message.error(error.response?.data?.message || 'Gagal menyimpan catatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Memuat data sesi..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Empty
          description="Sesi tidak ditemukan"
        >
          <Button onClick={() => navigate('/dosen/sessions')}>
            Kembali ke Daftar Sesi
          </Button>
        </Empty>
      </div>
    );
  }

  // Handle both camelCase and snake_case from API
  const mahasiswa = session.thesisProject?.mahasiswa || session.mahasiswa;
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
        onClick={() => navigate(`/dosen/sessions/${id}`)}
        style={{ marginBottom: 24, borderRadius: '12px' }}
      >
        Kembali
      </Button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
          Tambah Catatan Bimbingan
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Catat hasil pertemuan dan tugas untuk pertemuan berikutnya
        </Text>
      </div>

      {/* Session Info Card */}
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
          <Text strong style={{ fontSize: 16 }}>
            Informasi Sesi
          </Text>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Student Info */}
          <Space>
            <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <div>
              <Text strong style={{ display: 'block' }}>
                {mahasiswa?.nama || 'Mahasiswa'}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {mahasiswa?.npm || '-'} {mahasiswa?.angkatan ? `• Angkatan ${mahasiswa.angkatan}` : ''}
              </Text>
            </div>
          </Space>

          {/* Date & Time */}
          <Space>
            <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <div>
              <Text style={{ display: 'block' }}>
                {formattedDate}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <ClockCircleOutlined /> {formattedTime}
              </Text>
            </div>
          </Space>

          {/* Location */}
          <Space>
            <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Text>{session.location || 'TBD'}</Text>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          {/* Thesis Info */}
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              Judul Tugas Akhir:
            </Text>
            <Text>{session.thesisProject?.judul || '-'}</Text>
          </div>
        </Space>
      </Card>

      {/* Notes Form */}
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
              Form Catatan Bimbingan
            </Text>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            content: '',
            tasks: '',
          }}
        >
          {/* Meeting Notes */}
          <Form.Item
            name="content"
            label={
              <Space>
                <FileTextOutlined />
                <span>Catatan Pertemuan</span>
                <Text type="danger">*</Text>
              </Space>
            }
            rules={[
              { required: true, message: 'Catatan pertemuan harus diisi' },
              { min: 10, message: 'Catatan minimal 10 karakter' },
            ]}
          >
            <TextArea
              rows={8}
              placeholder="Tulis catatan hasil pertemuan bimbingan...

Contoh:
- Mahasiswa telah menyelesaikan BAB I
- Pembahasan metodologi penelitian
- Revisi rumusan masalah"
              showCount
              maxLength={2000}
            />
          </Form.Item>

          {/* Tasks */}
          <Form.Item
            name="tasks"
            label="Tugas untuk Pertemuan Berikutnya (Opsional)"
          >
            <TextArea
              rows={6}
              placeholder="Tulis tugas yang harus dikerjakan mahasiswa...

Contoh:
- Menyelesaikan BAB II (Tinjauan Pustaka)
- Membuat flowchart sistem
- Mengumpulkan data penelitian"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          {/* Info Box */}
          <div
            style={{
              background: 'rgba(24, 144, 255, 0.05)',
              borderRadius: '12px',
              padding: 16,
              marginBottom: 24,
              border: '1px solid rgba(24, 144, 255, 0.1)',
            }}
          >
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
              💡 Tips Menulis Catatan:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#64748b' }}>
              <li>Catat poin-poin penting yang dibahas</li>
              <li>Berikan feedback yang konstruktif</li>
              <li>Tulis dengan jelas dan terstruktur</li>
              <li>Mahasiswa dapat melihat catatan ini untuk referensi</li>
            </ul>
          </div>

          {/* Actions */}
          <Form.Item>
            <Space>
              <Button
                onClick={() => navigate(`/dosen/sessions/${id}`)}
                disabled={isSubmitting}
                style={{ borderRadius: '12px' }}
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  borderRadius: '12px',
                }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Previous Notes */}
      {session.notes && session.notes.length > 0 && (
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(24, 144, 255, 0.08)',
            marginTop: 24,
          }}
          title={
            <Space>
              <FileTextOutlined />
              <Text strong style={{ fontSize: 18 }}>
                Catatan Sebelumnya
              </Text>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {session.notes.map((note, index) => (
              <div
                key={note.id || index}
                style={{
                  borderLeft: '4px solid #1890ff',
                  background: 'rgba(24, 144, 255, 0.05)',
                  borderRadius: '12px',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <Text strong>{note.dosen?.nama || note.dosen_nama || 'Dosen'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {note.created_at 
                        ? dayjs(note.created_at).format('DD MMMM YYYY, HH:mm')
                        : note.createdAt
                        ? formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')
                        : '-'}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Pertemuan #{session.notes.length - index}
                  </Text>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                      Catatan:
                    </Text>
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </Paragraph>
                  </div>

                  {note.tasks && (
                    <div>
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        Tugas:
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

export default AddNotes;
