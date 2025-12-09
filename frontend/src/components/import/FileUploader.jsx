import React, { useState } from 'react';
import { Upload, Button, Alert, Space, Typography } from 'antd';
import { InboxOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { FILE_UPLOAD } from '../../utils/constants';

const { Dragger } = Upload;
const { Text, Link } = Typography;

const FileUploader = ({ 
  onFileSelect, 
  accept = FILE_UPLOAD.ALLOWED_TYPES.join(','),
  templateUrl,
  templateName = 'template',
  description = 'Klik atau drag file ke area ini untuk upload',
  maxSize = FILE_UPLOAD.MAX_SIZE,
}) => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);

  const handleBeforeUpload = (file) => {
    setError(null);

    // Check file type
    const isValidType = FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type) ||
      FILE_UPLOAD.ALLOWED_TYPES.some(ext => file.name.endsWith(ext));
    
    if (!isValidType) {
      setError('Format file tidak valid. Hanya menerima file Excel (.xlsx, .xls) atau CSV (.csv)');
      return Upload.LIST_IGNORE;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`);
      return Upload.LIST_IGNORE;
    }

    setFileList([file]);
    onFileSelect(file);
    
    // Prevent auto upload
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    onFileSelect(null);
    setError(null);
  };

  const downloadTemplate = () => {
    if (templateUrl) {
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = `${templateName}.xlsx`;
      link.click();
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {templateUrl && (
        <Alert
          message="Template File"
          description={
            <Space>
              <Text>Download template file terlebih dahulu untuk memastikan format yang benar.</Text>
              <Link onClick={downloadTemplate}>
                <DownloadOutlined /> Download Template
              </Link>
            </Space>
          }
          type="info"
          showIcon
        />
      )}

      <Dragger
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        maxCount={1}
        accept={accept}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{description}</p>
        <p className="ant-upload-hint">
          Support untuk file Excel (.xlsx, .xls) dan CSV (.csv)
        </p>
      </Dragger>

      {error && (
        <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
      )}
    </Space>
  );
};

export default FileUploader;
