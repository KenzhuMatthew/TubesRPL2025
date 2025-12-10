// pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();
  
  // Get success message from navigation state
  const successMessage = location.state?.message;

  const handleSubmit = async (values) => {
    clearError();
    const result = await login(values.email, values.password);

    if (result.success) {
      const user = useAuthStore.getState().user;
      // Redirect based on role
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (user?.role === 'DOSEN') {
        navigate('/dosen');
      } else if (user?.role === 'MAHASISWA') {
        navigate('/mahasiswa');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 450,
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          SIAP Bimbingan
        </Title>
        <Text type="secondary">
          Sistem Manajemen Bimbingan Tugas Akhir
        </Text>
      </div>

      {successMessage && (
        <Alert
          message={successMessage}
          type="success"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email harus diisi' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email Anda"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password harus diisi' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password Anda"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LoginOutlined />}
            block
            style={{ height: 48 }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Belum punya akun?{' '}
          <Link to="/register" style={{ fontWeight: 500 }}>
            Daftar di sini
          </Link>
        </Text>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          © 2025 Universitas Katolik Parahyangan
        </Text>
      </div>
    </Card>
  );
};

export default Login;