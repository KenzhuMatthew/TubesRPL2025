import React from 'react';
import { Table, Alert, Space, Typography, Statistic, Row, Col, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ImportPreview = ({ data, validationResults }) => {
  const { valid = [], invalid = [], warnings = [] } = validationResults || {};
  
  const totalRecords = (valid.length || 0) + (invalid.length || 0);
  const validRecords = valid.length || 0;
  const invalidRecords = invalid.length || 0;
  const warningRecords = warnings.length || 0;

  // Generate columns from data
  const columns = data && data.length > 0
    ? Object.keys(data[0]).map(key => ({
        title: key,
        dataIndex: key,
        key: key,
        ellipsis: true,
        width: 150,
      }))
    : [];

  // Add status column if validation results exist
  if (validationResults) {
    columns.push({
      title: 'Status',
      key: 'status',
      fixed: 'right',
      width: 100,
      render: (_, record, index) => {
        const isInvalid = invalid.some(item => item.row === index);
        const hasWarning = warnings.some(item => item.row === index);
        
        if (isInvalid) {
          return (
            <Text type="danger">
              <CloseCircleOutlined /> Invalid
            </Text>
          );
        }
        if (hasWarning) {
          return (
            <Text type="warning">
              <WarningOutlined /> Warning
            </Text>
          );
        }
        return (
          <Text type="success">
            <CheckCircleOutlined /> Valid
          </Text>
        );
      },
    });
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {validationResults && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Data"
                value={totalRecords}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Valid"
                value={validRecords}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Invalid"
                value={invalidRecords}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Warning"
                value={warningRecords}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {invalidRecords > 0 && (
        <Alert
          message="Data Invalid Ditemukan"
          description={
            <Space direction="vertical">
              <Text>Terdapat {invalidRecords} baris data yang tidak valid:</Text>
              <ul style={{ marginBottom: 0 }}>
                {invalid.slice(0, 5).map((item, index) => (
                  <li key={index}>
                    Baris {item.row + 2}: {item.errors.join(', ')}
                  </li>
                ))}
                {invalid.length > 5 && (
                  <li>... dan {invalid.length - 5} error lainnya</li>
                )}
              </ul>
            </Space>
          }
          type="error"
          showIcon
        />
      )}

      {warningRecords > 0 && (
        <Alert
          message="Peringatan"
          description={
            <Space direction="vertical">
              <Text>Terdapat {warningRecords} baris data dengan peringatan:</Text>
              <ul style={{ marginBottom: 0 }}>
                {warnings.slice(0, 3).map((item, index) => (
                  <li key={index}>
                    Baris {item.row + 2}: {item.message}
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li>... dan {warnings.length - 3} peringatan lainnya</li>
                )}
              </ul>
            </Space>
          }
          type="warning"
          showIcon
        />
      )}

      <Card title="Preview Data">
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content', y: 400 }}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey={(record, index) => index}
          rowClassName={(record, index) => {
            const isInvalid = invalid.some(item => item.row === index);
            const hasWarning = warnings.some(item => item.row === index);
            if (isInvalid) return 'row-invalid';
            if (hasWarning) return 'row-warning';
            return '';
          }}
        />
      </Card>

      <style jsx>{`
        .row-invalid {
          background-color: #fff1f0 !important;
        }
        .row-warning {
          background-color: #fffbe6 !important;
        }
      `}</style>
    </Space>
  );
};

export default ImportPreview;