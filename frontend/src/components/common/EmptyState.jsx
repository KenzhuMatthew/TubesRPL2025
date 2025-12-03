import React from 'react';
import { Empty, Button } from 'antd';

const EmptyState = ({
  description = 'Tidak ada data',
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText,
  onAction,
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '60px 20px'
    }}>
      <Empty
        image={image}
        description={description}
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;