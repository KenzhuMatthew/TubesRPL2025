import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading = ({ size = 'large', tip = 'Memuat...', fullScreen = false }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin indicator={antIcon} size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '50px 0'
    }}>
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default Loading;