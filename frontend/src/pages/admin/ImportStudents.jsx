// pages/admin/ImportStudents.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Select,
  Steps,
  Table,
  Alert,
  Space,
  message,
  Typography,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  InboxOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { FILE_UPLOAD, SEMESTER_TYPE } from '../../utils/constants';

const { Dragger } = Upload;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ImportStudents = () => {
  const navigate = useNavigate();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: ({ file, semester }) => adminApi.importStudentData(file, semester),
    onSuccess: (data) => {
      setImportResult(data);
      setCurrentStep(2);
      
      if (data.failed > 0) {
        message.warning(`Import selesai dengan ${data.failed} data gagal`);
      } else {
        message.success('Import berhasil!');
      }
    },
    onError: (error) => {
      message.error(error.response?.data?.message || error.message || 'Import gagal');
      console.error('Import error:', error);
    },
  });

  // Handle file upload
  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: FILE_UPLOAD.ALLOWED_EXTENSIONS.join(','),
    beforeUpload: (file) => {
      const isValidType = FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type) ||
        FILE_UPLOAD.ALLOWED_EXTENSIONS.some(ext => file.name.endsWith(ext));
      
      if (!isValidType) {
        message.error('Format file tidak valid! Gunakan Excel (.xlsx, .xls) atau CSV (.csv)');
        return Upload.LIST_IGNORE;
      }

      const isValidSize = file.size <= FILE_UPLOAD.MAX_SIZE;
      if (!isValidSize) {
        message.error(`Ukuran file maksimal ${FILE_UPLOAD.MAX_SIZE_TEXT}`);
        return Upload.LIST_IGNORE;
      }

      setFile(file);
      message.success(`File ${file.name} berhasil dipilih`);
      return false;
    },
    onRemove: () => {
      setFile(null);
      message.info('File dihapus');
    },
    fileList: file ? [file] : [],
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 0) {
      if (!file) {
        message.warning('Pilih file terlebih dahulu');
        return;
      }
      if (!semester || !academicYear) {
        message.warning('Pilih semester dan tahun akademik');
        return;
      }
      // Langsung import tanpa preview
      handleImport();
    }
  };

  // Handle import
  const handleImport = async () => {
    const fullSemester = `${academicYear} ${semester}`;
    setCurrentStep(1); // Set to loading state
    await importMutation.mutateAsync({ file, semester: fullSemester });
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0 && currentStep < 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep(0);
    setFile(null);
    setSemester('');
    setAcademicYear('');
    setImportResult(null);
  };

  // Steps configuration
  const steps = [
    {
      title: 'Upload File',
      description: 'Pilih file dan semester',
    },
    {
      title: 'Import Data',
      description: 'Proses import data',
    },
    {
      title: 'Hasil Import',
      description: 'Lihat hasil import',
    },
  ];

  // Generate academic years
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let i = -1; i <= 2; i++) {
    const year = currentYear + i;
    academicYears.push(`${year}/${year + 1}`);
  }

  // Download template handler
  const handleDownloadTemplate = () => {
    // Create template data
    const templateData = [
      ['NPM', 'Nama', 'Email', 'Angkatan', 'Phone'],
      ['2140102001', 'Ahmad Fauzi', 'ahmad.fauzi@student.ac.id', '2021', '081234567890'],
      ['2140102002', 'Siti Nurhaliza', 'siti.nurhaliza@student.ac.id', '2021', '081234567891'],
      ['2140102003', 'Budi Santoso', 'budi.santoso@student.ac.id', '2021', '081234567892'],
    ];

    // Convert to CSV
    const csv = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_mahasiswa.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Template berhasil didownload');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          onClick={() => navigate('/admin/import')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#1890ff',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <ArrowLeftOutlined />
          <span>Kembali ke Import Data</span>
        </div>

        <Title level={2} style={{ marginBottom: 8 }}>
          Import Data Mahasiswa
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 0 }}>
          Import data mahasiswa dari file Excel atau CSV
        </Paragraph>
      </div>

      {/* Steps */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Step 0: Upload File */}
      {currentStep === 0 && (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Info Alert */}
            <Alert
              message="Format File - NPM 10 Digit"
              description={
                <div>
                  <Paragraph>
                    File harus berisi kolom-kolom berikut:
                  </Paragraph>
                  <ul style={{ marginBottom: 0 }}>
                    <li><strong>NPM:</strong> Nomor Pokok Mahasiswa (<Text type="danger">10 digit</Text>)</li>
                    <li><strong>Nama:</strong> Nama lengkap mahasiswa</li>
                    <li><strong>Email:</strong> Email mahasiswa</li>
                    <li><strong>Angkatan:</strong> Tahun angkatan (contoh: 2023)</li>
                    <li><strong>Phone:</strong> Nomor telepon (opsional)</li>
                  </ul>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    <Text type="warning">
                      ⚠️ Pastikan NPM menggunakan <strong>10 digit</strong>, bukan 12 digit
                    </Text>
                  </Paragraph>
                </div>
              }
              type="info"
              showIcon
            />

            {/* Download Template */}
            <div>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                size="large"
              >
                Download Template CSV
              </Button>
              <Text type="secondary" style={{ marginLeft: 12 }}>
                Download template untuk memastikan format yang benar
              </Text>
            </div>

            <Divider />

            {/* Semester Selection */}
            <div>
              <Title level={5}>Pilih Periode Akademik</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>Tahun Akademik:</Text>
                  <Select
                    placeholder="Pilih tahun"
                    style={{ width: '100%', display: 'block', marginTop: 8 }}
                    value={academicYear}
                    onChange={setAcademicYear}
                    size="large"
                  >
                    {academicYears.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={12}>
                  <Text>Semester:</Text>
                  <Select
                    placeholder="Pilih semester"
                    style={{ width: '100%', display: 'block', marginTop: 8 }}
                    value={semester}
                    onChange={setSemester}
                    size="large"
                  >
                    <Option value={SEMESTER_TYPE.GANJIL}>Ganjil</Option>
                    <Option value={SEMESTER_TYPE.GENAP}>Genap</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* File Upload */}
            <div>
              <Title level={5}>Upload File</Title>
              <Dragger {...uploadProps} style={{ marginTop: 16 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
                </p>
                <p className="ant-upload-text">
                  Klik atau drag file ke area ini untuk upload
                </p>
                <p className="ant-upload-hint">
                  Support: Excel (.xlsx, .xls) atau CSV (.csv)
                  <br />
                  Maksimal {FILE_UPLOAD.MAX_SIZE_TEXT}
                </p>
              </Dragger>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => navigate('/admin/import')} size="large">
                Batal
              </Button>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleNext}
                disabled={!file || !semester || !academicYear}
                size="large"
              >
                Import Data
              </Button>
            </div>
          </Space>
        </Card>
      )}

      {/* Step 1: Loading/Processing */}
      {currentStep === 1 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <FileExcelOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
            <Title level={3}>Memproses Import Data...</Title>
            <Paragraph type="secondary">
              Mohon tunggu, sistem sedang memproses data mahasiswa Anda
            </Paragraph>
          </div>
        </Card>
      )}

      {/* Step 2: Import Result */}
      {currentStep === 2 && importResult && (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Success/Warning Alert */}
            {importResult.failed === 0 ? (
              <Alert
                message="Import Berhasil!"
                description="Semua data mahasiswa berhasil diimport ke sistem."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            ) : (
              <Alert
                message="Import Selesai dengan Peringatan"
                description={`${importResult.success + importResult.updated} data berhasil, ${importResult.failed} data gagal diimport.`}
                type="warning"
                showIcon
              />
            )}

            {/* Statistics */}
            <Card title="Ringkasan Import" type="inner">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Data"
                    value={importResult.total || 0}
                    prefix={<FileExcelOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Berhasil Import"
                    value={importResult.success || 0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Berhasil Update"
                    value={importResult.updated || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Gagal"
                    value={importResult.failed || 0}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Errors (if any) */}
            {importResult.errors && importResult.errors.length > 0 && (
              <Card title="Detail Error" type="inner">
                <Alert
                  message={`${importResult.errors.length} data gagal diimport`}
                  description={
                    <Table
                      columns={[
                        {
                          title: 'Baris',
                          dataIndex: 'row',
                          key: 'row',
                          width: 80,
                        },
                        {
                          title: 'NPM',
                          dataIndex: 'npm',
                          key: 'npm',
                          width: 120,
                        },
                        {
                          title: 'Nama',
                          dataIndex: 'nama',
                          key: 'nama',
                        },
                        {
                          title: 'Error',
                          dataIndex: 'error',
                          key: 'error',
                          render: (text) => (
                            <Text type="danger">{text}</Text>
                          ),
                        },
                      ]}
                      dataSource={importResult.errors}
                      pagination={false}
                      size="small"
                      rowKey="row"
                    />
                  }
                  type="error"
                  showIcon
                />
              </Card>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate('/admin/import')} size="large">
                Kembali ke Import Data
              </Button>
              <Space>
                <Button onClick={handleReset} size="large">
                  Import Lagi
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/admin/users?role=MAHASISWA')}
                  size="large"
                >
                  Lihat Data Mahasiswa
                </Button>
              </Space>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ImportStudents;