// pages/admin/AcademicPeriod.jsx
import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { SEMESTER_TYPE } from '../../utils/constants';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AcademicPeriod = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  // Fetch academic periods
  const { data: periodsData, isLoading } = useQuery({
    queryKey: ['academic-periods'],
    queryFn: () => adminApi.getAcademicPeriods(),
  });

  // Fetch active period
  const { data: activePeriod } = useQuery({
    queryKey: ['active-period'],
    queryFn: () => adminApi.getActivePeriod(),
  });

  // Create period mutation
  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createAcademicPeriod(data),
    onSuccess: () => {
      message.success('Periode akademik berhasil ditambahkan');
      queryClient.invalidateQueries(['academic-periods']);
      handleCloseModal();
    },
    onError: (error) => {
      message.error(error.message || 'Gagal menambahkan periode akademik');
    },
  });

  // Update period mutation
  const updateMutation = useMutation({
    mutationFn: ({ periodId, data }) => adminApi.updateAcademicPeriod(periodId, data),
    onSuccess: () => {
      message.success('Periode akademik berhasil diupdate');
      queryClient.invalidateQueries(['academic-periods']);
      handleCloseModal();
    },
    onError: (error) => {
      message.error(error.message || 'Gagal mengupdate periode akademik');
    },
  });

  // Delete period mutation
  const deleteMutation = useMutation({
    mutationFn: (periodId) => adminApi.deleteAcademicPeriod(periodId),
    onSuccess: () => {
      message.success('Periode akademik berhasil dihapus');
      queryClient.invalidateQueries(['academic-periods']);
    },
    onError: (error) => {
      message.error(error.message || 'Gagal menghapus periode akademik');
    },
  });

  // Set active period mutation
  const setActiveMutation = useMutation({
    mutationFn: (periodId) => adminApi.setActivePeriod(periodId),
    onSuccess: () => {
      message.success('Periode akademik aktif berhasil diubah');
      queryClient.invalidateQueries(['academic-periods']);
      queryClient.invalidateQueries(['active-period']);
    },
    onError: (error) => {
      message.error(error.message || 'Gagal mengubah periode aktif');
    },
  });

  // Handlers
  const handleAdd = () => {
    setEditingPeriod(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    form.setFieldsValue({
      academicYear: period.academicYear,
      semester: period.semester,
      dateRange: [dayjs(period.startDate), dayjs(period.endDate)],
      utsDate: dayjs(period.utsDate),
      uasDate: dayjs(period.uasDate),
    });
    setModalVisible(true);
  };

  const handleDelete = (periodId) => {
    deleteMutation.mutate(periodId);
  };

  const handleSetActive = (periodId) => {
    setActiveMutation.mutate(periodId);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPeriod(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const data = {
        academicYear: values.academicYear,
        semester: values.semester,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        utsDate: values.utsDate.format('YYYY-MM-DD'),
        uasDate: values.uasDate.format('YYYY-MM-DD'),
      };

      if (editingPeriod) {
        await updateMutation.mutateAsync({
          periodId: editingPeriod.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Generate academic years
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let i = -1; i <= 3; i++) {
    const year = currentYear + i;
    academicYears.push(`${year}/${year + 1}`);
  }

  // Table columns
  const columns = [
    {
      title: 'Tahun Akademik',
      dataIndex: 'academicYear',
      key: 'academicYear',
      width: 150,
      render: (year, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{year}</span>
          {record.isActive && (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Aktif
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      width: 120,
      render: (semester) => (
        <Tag color={semester === SEMESTER_TYPE.GANJIL ? 'blue' : 'green'}>
          {semester === SEMESTER_TYPE.GANJIL ? 'Ganjil' : 'Genap'}
        </Tag>
      ),
    },
    {
      title: 'Periode',
      key: 'period',
      render: (_, record) => {
        const start = dayjs(record.startDate).format('DD MMM YYYY');
        const end = dayjs(record.endDate).format('DD MMM YYYY');
        return `${start} - ${end}`;
      },
    },
    {
      title: 'UTS',
      dataIndex: 'utsDate',
      key: 'utsDate',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'UAS',
      dataIndex: 'uasDate',
      key: 'uasDate',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const now = dayjs();
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        
        let status = 'upcoming';
        let color = 'default';
        let text = 'Akan Datang';
        
        if (now.isAfter(end)) {
          status = 'ended';
          color = 'default';
          text = 'Selesai';
        } else if (now.isBefore(start)) {
          status = 'upcoming';
          color = 'processing';
          text = 'Akan Datang';
        } else {
          status = 'ongoing';
          color = 'success';
          text = 'Berlangsung';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!record.isActive && (
            <Tooltip title="Jadikan Aktif">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleSetActive(record.id)}
                loading={setActiveMutation.isLoading}
              >
                Aktifkan
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Hapus periode akademik?"
            description="Aksi ini tidak dapat dibatalkan."
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Hapus">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={record.isActive}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Periode Akademik
            </h1>
            <p style={{ color: '#8c8c8c', marginBottom: 0 }}>
              Kelola periode akademik dan tentukan periode aktif
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Tambah Periode
          </Button>
        </div>
      </div>

      {/* Active Period Info */}
      {activePeriod && (
        <Card 
          style={{ 
            marginBottom: 24, 
            background: '#e6f7ff', 
            borderColor: '#91d5ff' 
          }}
        >
          <Space>
            <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>
                Periode Aktif: {activePeriod.academicYear} - {activePeriod.semester}
              </div>
              <div style={{ color: '#595959', marginTop: 4 }}>
                {dayjs(activePeriod.startDate).format('DD MMMM YYYY')} - {dayjs(activePeriod.endDate).format('DD MMMM YYYY')}
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Table */}
      <Card>
        {periodsData?.data?.length === 0 ? (
          <EmptyState
            description="Belum ada periode akademik"
            actionText="Tambah Periode"
            onAction={handleAdd}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={periodsData?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} periode`,
            }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPeriod ? 'Edit Periode Akademik' : 'Tambah Periode Akademik'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={editingPeriod ? 'Update' : 'Tambah'}
        cancelText="Batal"
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Tahun Akademik"
            name="academicYear"
            rules={[{ required: true, message: 'Pilih tahun akademik' }]}
          >
            <Select placeholder="Pilih tahun akademik">
              {academicYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Semester"
            name="semester"
            rules={[{ required: true, message: 'Pilih semester' }]}
          >
            <Select placeholder="Pilih semester">
              <Option value={SEMESTER_TYPE.GANJIL}>Ganjil</Option>
              <Option value={SEMESTER_TYPE.GENAP}>Genap</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Periode Semester"
            name="dateRange"
            rules={[{ required: true, message: 'Pilih periode semester' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD MMMM YYYY"
              placeholder={['Tanggal Mulai', 'Tanggal Selesai']}
            />
          </Form.Item>

          <Form.Item
            label="Tanggal UTS"
            name="utsDate"
            rules={[{ required: true, message: 'Pilih tanggal UTS' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD MMMM YYYY"
              placeholder="Pilih tanggal UTS"
            />
          </Form.Item>

          <Form.Item
            label="Tanggal UAS"
            name="uasDate"
            rules={[
              { required: true, message: 'Pilih tanggal UAS' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const utsDate = getFieldValue('utsDate');
                  if (!value || !utsDate || value.isAfter(utsDate)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Tanggal UAS harus setelah UTS'));
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD MMMM YYYY"
              placeholder="Pilih tanggal UAS"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AcademicPeriod;