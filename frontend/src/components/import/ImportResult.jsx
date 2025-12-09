import React from 'react';
import { Result, Button, Space, Card, Descriptions, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const ImportResult = ({ 
  success, 
  result, 
  onReset, 
  onViewData 
}) => {
  if (success) {
    return (
      <Result
        status="success"
        title="Import Data Berhasil!"
        subTitle={
          <Space direction="vertical">
            <div>Data berhasil diimpor ke sistem.</div>
            {result && (
              <Card size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Total Data Diproses">
                    {result.total || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Berhasil">
                    <span style={{ color: '#52c41a' }}>
                      {result.success || 0}
                    </span>
                  </Descriptions.Item>
                  {result.failed > 0 && (
                    <Descriptions.Item label="Gagal">
                      <span style={{ color: '#ff4d4f' }}>
                        {result.failed || 0}
                      </span>
                    </Descriptions.Item>
                  )}
                  {result.skipped > 0 && (
                    <Descriptions.Item label="Dilewati">
                      <span style={{ color: '#faad14' }}>
                        {result.skipped || 0}
                      </span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Space>
        }
        extra={[
          <Button type="primary" key="view" onClick={onViewData}>
            Lihat Data
          </Button>,
          <Button key="import" onClick={onReset}>
            Import Lagi
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status="error"
      title="Import Data Gagal"
      subTitle={
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>Terjadi kesalahan saat mengimpor data.</div>
          {result?.message && (
            <Alert
              message="Error Detail"
              description={result.message}
              type="error"
              showIcon
            />
          )}
          {result?.errors && result.errors.length > 0 && (
            <Card size="small" title="Daftar Error">
              <ul style={{ marginBottom: 0 }}>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Card>
          )}
        </Space>
      }
      extra={[
        <Button type="primary" key="retry" onClick={onReset}>
          Coba Lagi
        </Button>,
      ]}
    />
  );
};

export default ImportResult;