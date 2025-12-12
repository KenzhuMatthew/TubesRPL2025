// pages/admin/MonitoringReport.jsx (FIXED Version 2)
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Tabs,
  Input,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { 
  THESIS_TYPE, 
  THESIS_REQUIREMENTS, 
  SEMESTER_TYPE,
  PAGINATION 
} from '../../utils/constants';

const { Option } = Select;
const { Search } = Input;

const MonitoringReport = () => {
  // States
  const [filters, setFilters] = useState({
    semester: null,
    academicYear: null,
    thesisType: null,
    search: '',
  });
  const [pagination, setPagination] = useState({
    current: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_LIMIT,
  });
  const [activeTab, setActiveTab] = useState('all');

  // Fetch monitoring data
  const { data: monitoringData, isLoading, refetch } = useQuery({
    queryKey: ['monitoring', filters, pagination, activeTab],
    queryFn: () => adminApi.getMonitoringReport({
      ...filters,
      status: activeTab !== 'all' ? activeTab : undefined,
    }),
  });

  // Fetch students not meeting requirements
  const { data: notMeetingData, isLoading: notMeetingLoading } = useQuery({
    queryKey: ['not-meeting-requirements', filters],
    queryFn: () => adminApi.getStudentsNotMeetingRequirements(filters),
    enabled: activeTab === 'not-meeting',
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle table change
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle export
  const handleExport = async (format) => {
    message.info(`Fitur export ${format} sedang dalam pengembangan.`);
  };

  // Statistics cards data
  const statsData = monitoringData?.summary || {
    totalStudents: 0,
    meetingRequirements: 0,
    notMeetingRequirements: 0,
    avgGuidanceCount: 0,
  };

  // Generate academic years
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let i = -1; i <= 2; i++) {
    const year = currentYear + i;
    academicYears.push(`${year}/${year + 1}`);
  }

  // Table columns for all students
  const allStudentsColumns = [
    {
      title: 'Mahasiswa',
      key: 'student',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <strong>{record.nama}</strong>
          {/* FIXED: Changed nim to npm */}
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{record.npm}</span>
        </Space>
      ),
    },
    {
      title: 'Jenis TA',
      // FIXED: dataIndex matches API response ('type')
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'TA1' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Pembimbing',
      // FIXED: dataIndex matches API response ('dosen')
      dataIndex: 'dosen',
      key: 'pembimbing',
      width: 200,
      render: (pembimbing) => (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {pembimbing}
        </div>
      ),
    },
    {
      title: 'Jumlah Bimbingan',
      key: 'guidance',
      width: 200,
      render: (_, record) => {
        const required = THESIS_REQUIREMENTS[record.type]?.total || 8;
        const current = record.totalGuidance || 0;
        const percentage = required > 0 ? (current / required) * 100 : 0;
        const status = current >= required ? 'success' : current >= required * 0.5 ? 'normal' : 'exception';
        
        return (
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>{current} / {required}</span>
              <span style={{ fontSize: 13, color: status === 'success' ? '#52c41a' : status === 'exception' ? '#ff4d4f' : '#faad14' }}>
                {Math.round(percentage)}%
              </span>
            </div>
            <Progress percent={percentage} status={status} size="small" showInfo={false} />
          </Space>
        );
      },
    },
    {
      title: 'Sebelum UTS',
      dataIndex: 'beforeUTS',
      key: 'beforeUTS',
      width: 120,
      align: 'center',
      render: (count, record) => {
        const required = THESIS_REQUIREMENTS[record.type]?.beforeUTS || 4;
        const isMet = count >= required;
        return (
          <Tooltip title={`Minimal: ${required} sesi`}>
            <Tag color={isMet ? 'success' : 'error'}>{count} / {required}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Sebelum UAS',
      dataIndex: 'beforeUAS',
      key: 'beforeUAS',
      width: 120,
      align: 'center',
      render: (count, record) => {
        const required = THESIS_REQUIREMENTS[record.type]?.beforeUAS || 4;
        const isMet = count >= required;
        return (
          <Tooltip title={`Minimal: ${required} sesi`}>
            <Tag color={isMet ? 'success' : 'error'}>{count} / {required}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        record.meetsRequirement ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Memenuhi Syarat</Tag>
        ) : (
          <Tag icon={<WarningOutlined />} color="error">Belum Memenuhi</Tag>
        )
      ),
    },
  ];

  // Table columns for students not meeting requirements
  const notMeetingColumns = [
    ...allStudentsColumns.slice(0, 4),
    {
      title: 'Kekurangan',
      key: 'deficit',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const required = THESIS_REQUIREMENTS[record.type]?.total || 8;
        const current = record.totalGuidance || 0;
        const deficit = Math.max(0, required - current);
        return <Tag color="error" style={{ fontSize: 16, padding: '4px 12px' }}>-{deficit} sesi</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => message.info(`Detail mahasiswa: ${record.nama}`)}>
          Lihat Detail
        </Button>
      ),
    },
  ];

  // Tabs items
  const tabItems = [
    {
      key: 'all',
      label: 'Semua Mahasiswa',
      children: (
        <Table
          columns={allStudentsColumns}
          dataSource={monitoringData?.students || []}
          loading={isLoading}
          pagination={{
            ...pagination,
            total: monitoringData?.students?.length || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} mahasiswa`,
          }}
          onChange={handleTableChange}
          // FIXED: Use a unique key like 'npm' from the API response
          rowKey="npm"
          scroll={{ x: 1400 }}
        />
      ),
    },
    {
      key: 'not-meeting',
      label: (
        <span>
          <WarningOutlined /> Belum Memenuhi Syarat
          {/* FIXED: Changed notMeetingData.data to notMeetingData.students */}
          {notMeetingData?.students?.length > 0 && (
            <Tag color="error" style={{ marginLeft: 8 }}>{notMeetingData.students.length}</Tag>
          )}
        </span>
      ),
      children: notMeetingLoading ? (
        <Loading />
      ) : notMeetingData?.students?.length === 0 ? (
        <EmptyState description="Semua mahasiswa telah memenuhi syarat minimum bimbingan" />
      ) : (
        <Table
          columns={notMeetingColumns}
          dataSource={notMeetingData?.students || []}
          pagination={false}
          // FIXED: Use a unique key like 'npm' from the API response
          rowKey="npm"
          scroll={{ x: 1400 }}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Monitoring & Laporan</h1>
        <p style={{ color: '#8c8c8c', marginBottom: 0 }}>Pantau progres bimbingan mahasiswa dan identifikasi yang belum memenuhi syarat</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Mahasiswa" value={statsData.totalStudents} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Memenuhi Syarat" value={statsData.meetingRequirements} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} suffix={`/ ${statsData.totalStudents}`} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Belum Memenuhi" value={statsData.notMeetingRequirements} prefix={<WarningOutlined />} valueStyle={{ color: '#ff4d4f' }} suffix={`/ ${statsData.totalStudents}`} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Rata-rata Bimbingan" value={statsData.avgGuidanceCount || 0} precision={1} prefix={<ClockCircleOutlined />} suffix="sesi" /></Card></Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Select placeholder="Tahun Akademik" style={{ width: 160 }} value={filters.academicYear} onChange={(value) => handleFilterChange('academicYear', value)} allowClear>
              {academicYears.map((year) => (<Option key={year} value={year}>{year}</Option>))}
            </Select>
            <Select placeholder="Semester" style={{ width: 140 }} value={filters.semester} onChange={(value) => handleFilterChange('semester', value)} allowClear>
              <Option value={SEMESTER_TYPE.GANJIL}>Ganjil</Option>
              <Option value={SEMESTER_TYPE.GENAP}>Genap</Option>
            </Select>
            <Select placeholder="Jenis TA" style={{ width: 120 }} value={filters.thesisType} onChange={(value) => handleFilterChange('thesisType', value)} allowClear>
              <Option value={THESIS_TYPE.TA1}>TA1</Option>
              <Option value={THESIS_TYPE.TA2}>TA2</Option>
            </Select>
            <Search placeholder="Cari mahasiswa..." style={{ width: 250 }} onSearch={(value) => handleFilterChange('search', value)} allowClear />
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
          </Space>
          <Space>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport('xlsx')}>Export Excel</Button>
            <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>Export PDF</Button>
          </Space>
        </Space>
      </Card>

      {/* Data Table with Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default MonitoringReport;