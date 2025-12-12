// pages/dosen/CreateAvailability.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  TimePicker,
  DatePicker,
  Button,
  Card,
  Space,
  Typography,
  Divider,
  Switch,
  Radio,
  Alert,
  message,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { createAvailability } from '../../api/dosen.api';
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

const CreateAvailability = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [slotType, setSlotType] = useState('recurring'); // recurring or specific
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        dayOfWeek: slotType === 'recurring' ? values.dayOfWeek : null,
        specificDate: slotType === 'specific' ? values.specificDate.format('YYYY-MM-DD') : null,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        location: values.location || '',
        isRecurring: slotType === 'recurring',
        isActive: isActive,
      };

      await createAvailability(payload);
      message.success('Slot ketersediaan berhasil ditambahkan');
      navigate('/dosen/availability');
    } catch (error) {
      console.error('Error creating availability:', error);
      message.error(error.response?.data?.message || 'Gagal menambahkan slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dosen/availability');
  };

  const handleSlotTypeChange = (e) => {
    const newType = e.target.value;
    setSlotType(newType);
    // Reset form fields when slot type changes
    if (newType === 'recurring') {
      form.setFieldValue('specificDate', undefined);
    } else {
      form.setFieldValue('dayOfWeek', undefined);
    }
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
          Tambah Slot Ketersediaan
        </Title>
        <Text type="secondary">
          Buat slot waktu untuk ketersediaan bimbingan
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
          initialValues={{
            isActive: true,
          }}
        >
          {/* Slot Type Selection */}
          <Form.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>Tipe Slot</span>
              </Space>
            }
            required
          >
            <Radio.Group
              value={slotType}
              onChange={handleSlotTypeChange}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="recurring" style={{ width: '50%', textAlign: 'center' }}>
                <Space direction="vertical" size={4}>
                  <CalendarOutlined style={{ fontSize: 20 }} />
                  <Text strong>Rutin</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Berulang setiap minggu
                  </Text>
                </Space>
              </Radio.Button>
              <Radio.Button value="specific" style={{ width: '50%', textAlign: 'center' }}>
                <Space direction="vertical" size={4}>
                  <CalendarOutlined style={{ fontSize: 20 }} />
                  <Text strong>Tanggal Spesifik</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Untuk tanggal tertentu
                  </Text>
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider />

          {/* Day Selection (for recurring) */}
          {slotType === 'recurring' && (
            <Form.Item
              label="Hari"
              name="dayOfWeek"
              rules={[{ required: true, message: 'Hari harus dipilih' }]}
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
          )}

          {/* Date Selection (for specific) */}
          {slotType === 'specific' && (
            <Form.Item
              label="Tanggal"
              name="specificDate"
              rules={[{ required: true, message: 'Tanggal harus dipilih' }]}
            >
              <DatePicker
                placeholder="Pilih Tanggal"
                size="large"
                style={{ width: '100%' }}
                format="DD MMMM YYYY"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>
          )}

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
              rules={[{ required: true, message: 'Waktu mulai harus diisi' }]}
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

          {/* Location */}
          <Form.Item
            label={
              <Space size={4}>
                <EnvironmentOutlined />
                <span>Lokasi</span>
              </Space>
            }
            name="location"
          >
            <Input
              placeholder="Contoh: Ruang Dosen 201 (Opsional)"
              size="large"
            />
          </Form.Item>

          {/* Status Toggle */}
          <Card size="small" style={{ background: '#fafafa', marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center' 
            }}>
              <div>
                <Text strong>Status Slot</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {isActive ? 'Slot aktif dan bisa dipilih mahasiswa' : 'Slot tidak aktif'}
                </Text>
              </div>
              <Switch
                checked={isActive}
                onChange={setIsActive}
                checkedChildren="Aktif"
                unCheckedChildren="Off"
              />
            </div>
          </Card>

          {/* Info Box */}
          <Alert
            message="💡 Tips"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Pastikan waktu tidak bertabrakan dengan jadwal mengajar</li>
                <li>Slot rutin akan muncul setiap minggu pada hari yang sama</li>
                <li>Slot dapat dinonaktifkan sementara tanpa menghapus</li>
              </ul>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />

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
                Simpan Slot
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateAvailability;