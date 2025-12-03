// // pages/shared/ChangePassword.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   Space,
//   message,
//   Typography,
//   Alert,
//   Progress,
// } from 'antd';
// import {
//   ArrowLeftOutlined,
//   LockOutlined,
//   EyeInvisibleOutlined,
//   EyeTwoTone,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
// } from '@ant-design/icons';
// import { useMutation } from '@tanstack/react-query';
// import { useAuthStore } from '../../stores/authStore';
// import { validatePassword } from '../../utils/validation';
// import axiosInstance from '../../api/axios';

// const { Title, Text } = Typography;

// const ChangePassword = () => {
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const [form] = Form.useForm();
//   const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0 });
//   const [newPassword, setNewPassword] = useState('');

//   // Change password mutation
//   const changePasswordMutation = useMutation({
//     mutationFn: async (data) => {
//       const response = await axiosInstance.post('/auth/change-password', data);
//       return response.data;
//     },
//     onSuccess: () => {
//       message.success('Password berhasil diubah');
//       form.resetFields();
//       handleBack();
//     },
//     onError: (error) => {
//       message.error(error.message || 'Gagal mengubah password');
//     },
//   });

//   // Handle password change
//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setNewPassword(value);
    
//     if (value) {
//       const validation = validatePassword(value);
//       setPasswordStrength(validation);
//     } else {
//       setPasswordStrength({ strength: 'none', score: 0 });
//     }
//   };

//   // Get password strength color
//   const getStrengthColor = () => {
//     switch (passwordStrength.strength) {
//       case 'weak':
//         return '#ff4d4f';
//       case 'medium':
//         return '#faad14';
//       case 'strong':
//         return '#52c41a';
//       default:
//         return '#d9d9d9';
//     }
//   };

//   // Get password strength percentage
//   const getStrengthPercent = () => {
//     return (passwordStrength.score / 6) * 100;
//   };

//   // Get password strength text
//   const getStrengthText = () => {
//     switch (passwordStrength.strength) {
//       case 'weak':
//         return 'Lemah';
//       case 'medium':
//         return 'Sedang';
//       case 'strong':
//         return 'Kuat';
//       default:
//         return '';
//     }
//   };

//   // Handle form submit
//   const handleSubmit = async (values) => {
//     await changePasswordMutation.mutateAsync({
//       currentPassword: values.currentPassword,
//       newPassword: values.newPassword,
//     });
//   };

//   // Handle back
//   const handleBack = () => {
//     const role = user?.role?.toLowerCase();
//     navigate(`/${role}/profile`);
//   };

//   // Password requirements
//   const passwordRequirements = [
//     { text: 'Minimal 8 karakter', check: newPassword.length >= 8 },
//     { text: 'Mengandung huruf kecil', check: /[a-z]/.test(newPassword) },
//     { text: 'Mengandung huruf besar', check: /[A-Z]/.test(newPassword) },
//     { text: 'Mengandung angka', check: /\d/.test(newPassword) },
//     { text: 'Mengandung karakter khusus (!@#$%^&*)', check: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
//   ];

//   return (
//     <div>
//       {/* Header */}
//       <div style={{ marginBottom: 24 }}>
//         <div
//           onClick={handleBack}
//           style={{
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: 8,
//             color: '#1890ff',
//             cursor: 'pointer',
//             marginBottom: 16,
//           }}
//         >
//           <ArrowLeftOutlined />
//           <span>Kembali ke Profil</span>
//         </div>

//         <Title level={2} style={{ marginBottom: 8 }}>
//           Ganti Password
//         </Title>
//         <Text type="secondary" style={{ fontSize: 16 }}>
//           Ubah password Anda untuk meningkatkan keamanan akun
//         </Text>
//       </div>

//       <div style={{ maxWidth: 600 }}>
//         {/* Info Alert */}
//         <Alert
//           message="Tips Keamanan Password"
//           description={
//             <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
//               <li>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
//               <li>Minimal 8 karakter, lebih panjang lebih baik</li>
//               <li>Jangan gunakan informasi pribadi yang mudah ditebak</li>
//               <li>Gunakan password yang berbeda untuk setiap akun</li>
//             </ul>
//           }
//           type="info"
//           showIcon
//           style={{ marginBottom: 24 }}
//         />

//         {/* Form Card */}
//         <Card>
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//           >
//             {/* Current Password */}
//             <Form.Item
//               label="Password Lama"
//               name="currentPassword"
//               rules={[
//                 { required: true, message: 'Password lama wajib diisi' },
//               ]}
//             >
//               <Input.Password
//                 prefix={<LockOutlined />}
//                 placeholder="Masukkan password lama"
//                 size="large"
//                 iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
//               />
//             </Form.Item>

//             {/* New Password */}
//             <Form.Item
//               label="Password Baru"
//               name="newPassword"
//               rules={[
//                 { required: true, message: 'Password baru wajib diisi' },
//                 { min: 8, message: 'Password minimal 8 karakter' },
//                 {
//                   validator: (_, value) => {
//                     if (!value) return Promise.resolve();
//                     const validation = validatePassword(value);
//                     if (validation.strength === 'weak') {
//                       return Promise.reject(new Error('Password terlalu lemah'));
//                     }
//                     return Promise.resolve();
//                   },
//                 },
//               ]}
//             >
//               <Input.Password
//                 prefix={<LockOutlined />}
//                 placeholder="Masukkan password baru"
//                 size="large"
//                 onChange={handlePasswordChange}
//                 iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
//               />
//             </Form.Item>

//             {/* Password Strength Indicator */}
//             {newPassword && (
//               <div style={{ marginTop: -16, marginBottom: 24 }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }