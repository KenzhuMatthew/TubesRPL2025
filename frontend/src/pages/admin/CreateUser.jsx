// pages/admin/CreateUser.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/admin.api';
import UserForm from '../../components/user/UserForm';

const CreateUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createUser(data),
    onSuccess: () => {
      message.success('Pengguna berhasil ditambahkan');
      queryClient.invalidateQueries(['users']);
      navigate('/admin/users');
    },
    onError: (error) => {
      message.error(error.message || 'Gagal menambahkan pengguna');
    },
  });

  const handleSubmit = async (values) => {
    await createMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          onClick={handleCancel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#1890ff',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <ArrowLeftOutlined />
          <span>Kembali ke Daftar Pengguna</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          Tambah Pengguna Baru
        </h1>
        <p style={{ color: '#8c8c8c', marginBottom: 0 }}>
          Tambahkan pengguna baru ke dalam sistem
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createMutation.isLoading}
          isEdit={false}
        />
      </Card>
    </div>
  );
};

export default CreateUser;