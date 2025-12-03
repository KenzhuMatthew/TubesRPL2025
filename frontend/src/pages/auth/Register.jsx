// pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    clearError();
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = values;
    
    // Ensure role is uppercase (backend expects MAHASISWA, DOSEN, not lowercase)
    registerData.role = registerData.role?.toUpperCase();
    
    console.log('Data yang dikirim ke backend:', registerData); // Debug
    
    const result = await register(registerData);

    if (result.success) {
      // Redirect to login after successful registration
      navigate('/login', { 
        state: { message: 'Registrasi berhasil! Silakan login.' } 
      });
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 500,
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Daftar Akun
        </Title>
        <Text type="secondary">
          Buat akun baru untuk menggunakan SIAP Bimbingan
        </Text>
      </div>

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
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        scrollToFirstError
      >
        <Form.Item
          name="nama"
          label="Nama Lengkap"
          rules={[
            { required: true, message: 'Nama lengkap harus diisi' },
            { min: 3, message: 'Nama minimal 3 karakter' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nama Lengkap"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email harus diisi' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="Daftar Sebagai"
          rules={[{ required: true, message: 'Pilih role Anda' }]}
        >
          <Select placeholder="Pilih Role">
            <Option value="MAHASISWA">Mahasiswa</Option>
            <Option value="DOSEN">Dosen</Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
        >
          {({ getFieldValue }) => {
            const role = getFieldValue('role');
            
            if (role === 'MAHASISWA') {
              return (
                <Form.Item
                  name="npm"
                  label="NPM"
                  rules={[
                    { required: true, message: 'NPM harus diisi' },
                    { pattern: /^[0-9]+$/, message: 'NPM harus berupa angka' },
                    { len: 10, message: 'NPM harus 10 digit' },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="2024012345"
                    maxLength={10}
                  />
                </Form.Item>
              );
            }
            
            if (role === 'DOSEN') {
              return (
                <Form.Item
                  name="nip"
                  label="NIP"
                  rules={[
                    { required: true, message: 'NIP harus diisi' },
                    { pattern: /^[0-9]+$/, message: 'NIP harus berupa angka' },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="198012345678901234"
                  />
                </Form.Item>
              );
            }
            
            return null;
          }}
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password harus diisi' },
            { min: 6, message: 'Password minimal 6 karakter' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Minimal 6 karakter"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Konfirmasi Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Konfirmasi password harus diisi' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Password tidak cocok!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Ulangi password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserAddOutlined />}
            block
            style={{ height: 48 }}
          >
            Daftar
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Sudah punya akun?{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>
            Login di sini
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

export default Register;