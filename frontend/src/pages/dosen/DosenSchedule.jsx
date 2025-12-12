// pages/dosen/DosenSchedule.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Empty,
  Space,
  Typography,
  Tag,
  Divider,
  Modal,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { dosenAPI } from '../../api/dosen.api';
import { getDayName } from '../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday (0 = Sunday)

const DosenSchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await dosenAPI.getSchedule();
      console.log('Schedules response:', response);
      
      // Handle both possible response structures
      const schedulesData = response.schedules || response.data?.schedules || response.data || [];
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (schedule) => {
    confirm({
      title: 'Hapus Jadwal',
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin menghapus jadwal "${schedule.course_name || schedule.courseName}"?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      centered: true,
      onOk: async () => {
        try {
          await dosenAPI.deleteSchedule(schedule.id);
          setSchedules(prev => prev.filter(s => s.id !== schedule.id));
          message.success('Jadwal berhasil dihapus');
        } catch (error) {
          console.error('Error deleting schedule:', error);
          message.error(error.response?.data?.message || 'Gagal menghapus jadwal');
        }
      },
    });
  };

  // Normalize schedule data (handle both snake_case and camelCase)
  const normalizeSchedule = (schedule) => ({
    id: schedule.id,
    dayOfWeek: schedule.day_of_week ?? schedule.dayOfWeek,
    startTime: schedule.start_time || schedule.startTime,
    endTime: schedule.end_time || schedule.endTime,
    courseName: schedule.course_name || schedule.courseName,
    room: schedule.room,
    semester: schedule.semester,
  });

  // Normalize and group schedules by day
  const normalizedSchedules = schedules.map(normalizeSchedule);
  
  const groupedSchedules = normalizedSchedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (day === null || day === undefined) return acc;
    
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  // Sort schedules within each day
  Object.keys(groupedSchedules).forEach(day => {
    groupedSchedules[day].sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              Jadwal Mengajar
            </Title>
            <Text type="secondary">
              Kelola jadwal mengajar Anda untuk semester ini
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/dosen/schedule/add')}
          >
            Tambah Jadwal
          </Button>
        </div>
        <Divider />
      </div>

      {/* Content */}
      {schedules.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong>Belum ada jadwal mengajar</Text>
                <Text type="secondary">
                  Tambahkan jadwal mengajar Anda agar mahasiswa dapat melihat ketersediaan untuk bimbingan
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dosen/schedule/add')}
            >
              Tambah Jadwal
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {DAYS_ORDER.map(day => {
            const daySchedules = groupedSchedules[day];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <Card
                key={day}
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{getDayName(day)}</Text>
                    <Tag color="blue">{daySchedules.length} jadwal</Tag>
                  </Space>
                }
                styles={{
                  header: {
                    background: 'linear-gradient(to right, #e6f7ff, #bae7ff)',
                    borderBottom: '1px solid #91d5ff',
                  }
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {daySchedules.map((schedule, index) => (
                    <div key={schedule.id}>
                      {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                      
                      <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {/* Course Name */}
                            <Text strong style={{ fontSize: 16 }}>
                              {schedule.courseName || 'Mata Kuliah'}
                            </Text>

                            {/* Time and Location */}
                            <Space wrap size="middle">
                              <Space size={4}>
                                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                <Text type="secondary">
                                  {schedule.startTime || '00:00'} - {schedule.endTime || '00:00'}
                                </Text>
                              </Space>

                              {schedule.room && (
                                <Space size={4}>
                                  <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                                  <Text type="secondary">{schedule.room}</Text>
                                </Space>
                              )}
                            </Space>

                            {/* Semester Tag */}
                            {schedule.semester && (
                              <div>
                                <Tag color="blue">{schedule.semester}</Tag>
                              </div>
                            )}
                          </Space>
                        </Col>

                        {/* Action Buttons */}
                        <Col>
                          <Space>
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => navigate(`/dosen/schedule/${schedule.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(schedule)}
                            >
                              Hapus
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </Space>
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
};

export default DosenSchedule;