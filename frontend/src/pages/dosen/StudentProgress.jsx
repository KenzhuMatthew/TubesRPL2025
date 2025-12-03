// pages/dosen/StudentProgress.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Tabs,
  Progress,
  Avatar,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Descriptions,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  RiseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Loading from '../../components/common/Loading';
import { getStudentProgress } from '../../api/dosen.api';
import { formatDate } from '../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;

const StudentProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudentProgress();
  }, [id]);

  const loadStudentProgress = async () => {
    try {
      const response = await getStudentProgress(id);
      setData(response.data);
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading tip="Memuat progress mahasiswa..." />;
  }

  if (!data) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Data mahasiswa tidak ditemukan"
        />
      </Card>
    );
  }

  const { student, thesisProject, progress, sessions } = data;
  const thesisType = thesisProject?.tipe || 'TA1';
  const requiredBeforeUTS = thesisType === 'TA1' ? 2 : 3;
  const requiredBeforeUAS = thesisType === 'TA1' ? 2 : 3;
  const totalRequired = requiredBeforeUTS + requiredBeforeUAS;
  
  const completedBeforeUTS = progress?.completedBeforeUTS || 0;
  const completedBeforeUAS = progress?.completedBeforeUAS || 0;
  const totalCompleted = completedBeforeUTS + completedBeforeUAS;
  
  const meetsUTSRequirement = completedBeforeUTS >= requiredBeforeUTS;
  const meetsUASRequirement = completedBeforeUAS >= requiredBeforeUAS;
  const canGraduate = meetsUTSRequirement && meetsUASRequirement;

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: null,
    },
    {
      key: 'timeline',
      label: 'Timeline',
      children: null,
    },
  ];

  return (
    <div>
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dosen/students')}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Kembali ke Daftar Mahasiswa
      </Button>

      {/* Student Header Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col flex="none">
            <Avatar
              size={80}
              style={{ backgroundColor: '#1890ff', fontSize: 32 }}
            >
              {student.nama.charAt(0)}
            </Avatar>
          </Col>

          <Col flex="auto">
            <Title level={2} style={{ marginBottom: 16, marginTop: 0 }}>
              {student.nama}
            </Title>
            
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <Space size={4}>
                  <UserOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{student.npm}</Text>
                </Space>
              </Col>
              
              <Col xs={24} md={12}>
                <Space size={4}>
                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">Angkatan {student.angkatan}</Text>
                </Space>
              </Col>
              
              {student.email && (
                <Col xs={24} md={12}>
                  <Space size={4}>
                    <MailOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{student.email}</Text>
                  </Space>
                </Col>
              )}
              
              {student.phone && (
                <Col xs={24} md={12}>
                  <Space size={4}>
                    <PhoneOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{student.phone}</Text>
                  </Space>
                </Col>
              )}
            </Row>

            {/* Thesis Project */}
            {thesisProject && (
              <>
                <Card
                  size="small"
                  style={{ marginTop: 16, background: '#fafafa' }}
                  bordered={false}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space size={4}>
                      <BookOutlined style={{ color: '#8c8c8c' }} />
                      <Text strong style={{ fontSize: 13 }}>Tugas Akhir:</Text>
                    </Space>
                    <Text>{thesisProject.judul}</Text>
                    <Space>
                      <Tag color="blue">{thesisProject.tipe}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {thesisProject.semester}
                      </Text>
                    </Space>
                  </Space>
                </Card>
              </>
            )}
          </Col>

          {/* Graduation Status Badge */}
          <Col flex="none">
            <Card
              size="small"
              style={{
                background: canGraduate ? '#f6ffed' : '#fffbe6',
                borderColor: canGraduate ? '#b7eb8f' : '#ffe58f',
              }}
            >
              <Space direction="vertical" size={4} align="center">
                {canGraduate ? (
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
                )}
                <Text strong style={{ color: canGraduate ? '#237804' : '#ad6800' }}>
                  {canGraduate ? 'Layak Sidang' : 'Belum Memenuhi'}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {totalCompleted}/{totalRequired} bimbingan
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              {/* Before UTS */}
              <Col xs={24} md={12}>
                <Card title="Sebelum UTS" size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: 8 
                      }}>
                        <Text>Progress</Text>
                        <Text strong>
                          {completedBeforeUTS}/{requiredBeforeUTS}
                        </Text>
                      </div>
                      <Progress
                        percent={(completedBeforeUTS / requiredBeforeUTS) * 100}
                        status={meetsUTSRequirement ? 'success' : 'active'}
                        strokeColor={meetsUTSRequirement ? '#52c41a' : '#1890ff'}
                      />
                    </div>
                    
                    {progress?.utsDate && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <strong>UTS:</strong> {formatDate(progress.utsDate)}
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>

              {/* Before UAS */}
              <Col xs={24} md={12}>
                <Card title="Sebelum UAS" size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: 8 
                      }}>
                        <Text>Progress</Text>
                        <Text strong>
                          {completedBeforeUAS}/{requiredBeforeUAS}
                        </Text>
                      </div>
                      <Progress
                        percent={(completedBeforeUAS / requiredBeforeUAS) * 100}
                        status={meetsUASRequirement ? 'success' : 'active'}
                        strokeColor={meetsUASRequirement ? '#52c41a' : '#1890ff'}
                      />
                    </div>
                    
                    {progress?.uasDate && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <strong>UAS:</strong> {formatDate(progress.uasDate)}
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Total Progress */}
            <Card
              style={{
                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                borderColor: '#91d5ff',
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="middle">
                  <RiseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <Title level={4} style={{ margin: 0 }}>Total Progress</Title>
                </Space>
                
                <div>
                  <Space size={8} align="baseline">
                    <Text style={{ fontSize: 36, fontWeight: 'bold' }}>
                      {totalCompleted}
                    </Text>
                    <Text style={{ fontSize: 16 }}>
                      / {totalRequired} bimbingan selesai
                    </Text>
                  </Space>
                  
                  <Progress
                    percent={(totalCompleted / totalRequired) * 100}
                    strokeColor="#1890ff"
                    strokeWidth={16}
                    style={{ marginTop: 16 }}
                  />
                </div>

                <Alert
                  message={
                    canGraduate 
                      ? '🎉 Mahasiswa telah memenuhi syarat untuk mengikuti sidang'
                      : `Perlu ${totalRequired - totalCompleted} bimbingan lagi untuk memenuhi syarat sidang`
                  }
                  type={canGraduate ? 'success' : 'info'}
                  showIcon={false}
                />
              </Space>
            </Card>

            {/* Summary */}
            <Card title="Ringkasan">
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <Statistic
                    title="Total Sesi"
                    value={sessions?.length || 0}
                    valueStyle={{ color: '#595959' }}
                  />
                </Col>
                
                <Col xs={12} md={6}>
                  <Statistic
                    title="Selesai"
                    value={totalCompleted}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                
                <Col xs={12} md={6}>
                  <Statistic
                    title="Pending"
                    value={sessions?.filter(s => s.status === 'PENDING').length || 0}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                
                <Col xs={12} md={6}>
                  <Statistic
                    title="Progress"
                    value={Math.round((totalCompleted / totalRequired) * 100)}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        )}

        {activeTab === 'timeline' && (
          sessions && sessions.length > 0 ? (
            <Timeline
              items={sessions.map((session, idx) => ({
                color: session.status === 'COMPLETED' ? 'green' : 
                       session.status === 'APPROVED' ? 'blue' : 'gray',
                dot: session.status === 'COMPLETED' ? <CheckCircleOutlined /> : undefined,
                children: (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{formatDate(session.scheduledDate, 'DD MMMM YYYY')}</Text>
                        <Tag color={
                          session.status === 'COMPLETED' ? 'success' :
                          session.status === 'APPROVED' ? 'processing' : 'default'
                        }>
                          {session.status === 'COMPLETED' ? 'Selesai' : session.status}
                        </Tag>
                      </div>
                      
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {session.startTime} - {session.location}
                      </Text>

                      {session.notes && session.notes.length > 0 && (
                        <Card
                          size="small"
                          style={{ background: '#fafafa', marginTop: 8 }}
                        >
                          <Space size={4}>
                            <FileTextOutlined style={{ color: '#8c8c8c' }} />
                            <Text strong style={{ fontSize: 13 }}>Catatan:</Text>
                          </Space>
                          <Paragraph
                            ellipsis={{ rows: 3, expandable: true }}
                            style={{ marginTop: 8, marginBottom: 0 }}
                          >
                            {session.notes[0].content}
                          </Paragraph>
                        </Card>
                      )}
                    </Space>
                  </Card>
                ),
              }))}
            />
          ) : (
            <Empty description="Belum ada riwayat bimbingan" />
          )
        )}
      </Card>
    </div>
  );
};

export default StudentProgress;