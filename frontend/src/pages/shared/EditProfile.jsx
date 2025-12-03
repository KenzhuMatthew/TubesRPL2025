// pages/shared/EditProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Space,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { USER_ROLES } from '../../utils/constants';
import { validateEmail, validatePhone } from '../../utils/validation';
import { getInitials, stringToColor } from '../../utils/helpers';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      // Append avatar if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await axiosInstance.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      message.success('Profil berhasil diupdate');
      updateUser(data.user);
      queryClient.invalidateQueries(['profile']);
      handleBack();
    },
    onError: (error) => {
      message.error(error.message || 'Gagal mengupdate profil');
    },
  });

  // Handle avatar change
  const handleAvatarChange = (info) => {
    const file = info.file;
    
    // Validate file type
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      message.error('File harus berupa gambar!');
      return;
    }
    
    // Validate file size (max 2MB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ukuran gambar maksimal 2MB!');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    await updateMutation.mutateAsync(values);
  };

  // Handle back
  const handleBack = () => {
    const role = user?.role?.toLowerCase();
    navigate(`/${role}/profile`);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          onClick={handleBack}
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
          <span>Kembali ke Profil</span>
        </div>

        <Title level={2} style={{ marginBottom: 8 }}>
          Edit Profil
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Update informasi profil Anda
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Avatar Upload */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={150}
                icon={<UserOutlined />}
                src={avatarPreview}
                style={{
                  backgroundColor: stringToColor(user.name || user.email),
                  fontSize: 60,
                  marginBottom: 24,
                }}
              >
                {!avatarPreview && getInitials(user.name || user.email)}
              </Avatar>

              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} block>
                  Upload Foto Profil
                </Button>
              </Upload>

              <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
                Format: JPG, PNG (max 2MB)
              </Text>
            </div>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: user.name,
                email: user.email,
                phone: user.phone,
                nim: user.nim,
                nidn: user.nidn,
                angkatan: user.angkatan,
                programStudi: user.programStudi,
                fakultas: user.fakultas,
                jabatan: user.jabatan,
                alamat: user.alamat,
              }}
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                {/* Common Fields */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nama Lengkap"
                    name="name"
                    rules={[
                      { required: true, message: 'Nama lengkap wajib diisi' },
                    ]}
                  >
                    <Input placeholder="Masukkan nama lengkap" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Email wajib diisi' },
                      {
                        validator: (_, value) => {
                          if (!value || validateEmail(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Format email tidak valid'));
                        },
                      },
                    ]}
                  >
                    <Input type="email" placeholder="Masukkan email" disabled />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="No. Telepon"
                    name="phone"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || validatePhone(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Format nomor telepon tidak valid'));
                        },
                      },
                    ]}
                  >
                    <Input placeholder="Masukkan nomor telepon" />
                  </Form.Item>
                </Col>

                {/* Student-specific fields */}
                {user.role === USER_ROLES.MAHASISWA && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="NIM" name="nim">
                        <Input placeholder="NIM" disabled />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Angkatan" name="angkatan">
                        <Input placeholder="Masukkan angkatan" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Program Studi" name="programStudi">
                        <Input placeholder="Masukkan program studi" />
                      </Form.Item>
                    </Col>
                  </>
                )}

                {/* Lecturer-specific fields */}
                {user.role === USER_ROLES.DOSEN && (
                  <>
                    <Col xs={24} sm={12}>
                      <Form.Item label="NIDN" name="nidn">
                        <Input placeholder="NIDN" disabled />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Jabatan" name="jabatan">
                        <Input placeholder="Masukkan jabatan" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Fakultas" name="fakultas">
                        <Input placeholder="Masukkan fakultas" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Program Studi" name="programStudi">
                        <Input placeholder="Masukkan program studi" />
                      </Form.Item>
                    </Col>
                  </>
                )}

                {/* Address */}
                <Col xs={24}>
                  <Form.Item label="Alamat" name="alamat">
                    <TextArea
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateMutation.isLoading}
                  >
                    Simpan Perubahan
                  </Button>
                  <Button onClick={handleBack}>
                    Batal
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditProfile;