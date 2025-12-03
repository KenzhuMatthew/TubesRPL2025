// pages/admin/ImportThesisProjects.jsx
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
  Progress,
  Typography,
  Divider,
} from 'antd';
import {
  InboxOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { FILE_UPLOAD, SEMESTER_TYPE } from '../../utils/constants';

const { Dragger } = Upload;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ImportThesisProjects = () => {
  const navigate = useNavigate();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: ({ file, semester }) => adminApi.importThesisProjects(file, semester),
    onSuccess: (data) => {
      setImportResult(data);
      setCurrentStep(1);
      
      if (data.failed === 0) {
        message.success('Import berhasil! Semua data berhasil diimport.');
      } else if (data.success > 0 || data.updated > 0) {
        message.warning(`Import selesai dengan ${data.failed} error. Periksa detail di bawah.`);
      } else {
        message.error('Import gagal. Periksa format file dan data Anda.');
      }
    },
    onError: (error) => {
      message.error(error.response?.data?.message || error.message || 'Import gagal');
    },
  });

  // Handle file upload
  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.csv,.xlsx,.xls',
    beforeUpload: (file) => {
      const isValidType = file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');
      
      if (!isValidType) {
        message.error('Format file tidak valid! Gunakan Excel (.xlsx, .xls) atau CSV (.csv).');
        return Upload.LIST_IGNORE;
      }

      const isValidSize = file.size <= FILE_UPLOAD.MAX_SIZE;
      if (!isValidSize) {
        message.error(`Ukuran file maksimal ${FILE_UPLOAD.MAX_SIZE_TEXT}`);
        return Upload.LIST_IGNORE;
      }

      setFile(file);
      message.success(`File ${file.name} berhasil dipilih`);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFile(null);
      message.info('File dihapus');
    },
  };

  // Handle import
  const handleImport = async () => {
    if (!file) {
      message.warning('Pilih file terlebih dahulu');
      return;
    }
    if (!semester || !academicYear) {
      message.warning('Pilih semester dan tahun akademik');
      return;
    }

    const fullSemester = `${academicYear} ${semester}`;
    await importMutation.mutateAsync({ file, semester: fullSemester });
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep(0);
    setFile(null);
    setSemester('');
    setAcademicYear('');
    setImportResult(null);
  };

  // Error columns for table
  const errorColumns = [
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
      title: 'Judul',
      dataIndex: 'judul',
      key: 'judul',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error) => <Text type="danger">{error}</Text>,
    },
  ];

  // Steps configuration
  const steps = [
    {
      title: 'Upload & Import',
      description: 'Pilih file dan import',
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

  // Download template
  const handleDownloadTemplate = () => {
    const templateData = `NPM,Judul TA,Jenis,NIDN Pembimbing 1,NIDN Pembimbing 2
2140102001,Sistem Informasi Manajemen Bimbingan Akademik Berbasis Web,TA1,0123456789,0123456790
2140102002,Aplikasi Mobile Learning Berbasis Android,TA1,0123456789,0123456791
2140102003,Implementasi Machine Learning untuk Prediksi Kelulusan,TA2,0123456790,0123456792`;

    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_proyek_ta.csv';
    link.click();
    window.URL.revokeObjectURL(url);
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
          Import Proyek Tugas Akhir
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 0 }}>
          Import data proyek tugas akhir dan alokasi pembimbing dari file Excel atau CSV
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
              message="Format File yang Diperlukan"
              description={
                <div>
                  <Paragraph style={{ marginBottom: 8 }}>
                    File Excel atau CSV harus berisi kolom-kolom berikut (header baris pertama):
                  </Paragraph>
                  <ul style={{ marginBottom: 12 }}>
                    <li><strong>NPM:</strong> Nomor Pokok Mahasiswa (<Text type="danger">10 digit</Text>)</li>
                    <li><strong>Judul TA:</strong> Judul atau topik tugas akhir</li>
                    <li><strong>Jenis:</strong> TA1 atau TA2</li>
                    <li><strong>NIDN Pembimbing 1:</strong> NIDN dosen pembimbing utama (<Text type="danger">10 digit, wajib</Text>)</li>
                    <li><strong>NIDN Pembimbing 2:</strong> NIDN dosen pembimbing kedua (<Text type="danger">10 digit, opsional</Text>)</li>
                  </ul>
                  <Text type="warning">
                    <WarningOutlined /> <strong>Penting:</strong> 
                  </Text>
                  <ul style={{ marginTop: 8 }}>
                    <li>NPM dan NIDN harus <strong>10 digit angka</strong></li>
                    <li>Mahasiswa harus <strong>sudah terdaftar</strong> di sistem sebelum import proyek TA</li>
                    <li>Dosen pembimbing harus <strong>sudah terdaftar</strong> di sistem</li>
                  </ul>
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
              >
                Download Template CSV
              </Button>
            </div>

            <Divider />

            {/* Semester Selection */}
            <div>
              <Title level={5}>Pilih Periode Akademik</Title>
              <Space size="large">
                <div>
                  <Text>Tahun Akademik: <Text type="danger">*</Text></Text>
                  <Select
                    placeholder="Pilih tahun"
                    style={{ width: 200, display: 'block', marginTop: 8 }}
                    value={academicYear}
                    onChange={setAcademicYear}
                  >
                    {academicYears.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Text>Semester: <Text type="danger">*</Text></Text>
                  <Select
                    placeholder="Pilih semester"
                    style={{ width: 200, display: 'block', marginTop: 8 }}
                    value={semester}
                    onChange={setSemester}
                  >
                    <Option value={SEMESTER_TYPE.GANJIL}>Ganjil</Option>
                    <Option value={SEMESTER_TYPE.GENAP}>Genap</Option>
                  </Select>
                </div>
              </Space>
            </div>

            <Divider />

            {/* File Upload */}
            <div>
              <Title level={5}>Upload File <Text type="danger">*</Text></Title>
              <Dragger {...uploadProps} style={{ marginTop: 16 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
                </p>
                <p className="ant-upload-text">
                  Klik atau drag file ke area ini untuk upload
                </p>
                <p className="ant-upload-hint">
                  Support: Excel (.xlsx, .xls) atau CSV (.csv). Maksimal {FILE_UPLOAD.MAX_SIZE_TEXT}
                </p>
              </Dragger>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => navigate('/admin/import')}>
                Batal
              </Button>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleImport}
                disabled={!file || !semester || !academicYear}
                loading={importMutation.isLoading}
              >
                Import Sekarang
              </Button>
            </div>
          </Space>
        </Card>
      )}

      {/* Step 1: Import Result */}
      {currentStep === 1 && importResult && (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Result Alert */}
            {importResult.failed === 0 ? (
              <Alert
                message="Import Berhasil!"
                description={`Semua ${importResult.success + importResult.updated} proyek TA berhasil diimport ke sistem untuk periode ${academicYear} ${semester}.`}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            ) : (importResult.success > 0 || importResult.updated > 0) ? (
              <Alert
                message="Import Selesai dengan Warning"
                description={`${importResult.success} proyek baru diimport, ${importResult.updated} proyek diupdate, tetapi ${importResult.failed} data gagal. Periksa detail error di bawah.`}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
              />
            ) : (
              <Alert
                message="Import Gagal"
                description={`Semua ${importResult.total} data gagal diimport. Periksa format file dan data Anda.`}
                type="error"
                showIcon
                icon={<CloseCircleOutlined />}
              />
            )}

            {/* Statistics */}
            <Card title="Ringkasan Import" type="inner">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total Data Diproses:</Text>
                  <Text strong>{importResult.total}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Berhasil (Baru):</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {importResult.success}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Berhasil (Update):</Text>
                  <Text strong style={{ color: '#1890ff' }}>
                    {importResult.updated}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Gagal:</Text>
                  <Text strong style={{ color: '#ff4d4f' }}>
                    {importResult.failed}
                  </Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Progress
                  percent={Math.round(((importResult.success + importResult.updated) / importResult.total) * 100)}
                  status={importResult.failed === 0 ? 'success' : 'exception'}
                  strokeColor={importResult.failed === 0 ? '#52c41a' : '#faad14'}
                />
              </Space>
            </Card>

            {/* Errors Table */}
            {importResult.errors && importResult.errors.length > 0 && (
              <Card title={`Detail Error (${importResult.errors.length} dari ${importResult.failed})`} type="inner">
                <Alert
                  message="Penyebab Error Umum"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>NPM mahasiswa belum terdaftar di sistem (import mahasiswa terlebih dahulu)</li>
                      <li>NIDN pembimbing belum terdaftar di sistem</li>
                      <li>Format NPM tidak valid (harus 10 digit angka)</li>
                      <li>Format NIDN tidak valid (harus 10 digit angka)</li>
                      <li>Jenis TA tidak valid (gunakan TA1 atau TA2)</li>
                      <li>Kolom wajib kosong (NPM, Judul, NIDN Pembimbing 1)</li>
                    </ul>
                  }
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                
                <Table
                  columns={errorColumns}
                  dataSource={importResult.errors.map((err, idx) => ({ ...err, key: idx }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                  size="small"
                />
                
                {importResult.failed > importResult.errors.length && (
                  <Alert
                    message={`Menampilkan ${importResult.errors.length} dari ${importResult.failed} error. Error lainnya tidak ditampilkan.`}
                    type="info"
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate('/admin/import')}>
                Kembali ke Import Data
              </Button>
              <Space>
                <Button onClick={handleReset}>
                  Import File Lain
                </Button>
                {(importResult.success > 0 || importResult.updated > 0) && (
                  <Button type="primary" onClick={() => navigate('/admin/monitoring')}>
                    Lihat Laporan Monitoring
                  </Button>
                )}
              </Space>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ImportThesisProjects;