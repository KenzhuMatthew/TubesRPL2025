// components/common/PageHeader.jsx
import { useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Typography, Divider, Space } from 'antd';
import { ArrowLeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PageHeader = ({ 
  title, 
  description, 
  showBack = false,
  backTo,
  extra,
  breadcrumb 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  // Convert breadcrumb items to Ant Design format
  const breadcrumbItems = breadcrumb?.map((item, index) => ({
    title: item.path ? (
      <a 
        onClick={(e) => {
          e.preventDefault();
          navigate(item.path);
        }}
        style={{ cursor: 'pointer' }}
      >
        {item.label}
      </a>
    ) : (
      item.label
    ),
  }));

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          separator={<RightOutlined style={{ fontSize: 10 }} />}
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Back Button */}
      {showBack && (
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 12, paddingLeft: 0 }}
        >
          Kembali
        </Button>
      )}

      {/* Header Content */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
            {title}
          </Title>

          {/* Description */}
          {description && (
            <Text type="secondary" style={{ fontSize: 16 }}>
              {description}
            </Text>
          )}
        </div>

        {/* Extra Content (Buttons, etc) */}
        {extra && (
          <div style={{ flexShrink: 0 }}>
            {extra}
          </div>
        )}
      </div>

      {/* Divider */}
      <Divider style={{ marginTop: 16, marginBottom: 0 }} />
    </div>
  );
};

export default PageHeader;