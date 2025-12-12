// pages/Dashboard.jsx - Main Dashboard (Landing Page)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Row,
  Col,
  Card,
  Space,
  Divider,
  Statistic,
  Progress,
  Tag,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  LogoutOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import './Dashboard.css';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGetStarted = () => {
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'DOSEN':
          navigate('/dosen');
          break;
        case 'MAHASISWA':
          navigate('/mahasiswa');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Penjadwalan Mudah',
      description: 'Atur jadwal bimbingan dengan sistem yang terintegrasi dengan jadwal mengajar dosen',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Koordinasi Efisien',
      description: 'Koordinasi antara mahasiswa dan dosen menjadi lebih mudah dan terorganisir',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Catatan Bimbingan',
      description: 'Dokumentasi lengkap setiap sesi bimbingan untuk referensi di masa depan',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Tracking Progress',
      description: 'Pantau progress bimbingan dan kelayakan sidang secara real-time',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Input Jadwal',
      description: 'Mahasiswa menginput jadwal kuliah, dosen menginput jadwal mengajar',
    },
    {
      step: '02',
      title: 'Ajukan Bimbingan',
      description: 'Mahasiswa melihat slot tersedia dan mengajukan jadwal bimbingan',
    },
    {
      step: '03',
      title: 'Pelaksanaan & Tracking',
      description: 'Dosen menyetujui, melaksanakan bimbingan, dan mencatat progress',
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
      width: '100%', 
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1000,
          height: 64,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Space size="large">
            <div
              style={{
                width: 40,
                height: 40,
                background: '#1890ff',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>
              SIAP Bimbingan
            </Title>
          </Space>

          {user ? (
            <Space size="middle">
              <div style={{ textAlign: 'right' }}>
                <Text strong>{user.nama || user.email}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user.role}
                </Text>
              </div>
              <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          ) : (
            <Button type="primary" size="large" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>

      <div style={{ background: 'transparent', padding: 0, width: '100%', minHeight: 'calc(100vh - 64px)' }}>
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 50%, #e6f7ff 100%)',
            padding: '80px 24px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <Tag color="blue" style={{ marginBottom: 24, padding: '4px 16px', fontSize: 14 }}>
                  Sistem Manajemen Bimbingan TA
                </Tag>
                <Title level={1} style={{ fontSize: 48, marginBottom: 24, lineHeight: 1.2 }}>
                  Kelola Bimbingan
                  <br />
                  Tugas Akhir
                  <br />
                  <span style={{ color: '#1890ff' }}>Lebih Mudah</span>
                </Title>
                <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
                  Platform terintegrasi untuk mempermudah penjadwalan, pelaksanaan, dan pelacakan progres
                  bimbingan tugas akhir antara mahasiswa dan dosen.
                </Paragraph>

                <Space size="middle" wrap>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={handleGetStarted}
                    style={{ height: 48, paddingLeft: 24, paddingRight: 24 }}
                  >
                    {user ? 'Masuk ke Dashboard' : 'Mulai Sekarang'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ height: 48, paddingLeft: 24, paddingRight: 24 }}
                  >
                    Lihat Fitur
                  </Button>
                </Space>

                {/* Stats */}
                <Row gutter={[24, 24]} style={{ marginTop: 48, paddingTop: 48, borderTop: '1px solid #e8e8e8' }}>
                  <Col span={8}>
                    <Statistic
                      title="Mahasiswa Aktif"
                      value={100}
                      suffix="+"
                      valueStyle={{ color: '#1890ff', fontSize: 28 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Dosen Pembimbing"
                      value={50}
                      suffix="+"
                      valueStyle={{ color: '#1890ff', fontSize: 28 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Sesi Bimbingan"
                      value={500}
                      suffix="+"
                      valueStyle={{ color: '#1890ff', fontSize: 28 }}
                    />
                  </Col>
                </Row>
              </Col>

              <Col xs={24} lg={12}>
                <div style={{ position: 'relative' }}>
                  <Card
                    style={{
                      background: 'linear-gradient(135deg, #bae7ff 0%, #91d5ff 100%)',
                      borderRadius: 16,
                      padding: 24,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <Card
                      style={{
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Space size="middle" style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: '#e6f7ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        </div>
                        <div>
                          <Text strong>Jadwal Bimbingan</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Kamis, 10 Oktober 2025
                          </Text>
                        </div>
                      </Space>
                      <Space direction="vertical" size="small">
                        <Space>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              background: '#52c41a',
                              borderRadius: '50%',
                            }}
                          />
                          <Text>09:00 - 10:00 • Ruang Dosen 201</Text>
                        </Space>
                        <Space>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              background: '#1890ff',
                              borderRadius: '50%',
                            }}
                          />
                          <Text>Bimbingan dengan Dr. Ahmad</Text>
                        </Space>
                      </Space>
                    </Card>

                    <Card
                      style={{
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Text strong style={{ marginBottom: 16, display: 'block' }}>
                        Progress Bimbingan
                      </Text>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Sebelum UTS
                            </Text>
                            <Text strong style={{ fontSize: 12 }}>
                              2/2
                            </Text>
                          </div>
                          <Progress percent={100} strokeColor="#52c41a" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Sebelum UAS
                            </Text>
                            <Text strong style={{ fontSize: 12 }}>
                              1/2
                            </Text>
                          </div>
                          <Progress percent={50} strokeColor="#1890ff" />
                        </div>
                      </Space>
                    </Card>
                  </Card>

                  {/* Floating Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -16,
                      right: -16,
                      background: '#fff',
                      borderRadius: 12,
                      padding: '12px 16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '2px solid #bae7ff',
                    }}
                  >
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                      <Text strong>Memenuhi Syarat Sidang</Text>
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <Title level={2} style={{ fontSize: 36, marginBottom: 16 }}>
                Fitur Unggulan
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>
                Berbagai fitur yang dirancang untuk memudahkan proses bimbingan tugas akhir
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {features.map((feature, idx) => (
                <Col xs={24} sm={12} lg={6} key={idx}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      border: '1px solid #e8e8e8',
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: '#e6f7ff',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {feature.title}
                    </Title>
                    <Text type="secondary">{feature.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <Title level={2} style={{ fontSize: 36, marginBottom: 16 }}>
                Cara Kerja
              </Title>
              <Paragraph style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>
                Proses yang sederhana dan efisien
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {steps.map((item, idx) => (
                <Col xs={24} md={8} key={idx}>
                  <div style={{ position: 'relative' }}>
                    <Card
                      style={{
                        height: '100%',
                        borderRadius: 12,
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      bodyStyle={{ padding: 32 }}
                    >
                      <div
                        style={{
                          fontSize: 64,
                          fontWeight: 'bold',
                          color: '#e6f7ff',
                          marginBottom: 16,
                          lineHeight: 1,
                        }}
                      >
                        {item.step}
                      </div>
                      <Title level={3} style={{ marginBottom: 12 }}>
                        {item.title}
                      </Title>
                      <Text type="secondary">{item.description}</Text>
                    </Card>
                    {idx < steps.length - 1 && (
                      <div
                        className="step-arrow"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: -12,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <ArrowRightOutlined style={{ fontSize: 32, color: '#91d5ff' }} />
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#fff', marginBottom: 24, fontSize: 36 }}>
              Siap Memulai?
            </Title>
            <Paragraph style={{ color: '#bae7ff', fontSize: 18, marginBottom: 32 }}>
              Bergabunglah dengan ribuan mahasiswa dan dosen yang sudah menggunakan SIAP Bimbingan
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={handleGetStarted}
              style={{
                height: 48,
                paddingLeft: 40,
                paddingRight: 40,
                background: '#fff',
                color: '#1890ff',
                border: 'none',
                fontSize: 16,
              }}
            >
              {user ? 'Masuk ke Dashboard' : 'Login Sekarang'}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: '#001529',
          color: '#fff',
          padding: '48px 24px',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <Space size="middle" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: '#1890ff',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarOutlined style={{ fontSize: 20, color: '#fff' }} />
                </div>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                  SIAP Bimbingan
                </Title>
              </Space>
              <Text style={{ color: '#8c8c8c' }}>
                Sistem Manajemen Bimbingan Tugas Akhir yang modern dan efisien
              </Text>
            </Col>

            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                Quick Links
              </Title>
              <Space direction="vertical" size="small">
                <a href="#" style={{ color: '#8c8c8c' }}>
                  Tentang
                </a>
                <a href="#features" style={{ color: '#8c8c8c' }}>
                  Fitur
                </a>
                <a href="#" style={{ color: '#8c8c8c' }}>
                  Panduan
                </a>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                Kontak
              </Title>
              <Space direction="vertical" size="small" style={{ color: '#8c8c8c' }}>
                <Text style={{ color: '#8c8c8c' }}>Email: support@siapbimbingan.ac.id</Text>
                <Text style={{ color: '#8c8c8c' }}>Telp: (021) 1234-5678</Text>
              </Space>
            </Col>
          </Row>

          <Divider style={{ borderColor: '#303030', margin: '32px 0' }} />
          <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
            <Text>&copy; 2025 SIAP Bimbingan. All rights reserved.</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
