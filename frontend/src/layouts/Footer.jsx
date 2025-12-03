import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fff' }}>
      Sistem Manajemen Bimbingan Tugas Akhir ©{new Date().getFullYear()}
    </AntFooter>
  );
};

export default Footer;