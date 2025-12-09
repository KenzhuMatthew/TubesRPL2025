import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

export const showConfirmModal = ({
  title = 'Konfirmasi',
  content = 'Apakah Anda yakin?',
  onOk,
  onCancel,
  okText = 'Ya',
  cancelText = 'Batal',
  type = 'confirm', // 'confirm', 'warning', 'info', 'error'
}) => {
  const config = {
    title,
    content,
    okText,
    cancelText,
    onOk,
    onCancel,
    centered: true,
  };

  if (type === 'warning' || type === 'error') {
    config.icon = <ExclamationCircleOutlined />;
    config.okButtonProps = { danger: true };
  }

  return confirm(config);
};

export default showConfirmModal;