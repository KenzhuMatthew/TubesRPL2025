// pages/dosen/DosenAvailability.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Switch,
  Alert,
  Empty,
  Divider,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { dosenAPI } from '../../api/dosen.api';
import { getDayName, formatDate } from '../../utils/dateUtils';

const { Title, Text } = Typography;
const { confirm } = Modal;

const DosenAvailability = () => {
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      const response = await dosenAPI.getAvailabilities();
      setAvailabilities(response.data.availabilities || []);
    } catch (error) {
      console.error('Error loading availabilities:', error);
      message.error('Gagal memuat ketersediaan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await dosenAPI.toggleAvailability(id);
      setAvailabilities(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isActive: !currentStatus, is_active: !currentStatus } : item
        )
      );
      message.success(`Slot berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      message.error('Gagal mengubah status slot');
    }
  };

  const handleDelete = (item) => {
    confirm({
      title: 'Hapus Slot',
      icon: <ExclamationCircleOutlined />,
      content: 'Apakah Anda yakin ingin menghapus slot ini?',
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      centered: true,
      onOk: async () => {
        try {
          await dosenAPI.deleteAvailability(item.id);
          setAvailabilities(prev => prev.filter(a => a.id !== item.id));
          message.success('Slot berhasil dihapus');
        } catch (error) {
          console.error('Error deleting availability:', error);
          message.error('Gagal menghapus slot');
        }
      },
    });
  };

  // Separate recurring and specific date availabilities
  const recurringSlots = availabilities.filter(a => a.isRecurring || a.is_recurring);
  const specificSlots = availabilities.filter(a => !a.isRecurring && !a.is_recurring);

  // Group recurring by day
  const groupedRecurring = recurringSlots.reduce((acc, slot) => {
    const day = slot.dayOfWeek || slot.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  if (loading) {
    return <Loading tip="Memuat ketersediaan..." />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
              Ketersediaan Bimbingan
            </Title>
            <Text type="secondary">
              Atur slot waktu ketersediaan Anda untuk bimbingan mahasiswa
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/dosen/availability/create')}
          >
            Tambah Slot
          </Button>
        </div>
        <Divider />
      </div>

      {/* Info Alert */}
      <Alert
        message="Tentang Ketersediaan"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>Slot rutin: Berulang setiap minggu pada hari yang sama</li>
            <li>Slot spesifik: Untuk tanggal tertentu saja</li>
            <li>Mahasiswa hanya bisa memilih slot yang aktif</li>
          </ul>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {availabilities.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong>Belum ada slot ketersediaan</Text>
                <Text type="secondary">
                  Tambahkan slot waktu agar mahasiswa dapat mengajukan jadwal bimbingan
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dosen/availability/create')}
            >
              Tambah Slot
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Recurring Slots */}
          {Object.keys(groupedRecurring).length > 0 && (
            <div>
              <Title level={4} style={{ marginBottom: 16 }}>
                <Space>
                  <CalendarOutlined />
                  Slot Rutin (Mingguan)
                </Space>
              </Title>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  const daySlots = groupedRecurring[day];
                  if (!daySlots || daySlots.length === 0) return null;

                  return (
                    <Card
                      key={day}
                      title={getDayName(day)}
                      size="small"
                      headStyle={{ background: '#fafafa' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {daySlots.map((slot, index) => {
                          const startTime = slot.startTime || slot.start_time;
                          const endTime = slot.endTime || slot.end_time;
                          const isActive = slot.isActive ?? slot.is_active ?? true;
                          const location = slot.location;

                          return (
                            <div key={slot.id}>
                              {index > 0 && <Divider style={{ margin: '8px 0' }} />}
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center' 
                              }}>
                                <Space>
                                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                  <div>
                                    <Text strong>{startTime} - {endTime}</Text>
                                    {location && (
                                      <>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                                          {location}
                                        </Text>
                                      </>
                                    )}
                                  </div>
                                </Space>

                                <Space>
                                  <Switch
                                    checked={isActive}
                                    onChange={() => handleToggle(slot.id, isActive)}
                                    checkedChildren="Aktif"
                                    unCheckedChildren="Off"
                                  />
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/dosen/availability/${slot.id}/edit`)}
                                  />
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(slot)}
                                  />
                                </Space>
                              </div>
                            </div>
                          );
                        })}
                      </Space>
                    </Card>
                  );
                })}
              </Space>
            </div>
          )}

          {/* Specific Date Slots */}
          {specificSlots.length > 0 && (
            <div>
              <Title level={4} style={{ marginBottom: 16 }}>
                <Space>
                  <CalendarOutlined />
                  Slot Tanggal Spesifik
                </Space>
              </Title>

              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {specificSlots.map((slot, index) => {
                    const startTime = slot.startTime || slot.start_time;
                    const endTime = slot.endTime || slot.end_time;
                    const isActive = slot.isActive ?? slot.is_active ?? true;
                    const specificDate = slot.specificDate || slot.specific_date;
                    const location = slot.location;

                    return (
                      <div key={slot.id}>
                        {index > 0 && <Divider style={{ margin: '8px 0' }} />}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center' 
                        }}>
                          <Space>
                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                            <div>
                              <Text strong>{formatDate(specificDate)}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {startTime} - {endTime}
                              </Text>
                              {location && (
                                <>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: 13 }}>
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                                    {location}
                                  </Text>
                                </>
                              )}
                            </div>
                          </Space>

                          <Space>
                            <Switch
                              checked={isActive}
                              onChange={() => handleToggle(slot.id, isActive)}
                              checkedChildren="Aktif"
                              unCheckedChildren="Off"
                            />
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => navigate(`/dosen/availability/${slot.id}/edit`)}
                            />
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(slot)}
                            />
                          </Space>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              </Card>
            </div>
          )}
        </Space>
      )}
    </div>
  );
};

export default DosenAvailability;