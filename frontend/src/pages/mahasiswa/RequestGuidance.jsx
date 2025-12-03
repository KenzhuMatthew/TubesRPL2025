// pages/mahasiswa/RequestGuidance.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Alert,
  Divider,
  Typography,
  List,
  Tag,
  Empty,
  Spin,
  Input,
  Row,
  Col,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { guidanceApi } from '../../api/guidance.api';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/id';

dayjs.extend(isoWeek);
dayjs.locale('id');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RequestGuidance = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);

  // Fetch supervisors on mount
  useEffect(() => {
    fetchSupervisors();
  }, []);

  // Fetch available slots when date and dosen selected
  useEffect(() => {
    if (selectedDate && selectedDosen) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedDosen]);

  const fetchSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      // Replace with actual API call
      // const response = await guidanceApi.getSupervisors();
      // setSupervisors(response.supervisors);
      
      // Mock data for now
      setTimeout(() => {
        setSupervisors([
          {
            id: '1',
            userId: 'user1',
            nip: '197001011990011001',
            nama: 'Dr. Ir. Budi Santoso, M.Kom',
            email: 'budi.santoso@unpar.ac.id',
            phone: '081234567890',
            supervisorOrder: 1,
          },
          {
            id: '2',
            userId: 'user2',
            nip: '197502021995022001',
            nama: 'Dr. Siti Rahma, S.Kom, M.T',
            email: 'siti.rahma@unpar.ac.id',
            phone: '081234567891',
            supervisorOrder: 2,
          },
        ]);
        setLoadingSupervisors(false);
      }, 500);
    } catch (error) {
      console.error('Fetch supervisors error:', error);
      message.error('Gagal memuat data dosen pembimbing');
      setLoadingSupervisors(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      form.setFieldsValue({ timeSlot: undefined });

      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      // Replace with actual API call
      // const response = await guidanceApi.getAvailableSlots(selectedDosen, dateStr);
      // setAvailableSlots(response.availableSlots);

      // Mock data for now
      setTimeout(() => {
        const mockSlots = [
          {
            id: '1',
            startTime: '09:00',
            endTime: '10:00',
            location: 'Ruang 9310',
            isAvailable: true,
          },
          {
            id: '2',
            startTime: '10:00',
            endTime: '11:00',
            location: 'Ruang 9310',
            isAvailable: true,
          },
          {
            id: '3',
            startTime: '11:00',
            endTime: '12:00',
            location: 'Ruang 9311',
            isAvailable: false,
          },
          {
            id: '4',
            startTime: '13:00',
            endTime: '14:00',
            location: 'Online (Zoom)',
            isAvailable: true,
          },
          {
            id: '5',
            startTime: '14:00',
            endTime: '15:00',
            location: 'Online (Zoom)',
            isAvailable: true,
          },
          {
            id: '6',
            startTime: '15:00',
            endTime: '16:00',
            location: 'Lab 9201',
            isAvailable: false,
          },
        ];
        setAvailableSlots(mockSlots);
        setLoadingSlots(false);
      }, 800);
    } catch (error) {
      console.error('Fetch available slots error:', error);
      message.error('Gagal memuat slot waktu tersedia');
      setLoadingSlots(false);
    }
  };

  const disabledDate = (current) => {
    if (!current) return false;
    
    // Disable dates before today
    const today = dayjs().startOf('day');
    if (current < today) return true;
    
    // Disable weekends (Saturday = 6, Sunday = 0)
    const day = current.day();
    if (day === 0 || day === 6) return true;
    
    // Disable dates more than 2 months from now
    const maxDate = dayjs().add(2, 'month');
    if (current > maxDate) return true;
    
    return false;
  };

  const handleDosenChange = (value) => {
    setSelectedDosen(value);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    form.setFieldsValue({ 
      date: undefined,
      timeSlot: undefined 
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) {
      message.warning('Slot waktu ini sudah tidak tersedia');
      return;
    }
    setSelectedSlot(slot.id);
    form.setFieldsValue({ timeSlot: slot.id });
  };

  const handleSubmit = async (values) => {
    if (!selectedSlot) {
      message.warning('Silakan pilih slot waktu terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        thesisProjectId: 'project-id', // Get from state/context
        dosenId: values.dosenId,
        scheduledDate: values.date.format('YYYY-MM-DD'),
        timeSlotId: selectedSlot,
        notes: values.notes || '',
      };

      // Replace with actual API call
      // await guidanceApi.requestSession(requestData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      message.success({
        content: 'Pengajuan bimbingan berhasil dikirim! Menunggu persetujuan dosen.',
        duration: 5,
      });
      
      // Reset form
      form.resetFields();
      setSelectedDate(null);
      setSelectedDosen(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
      
      // Navigate to history page
      setTimeout(() => {
        navigate('/mahasiswa/history');
      }, 2000);
    } catch (error) {
      console.error('Request guidance error:', error);
      message.error('Gagal mengajukan bimbingan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDosenInfo = () => {
    if (!selectedDosen) return null;
    return supervisors.find((s) => s.id === selectedDosen);
  };

  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> Ajukan Bimbingan
      </Title>
      <Paragraph type="secondary">
        Pilih dosen pembimbing dan tanggal untuk melihat slot waktu yang tersedia, 
        kemudian ajukan jadwal bimbingan Anda.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Alert
              message="Informasi Pengajuan Bimbingan"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>Pilih dosen pembimbing terlebih dahulu</li>
                  <li>Pilih tanggal yang diinginkan (tidak dapat memilih weekend)</li>
                  <li>Sistem akan menampilkan slot waktu yang tersedia</li>
                  <li>Pengajuan akan menunggu persetujuan dari dosen</li>
                  <li>Anda akan menerima notifikasi setelah dosen merespons</li>
                </ul>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              {/* Dosen Selection */}
              <Form.Item
                name="dosenId"
                label={
                  <span>
                    <UserOutlined /> Dosen Pembimbing
                  </span>
                }
                rules={[{ required: true, message: 'Silakan pilih dosen pembimbing' }]}
              >
                <Select
                  placeholder="Pilih dosen pembimbing"
                  size="large"
                  onChange={handleDosenChange}
                  loading={loadingSupervisors}
                  disabled={loadingSupervisors}
                >
                  {supervisors.map((dosen) => (
                    <Option key={dosen.id} value={dosen.id}>
                      <Space>
                        <UserOutlined />
                        <span>
                          {dosen.nama}
                        </span>
                        <Tag color="blue">Pembimbing {dosen.supervisorOrder}</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Date Selection */}
              <Form.Item
                name="date"
                label={
                  <span>
                    <CalendarOutlined /> Tanggal Bimbingan
                  </span>
                }
                rules={[{ required: true, message: 'Silakan pilih tanggal bimbingan' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="dddd, DD MMMM YYYY"
                  disabledDate={disabledDate}
                  onChange={handleDateChange}
                  placeholder="Pilih tanggal"
                  disabled={!selectedDosen}
                />
              </Form.Item>

              {/* Available Slots */}
              {selectedDate && selectedDosen && (
                <>
                  <Divider orientation="left">
                    <ClockCircleOutlined /> Slot Waktu Tersedia
                  </Divider>
                  
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Spin size="large" tip="Memuat slot waktu tersedia..." />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        Pilih salah satu slot waktu di bawah ini:
                      </Text>
                      <Form.Item
                        name="timeSlot"
                        rules={[{ required: true, message: 'Silakan pilih slot waktu' }]}
                      >
                        <List
                          grid={{ 
                            gutter: 16, 
                            xs: 1, 
                            sm: 2, 
                            md: 2, 
                            lg: 3,
                            xl: 3,
                          }}
                          dataSource={availableSlots}
                          renderItem={(slot) => (
                            <List.Item>
                              <Card
                                hoverable={slot.isAvailable}
                                style={{
                                  cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                                  opacity: slot.isAvailable ? 1 : 0.6,
                                  border: selectedSlot === slot.id
                                    ? '2px solid #1890ff'
                                    : '1px solid #d9d9d9',
                                  backgroundColor: selectedSlot === slot.id
                                    ? '#e6f7ff'
                                    : slot.isAvailable 
                                    ? 'white' 
                                    : '#f5f5f5',
                                  transition: 'all 0.3s',
                                }}
                                onClick={() => handleSlotSelect(slot)}
                              >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  <Text 
                                    strong 
                                    style={{ 
                                      fontSize: 16,
                                      color: slot.isAvailable ? '#1890ff' : '#8c8c8c'
                                    }}
                                  >
                                    <ClockCircleOutlined /> {slot.startTime} - {slot.endTime}
                                  </Text>
                                  <Text type="secondary">
                                    <EnvironmentOutlined /> {slot.location}
                                  </Text>
                                  {slot.isAvailable ? (
                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                      Tersedia
                                    </Tag>
                                  ) : (
                                    <Tag color="error">Tidak Tersedia</Tag>
                                  )}
                                </Space>
                              </Card>
                            </List.Item>
                          )}
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <Empty 
                      description="Tidak ada slot waktu tersedia untuk tanggal ini"
                      style={{ padding: 40 }}
                    />
                  )}
                </>
              )}

              {/* Notes */}
              <Form.Item 
                name="notes" 
                label="Catatan (Opsional)"
                tooltip="Anda dapat menambahkan topik atau hal yang ingin didiskusikan"
              >
                <TextArea
                  rows={4}
                  placeholder="Contoh: Ingin diskusi tentang implementasi algoritma collaborative filtering"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Space size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<CalendarOutlined />}
                    loading={loading}
                    disabled={!selectedDate || !selectedDosen || !selectedSlot}
                  >
                    Ajukan Bimbingan
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => {
                      form.resetFields();
                      setSelectedDate(null);
                      setSelectedDosen(null);
                      setSelectedSlot(null);
                      setAvailableSlots([]);
                    }}
                  >
                    Reset Form
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Info Panel */}
        <Col xs={24} lg={8}>
          {selectedDosen && (
            <Card 
              title="Informasi Dosen Pembimbing"
              style={{ marginBottom: 16 }}
            >
              {(() => {
                const dosen = getSelectedDosenInfo();
                return dosen ? (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ display: 'block' }}>Nama Lengkap</Text>
                      <Text strong>{dosen.nama}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ display: 'block' }}>NIP</Text>
                      <Text>{dosen.nip}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ display: 'block' }}>Email</Text>
                      <Text>{dosen.email}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ display: 'block' }}>Status</Text>
                      <Tag color="blue">Pembimbing {dosen.supervisorOrder}</Tag>
                    </div>
                  </Space>
                ) : null;
              })()}
            </Card>
          )}

          {selectedDate && (
            <Card title="Tanggal Dipilih">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedDate.format('dddd')}
                </Text>
                <Text style={{ fontSize: 18, color: '#1890ff' }}>
                  {selectedDate.format('DD MMMM YYYY')}
                </Text>
              </Space>
            </Card>
          )}

          <Card 
            title="Tips Pengajuan Bimbingan" 
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" size="small">
              <Text>• Ajukan minimal 1 hari sebelumnya</Text>
              <Text>• Siapkan materi yang akan didiskusikan</Text>
              <Text>• Bawa progress pekerjaan Anda</Text>
              <Text>• Catat poin-poin penting dari bimbingan</Text>
              <Text>• Segera kerjakan tugas yang diberikan</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RequestGuidance;