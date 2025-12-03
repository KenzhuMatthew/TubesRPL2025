// pages/dosen/AddSchedule.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  TimePicker,
  Button,
  Card,
  Space,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { dosenAPI } from '../../api/dosen.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

const AddSchedule = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Convert TimePicker values to HH:mm format
      const scheduleData = {
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        courseName: values.courseName,
        room: values.room || '',
        semester: values.semester,
      };

      await dosenAPI.createSchedule(scheduleData);
      message.success('Jadwal berhasil ditambahkan');
      navigate('/dosen/schedule');
    } catch (error) {
      console.error('Error adding schedule:', error);
      message.error(error.message || 'Gagal menambahkan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dosen/schedule');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          style={{ marginBottom: 12, paddingLeft: 0 }}
        >
          Kembali
        </Button>
        
        <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
          Tambah Jadwal Mengajar
        </Title>
        <Text type="secondary">
          Tambahkan jadwal mengajar Anda untuk semester ini
        </Text>
        <Divider />
      </div>

      {/* Form */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          {/* Day */}
          <Form.Item
            label={
              <Space size={4}>
                <CalendarOutlined />
                <span>Hari</span>
              </Space>
            }
            name="dayOfWeek"
            rules={[
              { required: true, message: 'Hari harus dipilih' }
            ]}
          >
            <Select
              placeholder="Pilih Hari"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {DAYS.map(day => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Time Range */}
          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              label={
                <Space size={4}>
                  <ClockCircleOutlined />
                  <span>Waktu Mulai</span>
                </Space>
              }
              name="startTime"
              rules={[
                { required: true, message: 'Waktu mulai harus diisi' }
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Pilih waktu mulai"
                size="large"
                style={{ width: '100%' }}
                minuteStep={15}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space size={4}>
                  <ClockCircleOutlined />
                  <span>Waktu Selesai</span>
                </Space>
              }
              name="endTime"
              dependencies={['startTime']}
              rules={[
                { required: true, message: 'Waktu selesai harus diisi' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value || !startTime || value.isAfter(startTime)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Waktu selesai harus lebih besar dari waktu mulai'));
                  },
                }),
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Pilih waktu selesai"
                size="large"
                style={{ width: '100%' }}
                minuteStep={15}
              />
            </Form.Item>
          </Space>

          <Divider style={{ margin: '16px 0' }} />

          {/* Course Name */}
          <Form.Item
            label="Nama Mata Kuliah"
            name="courseName"
            rules={[
              { required: true, message: 'Nama mata kuliah harus diisi' },
              { min: 3, message: 'Nama mata kuliah minimal 3 karakter' }
            ]}
          >
            <Input
              placeholder="Contoh: Pemrograman Web"
              size="large"
            />
          </Form.Item>

          {/* Room */}
          <Form.Item
            label={
              <Space size={4}>
                <EnvironmentOutlined />
                <span>Ruangan</span>
              </Space>
            }
            name="room"
          >
            <Input
              placeholder="Contoh: Lab Komputer 1 (Opsional)"
              size="large"
            />
          </Form.Item>

          {/* Semester */}
          <Form.Item
            label="Semester"
            name="semester"
            rules={[
              { required: true, message: 'Semester harus diisi' }
            ]}
          >
            <Input
              placeholder="Contoh: Ganjil 2024/2025"
              size="large"
            />
          </Form.Item>

          <Divider />

          {/* Actions */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                size="large"
                icon={<CloseOutlined />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={isSubmitting}
              >
                Simpan Jadwal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddSchedule;