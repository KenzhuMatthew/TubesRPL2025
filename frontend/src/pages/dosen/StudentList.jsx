// pages/dosen/StudentList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Progress,
  Avatar,
  Statistic,
  Empty,
  Divider,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { dosenAPI } from '../../api/dosen.api';

const { Title, Text } = Typography;
const { Search } = Input;

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, TA1, TA2

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await dosenAPI.getStudents();
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchSearch = 
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.npm.includes(searchQuery);
    
    const matchType = filterType === 'ALL' || student.thesisProject?.tipe === filterType;

    return matchSearch && matchType;
  });

  // Calculate stats
  const stats = {
    total: students.length,
    ta1: students.filter(s => s.thesisProject?.tipe === 'TA1').length,
    ta2: students.filter(s => s.thesisProject?.tipe === 'TA2').length,
    eligible: students.filter(s => s.progress?.canGraduate).length,
  };

  if (loading) {
    return <Loading tip="Memuat daftar mahasiswa..." />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
          Mahasiswa Bimbingan
        </Title>
        <Text type="secondary">
          Daftar mahasiswa yang Anda bimbing
        </Text>
        <Divider />
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="TA 1"
              value={stats.ta1}
              prefix={
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#722ed1' }}
                >
                  1
                </Avatar>
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="TA 2"
              value={stats.ta2}
              prefix={
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#52c41a' }}
                >
                  2
                </Avatar>
              }
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Layak Sidang"
              value={stats.eligible}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Search
            placeholder="Cari nama atau NPM..."
            allowClear
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
          />

          <Space wrap>
            {[
              { value: 'ALL', label: 'Semua' },
              { value: 'TA1', label: 'TA1' },
              { value: 'TA2', label: 'TA2' },
            ].map(type => (
              <Button
                key={type.value}
                type={filterType === type.value ? 'primary' : 'default'}
                onClick={() => setFilterType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </Space>
        </Space>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong>
                  {searchQuery ? 'Mahasiswa tidak ditemukan' : 'Belum ada mahasiswa bimbingan'}
                </Text>
                <Text type="secondary">
                  {searchQuery ? 'Coba kata kunci lain' : 'Mahasiswa bimbingan akan muncul di sini'}
                </Text>
              </Space>
            }
          />
        </Card>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {filteredStudents.map(student => {
            const progress = student.progress || {};
            const isEligible = progress.canGraduate;
            const completedCount = (progress.completedBeforeUTS || 0) + (progress.completedBeforeUAS || 0);
            const requiredCount = student.thesisProject?.tipe === 'TA1' ? 4 : 6;
            const progressPercent = Math.min((completedCount / requiredCount) * 100, 100);

            return (
              <Card
                key={student.id}
                hoverable
                onClick={() => navigate(`/dosen/students/${student.id}/progress`)}
                style={{ cursor: 'pointer' }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* Student Info */}
                      <Space size="middle">
                        <Avatar
                          size={48}
                          style={{ backgroundColor: '#1890ff', fontSize: 20 }}
                        >
                          {student.nama.charAt(0)}
                        </Avatar>
                        <div>
                          <Text strong style={{ fontSize: 16 }}>
                            {student.nama}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {student.npm} • Angkatan {student.angkatan}
                          </Text>
                        </div>
                      </Space>

                      {/* Tags */}
                      {student.thesisProject && (
                        <Space wrap>
                          <Tag color="blue">{student.thesisProject.tipe}</Tag>
                          {isEligible ? (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                              Layak Sidang
                            </Tag>
                          ) : (
                            <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                              Belum Memenuhi
                            </Tag>
                          )}
                        </Space>
                      )}

                      {/* Thesis Title */}
                      {student.thesisProject?.judul && (
                        <Text
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ fontSize: 14 }}
                        >
                          <Text strong>Judul:</Text> {student.thesisProject.judul}
                        </Text>
                      )}

                      {/* Progress Bar */}
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: 8 
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Progress Bimbingan
                          </Text>
                          <Text strong style={{ fontSize: 12 }}>
                            {completedCount}/{requiredCount}
                          </Text>
                        </div>
                        <Progress
                          percent={progressPercent}
                          strokeColor={isEligible ? '#52c41a' : '#1890ff'}
                          showInfo={false}
                        />
                      </div>
                    </Space>
                  </Col>

                  {/* Arrow */}
                  <Col>
                    <RightOutlined style={{ color: '#d9d9d9' }} />
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
};

export default StudentList;