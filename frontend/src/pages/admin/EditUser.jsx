// pages/admin/EditUser.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, message, Skeleton } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/admin.api';
import UserForm from '../../components/user/UserForm';
import EmptyState from '../../components/common/EmptyState';

const EditUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: !!userId,
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateUser(userId, data),
    onSuccess: () => {
      message.success('Pengguna berhasil diupdate');
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', userId]);
      navigate('/admin/users');
    },
    onError: (error) => {
      message.error(error.message || 'Gagal mengupdate pengguna');
    },
  });

  const handleSubmit = async (values) => {
    await updateMutation.mutateAsync(values);
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <Skeleton.Input style={{ width: 200 }} active />
          <Skeleton active paragraph={{ rows: 1 }} />
        </div>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div>
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
        </div>
        <Card>
          <EmptyState
            description="Pengguna tidak ditemukan"
            actionText="Kembali"
            onAction={handleCancel}
          />
        </Card>
      </div>
    );
  }

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
          Edit Pengguna
        </h1>
        <p style={{ color: '#8c8c8c', marginBottom: 0 }}>
          Update informasi pengguna {userData.name}
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <UserForm
          initialValues={userData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateMutation.isLoading}
          isEdit={true}
        />
      </Card>
    </div>
  );
};

export default EditUser;