// pages/admin/ImportData.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Space, Typography, Steps, Alert } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ImportData = () => {
  const navigate = useNavigate();

  const importCards = [
    {
      title: 'Import Jadwal Dosen',
      description: 'Import jadwal mengajar dosen dari file Excel/CSV. Jadwal ini akan digunakan untuk menghindari konflik saat penjadwalan bimbingan.',
      icon: <CalendarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      color: '#e6f7ff',
      borderColor: '#91d5ff',
      path: '/admin/import/schedules',
      step: 'Langkah 1',
      stepColor: '#1890ff',
      features: [
        'Format: Excel (.xlsx, .xls) atau CSV',
        'Kolom: NIDN, Hari, Jam Mulai, Jam Selesai, Mata Kuliah, Ruangan',
        'Deteksi otomatis konflik jadwal',
        'NIDN harus 10 digit',
      ],
    },
    {
      title: 'Import Proyek Tugas Akhir',
      description: 'Import proyek TA dan alokasi pembimbing. Mahasiswa harus sudah terdaftar terlebih dahulu di sistem.',
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      color: '#fff7e6',
      borderColor: '#ffd591',
      path: '/admin/import/thesis-projects',
      step: 'Langkah 2',
      stepColor: '#fa8c16',
      features: [
        'Format: Excel (.xlsx, .xls) atau CSV',
        'Kolom: NPM (10 digit), Judul TA, Jenis (TA1/TA2), NIDN Pembimbing 1 & 2',
        'Mahasiswa harus sudah ada di database',
        'Validasi ketersediaan dosen',
      ],
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Import Data
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 0 }}>
          Import data massal ke sistem menggunakan file Excel atau CSV
        </Paragraph>
      </div>

      {/* Info Alert */}
      <Card 
        style={{ 
          marginBottom: 24, 
          background: '#e6f7ff', 
          borderColor: '#91d5ff' 
        }}
      >
        <Space align="start" size="large">
          <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>
              📋 Panduan Import Data
            </Text>
            <Paragraph style={{ marginBottom: 12 }}>
              • Pastikan format file sesuai dengan template yang disediakan<br />
              • Ukuran file maksimal 5MB<br />
              • Data akan divalidasi sebelum disimpan<br />
              • Jika terjadi error, akan ditampilkan detail kesalahan untuk setiap baris<br />
              • <strong>NPM mahasiswa harus 10 digit (bukan 12 digit)</strong><br />
              • <strong>NIDN dosen harus 10 digit</strong>
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Import Cards */}
      <Row gutter={[24, 24]}>
        {importCards.map((card, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: 8,
                borderColor: card.borderColor,
                transition: 'all 0.3s',
                position: 'relative',
              }}
              bodyStyle={{ 
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Step Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: card.stepColor,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {card.step}
              </div>

              <div
                style={{
                  width: 80,
                  height: 80,
                  background: card.color,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {card.icon}
              </div>

              <Title level={4} style={{ marginBottom: 12 }}>
                {card.title}
              </Title>

              <Paragraph 
                style={{ 
                  color: '#595959', 
                  marginBottom: 20,
                  flex: 1,
                  minHeight: 60,
                }}
              >
                {card.description}
              </Paragraph>

              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                  Detail:
                </Text>
                <ul style={{ 
                  paddingLeft: 20, 
                  margin: 0,
                  color: '#8c8c8c',
                }}>
                  {card.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 13 }}>{feature}</Text>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(card.path)}
                style={{ marginTop: 'auto' }}
              >
                Mulai Import
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Download Templates Section */}
      <Card 
        title="Download Template" 
        style={{ marginTop: 24 }}
      >
        <Paragraph>
          Download template Excel/CSV untuk memudahkan proses import data:
        </Paragraph>
        <Space wrap size="large">
          <Button 
            icon={<DownloadOutlined />}
            size="large"
          >
            Template Jadwal Dosen
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            size="large"
          >
            Template Proyek TA
          </Button>
        </Space>
        <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
          <Text type="secondary">
            💡 Untuk template import mahasiswa & dosen, tersedia di halaman <strong>Manage Users</strong>
          </Text>
        </Paragraph>
      </Card>
    </div>
  );
};

export default ImportData;