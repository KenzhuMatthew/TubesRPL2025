import { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  TimePicker, 
  Alert,
  Space,
  Tag,
  Popconfirm,
  Card,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

// Mock hook - ganti dengan hook asli Anda
const useSchedule = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      courseName: 'Pemrograman Web',
      courseCode: 'IF301',
      day: 'Senin',
      startTime: '08:00',
      endTime: '10:00',
      room: 'Lab 1',
      lecturer: 'Dr. Budi Santoso'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    // Simulasi fetch
    setTimeout(() => setLoading(false), 500);
  };

  const addSchedule = async (data) => {
    const newSchedule = {
      id: Date.now(),
      ...data
    };
    setSchedules([...schedules, newSchedule]);
    message.success('Jadwal berhasil ditambahkan');
  };

  const updateSchedule = async (id, data) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, ...data } : s));
    message.success('Jadwal berhasil diperbarui');
  };

  const deleteSchedule = async (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
    message.success('Jadwal berhasil dihapus');
  };

  return {
    schedules,
    loading,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule
  };
};

const MahasiswaSchedule = () => {
  const {
    schedules,
    loading,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const handleAdd = () => {
    setSelectedSchedule(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    form.setFieldsValue({
      ...schedule,
      time: [
        dayjs(schedule.startTime, 'HH:mm'),
        dayjs(schedule.endTime, 'HH:mm')
      ]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
  };

  const handleSubmit = async (values) => {
    const formData = {
      courseName: values.courseName,
      courseCode: values.courseCode,
      day: values.day,
      startTime: values.time[0].format('HH:mm'),
      endTime: values.time[1].format('HH:mm'),
      room: values.room,
      lecturer: values.lecturer
    };

    if (selectedSchedule) {
      await updateSchedule(selectedSchedule.id, formData);
    } else {
      await addSchedule(formData);
    }
    
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Kode',
      dataIndex: 'courseCode',
      key: 'courseCode',
      width: 100,
    },
    {
      title: 'Mata Kuliah',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Hari',
      dataIndex: 'day',
      key: 'day',
      width: 100,
      render: (day) => <Tag color="blue">{day}</Tag>
    },
    {
      title: 'Waktu',
      key: 'time',
      width: 150,
      render: (_, record) => `${record.startTime} - ${record.endTime}`
    },
    {
      title: 'Ruangan',
      dataIndex: 'room',
      key: 'room',
      width: 120,
    },
    {
      title: 'Dosen',
      dataIndex: 'lecturer',
      key: 'lecturer',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus jadwal ini?"
            description="Apakah Anda yakin ingin menghapus jadwal ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Jadwal Kuliah
          </h1>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Kelola jadwal kuliah Anda untuk mencegah konflik dengan jadwal bimbingan
          </p>
        </div>

        <Alert
          message="Mengapa harus mengisi jadwal kuliah?"
          description="Sistem akan menggunakan jadwal kuliah Anda untuk membantu mencegah konflik saat mengajukan jadwal bimbingan dengan dosen pembimbing."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Tambah Jadwal
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} jadwal`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={selectedSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Kode Mata Kuliah"
            name="courseCode"
            rules={[{ required: true, message: 'Kode mata kuliah wajib diisi' }]}
          >
            <Input placeholder="Contoh: IF301" />
          </Form.Item>

          <Form.Item
            label="Nama Mata Kuliah"
            name="courseName"
            rules={[{ required: true, message: 'Nama mata kuliah wajib diisi' }]}
          >
            <Input placeholder="Contoh: Pemrograman Web" />
          </Form.Item>

          <Form.Item
            label="Hari"
            name="day"
            rules={[{ required: true, message: 'Hari wajib dipilih' }]}
          >
            <Select placeholder="Pilih hari">
              {days.map(day => (
                <Option key={day} value={day}>{day}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Waktu"
            name="time"
            rules={[{ required: true, message: 'Waktu wajib dipilih' }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              style={{ width: '100%' }}
              placeholder={['Mulai', 'Selesai']}
            />
          </Form.Item>

          <Form.Item
            label="Ruangan"
            name="room"
            rules={[{ required: true, message: 'Ruangan wajib diisi' }]}
          >
            <Input placeholder="Contoh: Lab 1" />
          </Form.Item>

          <Form.Item
            label="Dosen Pengampu"
            name="lecturer"
            rules={[{ required: true, message: 'Dosen pengampu wajib diisi' }]}
          >
            <Input placeholder="Contoh: Dr. Budi Santoso" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedSchedule ? 'Perbarui' : 'Simpan'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MahasiswaSchedule;