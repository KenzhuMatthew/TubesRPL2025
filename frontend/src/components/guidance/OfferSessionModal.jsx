// components/guidance/OfferSessionModal.jsx
import { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Input, message, Alert } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { guidanceApi } from '../../api/guidance.api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const OfferSessionModal = ({ visible, onCancel, onSuccess, students = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedStudent(null);
    }
  }, [visible, form]);

  const handleStudentChange = (mahasiswaId) => {
    const student = students.find(s => s.id === mahasiswaId);
    setSelectedStudent(student);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        mahasiswaId: values.mahasiswaId,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        location: values.location,
        notes: values.notes || null,
      };

      await guidanceApi.offerSession(payload);
      message.success('Tawaran bimbingan berhasil dikirim ke mahasiswa');
      form.resetFields();
      setSelectedStudent(null);
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Error offering session:', error);
      message.error(error.response?.data?.message || 'Gagal mengajukan bimbingan');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title="Ajukan Bimbingan ke Mahasiswa"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Ajukan Bimbingan"
      cancelText="Batal"
      confirmLoading={loading}
      width={600}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        {/* Student Selection */}
        <Form.Item
          name="mahasiswaId"
          label={
            <span>
              <UserOutlined /> Mahasiswa
            </span>
          }
          rules={[{ required: true, message: 'Pilih mahasiswa' }]}
        >
          <Select
            placeholder="Pilih mahasiswa..."
            showSearch
            optionFilterProp="children"
            onChange={handleStudentChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {students.map(student => (
              <Select.Option key={student.id} value={student.id}>
                {student.nama} - {student.npm}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Selected Student Info */}
        {selectedStudent && (
          <Alert
            message={selectedStudent.judul}
            description={
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '2px 8px', 
                  backgroundColor: '#e6f7ff', 
                  border: '1px solid #91d5ff',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginRight: '8px'
                }}>
                  {selectedStudent.thesisType}
                </span>
                <span style={{ fontSize: '12px' }}>
                  Total bimbingan: {selectedStudent.totalGuidance}
                </span>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Date */}
        <Form.Item
          name="scheduledDate"
          label={
            <span>
              <CalendarOutlined /> Tanggal
            </span>
          }
          rules={[{ required: true, message: 'Tanggal harus diisi' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD MMMM YYYY"
            disabledDate={disabledDate}
            placeholder="Pilih tanggal"
          />
        </Form.Item>

        {/* Time Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="startTime"
            label={
              <span>
                <ClockCircleOutlined /> Waktu Mulai
              </span>
            }
            rules={[{ required: true, message: 'Waktu mulai harus diisi' }]}
          >
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              placeholder="Pilih waktu"
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label={
              <span>
                <ClockCircleOutlined /> Waktu Selesai
              </span>
            }
            rules={[
              { required: true, message: 'Waktu selesai harus diisi' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue('startTime');
                  if (!value || !startTime) {
                    return Promise.resolve();
                  }
                  if (value.isAfter(startTime)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Waktu selesai harus lebih besar dari waktu mulai'));
                },
              }),
            ]}
          >
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              placeholder="Pilih waktu"
            />
          </Form.Item>
        </div>

        {/* Location */}
        <Form.Item
          name="location"
          label={
            <span>
              <EnvironmentOutlined /> Lokasi
            </span>
          }
          rules={[{ required: true, message: 'Lokasi harus diisi' }]}
        >
          <Input placeholder="Contoh: Ruang Dosen GKU Lt.3 / Google Meet" />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label={
            <span>
              <FileTextOutlined /> Catatan (Opsional)
            </span>
          }
          extra="Catatan ini akan dilihat oleh mahasiswa"
        >
          <TextArea
            rows={4}
            placeholder="Tambahkan catatan untuk mahasiswa, misalnya topik yang akan dibahas atau persiapan yang diperlukan..."
          />
        </Form.Item>

        {/* Info Box */}
        <Alert
          message="ℹ️ Informasi"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Mahasiswa akan menerima notifikasi tawaran bimbingan ini</li>
              <li>Mahasiswa dapat menerima atau menolak tawaran</li>
              <li>Pastikan waktu tidak bentrok dengan jadwal mengajar Anda</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
};

export default OfferSessionModal;