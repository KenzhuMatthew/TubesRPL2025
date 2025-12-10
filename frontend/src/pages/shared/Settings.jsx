// pages/shared/Settings.jsx
import React, { useState } from 'react';
import {
  Card,
  Form,
  Switch,
  Select,
  Button,
  Space,
  message,
  Typography,
  Divider,
  List,
  Tag,
  Modal,
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import axiosInstance from '../../api/axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  
  // Initial settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    guidanceApproval: true,
    guidanceRejection: true,
    noteAdded: true,
    
    // Preference Settings
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.put('/auth/settings', data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Pengaturan berhasil disimpan');
    },
    onError: (error) => {
      message.error(error.message || 'Gagal menyimpan pengaturan');
    },
  });

  // Handle setting change
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    await updateSettingsMutation.mutateAsync(settings);
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Hapus Akun',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.
          </Paragraph>
          <Paragraph strong style={{ color: '#ff4d4f' }}>
            Semua data Anda akan dihapus secara permanen.
          </Paragraph>
        </div>
      ),
      okText: 'Hapus Akun',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosInstance.delete('/auth/account');
          message.success('Akun berhasil dihapus');
          // Logout and redirect
          window.location.href = '/login';
        } catch (error) {
          message.error('Gagal menghapus akun');
        }
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Pengaturan
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Kelola preferensi dan pengaturan akun Anda
        </Text>
      </div>

      <div style={{ maxWidth: 800 }}>
        {/* Notification Settings */}
        <Card 
          title={
            <Space>
              <BellOutlined />
              <span>Notifikasi</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <List>
            <List.Item>
              <List.Item.Meta
                title="Notifikasi Email"
                description="Terima notifikasi melalui email"
                avatar={<MailOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
              />
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Notifikasi Push"
                description="Terima notifikasi push di browser"
                avatar={<MobileOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
              />
              <Switch
                checked={settings.pushNotifications}
                onChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </List.Item>

            <Divider style={{ margin: '12px 0' }} />

            <List.Item>
              <List.Item.Meta
                title="Pengingat Sesi Bimbingan"
                description="Ingatkan saya sebelum sesi bimbingan dimulai"
              />
              <Switch
                checked={settings.sessionReminders}
                onChange={(checked) => handleSettingChange('sessionReminders', checked)}
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Persetujuan Bimbingan"
                description="Notifikasi saat bimbingan disetujui"
              />
              <Switch
                checked={settings.guidanceApproval}
                onChange={(checked) => handleSettingChange('guidanceApproval', checked)}
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Penolakan Bimbingan"
                description="Notifikasi saat bimbingan ditolak"
              />
              <Switch
                checked={settings.guidanceRejection}
                onChange={(checked) => handleSettingChange('guidanceRejection', checked)}
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Catatan Bimbingan"
                description="Notifikasi saat dosen menambahkan catatan"
              />
              <Switch
                checked={settings.noteAdded}
                onChange={(checked) => handleSettingChange('noteAdded', checked)}
              />
            </List.Item>
          </List>
        </Card>

        {/* Preference Settings */}
        <Card 
          title={
            <Space>
              <GlobalOutlined />
              <span>Preferensi</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Form layout="vertical">
            <Form.Item label="Bahasa">
              <Select
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                style={{ width: '100%' }}
              >
                <Option value="id">
                  <Space>
                    🇮🇩 Bahasa Indonesia
                  </Space>
                </Option>
                <Option value="en">
                  <Space>
                    🇬🇧 English
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item label="Zona Waktu">
              <Select
                value={settings.timezone}
                onChange={(value) => handleSettingChange('timezone', value)}
                style={{ width: '100%' }}
              >
                <Option value="Asia/Jakarta">WIB - Waktu Indonesia Barat (GMT+7)</Option>
                <Option value="Asia/Makassar">WITA - Waktu Indonesia Tengah (GMT+8)</Option>
                <Option value="Asia/Jayapura">WIT - Waktu Indonesia Timur (GMT+9)</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Format Tanggal">
              <Select
                value={settings.dateFormat}
                onChange={(value) => handleSettingChange('dateFormat', value)}
                style={{ width: '100%' }}
              >
                <Option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>

        {/* Privacy Settings */}
        <Card 
          title={
            <Space>
              <SecurityScanOutlined />
              <span>Privasi</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <List>
            <List.Item>
              <List.Item.Meta
                title="Visibilitas Profil"
                description="Siapa yang dapat melihat profil Anda"
              />
              <Select
                value={settings.profileVisibility}
                onChange={(value) => handleSettingChange('profileVisibility', value)}
                style={{ width: 150 }}
              >
                <Option value="public">Publik</Option>
                <Option value="private">Privat</Option>
              </Select>
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Tampilkan Email"
                description="Email akan terlihat di profil publik"
              />
              <Switch
                checked={settings.showEmail}
                onChange={(checked) => handleSettingChange('showEmail', checked)}
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="Tampilkan Nomor Telepon"
                description="Nomor telepon akan terlihat di profil publik"
              />
              <Switch
                checked={settings.showPhone}
                onChange={(checked) => handleSettingChange('showPhone', checked)}
              />
            </List.Item>
          </List>
        </Card>

        {/* Account Information */}
        <Card 
          title="Informasi Akun"
          style={{ marginBottom: 24 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Status Akun</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Akun Anda saat ini aktif
                </Text>
              </div>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Aktif
              </Tag>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Verifikasi Email</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Email Anda telah terverifikasi
                </Text>
              </div>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Terverifikasi
              </Tag>
            </div>

            {user?.createdAt && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Terdaftar Sejak</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </div>
              </>
            )}
          </Space>
        </Card>

        {/* Save Button */}
        <Card style={{ marginBottom: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSaveSettings}
              loading={updateSettingsMutation.isLoading}
            >
              Simpan Pengaturan
            </Button>
          </Space>
        </Card>

        {/* Danger Zone */}
        <Card 
          title={
            <Text type="danger" strong>
              Zona Berbahaya
            </Text>
          }
          style={{ borderColor: '#ff4d4f' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Hapus Akun</Text>
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 16 }}>
                Setelah menghapus akun, semua data Anda akan dihapus secara permanen. 
                Tindakan ini tidak dapat dibatalkan.
              </Paragraph>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAccount}
              >
                Hapus Akun
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Settings;