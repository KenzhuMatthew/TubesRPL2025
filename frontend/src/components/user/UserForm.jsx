import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { USER_ROLES } from '../../utils/constants';
import { validateEmail, validateNPM, validateNIDN } from '../../utils/validation';

const { Option } = Select;

const UserForm = ({ initialValues, onSubmit, onCancel, loading, isEdit = false }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      // Map data dari backend ke format form
      const formData = {
        role: initialValues.role,
        name: initialValues.dosen?.nama || initialValues.mahasiswa?.nama || initialValues.name,
        email: initialValues.email,
        phone: initialValues.dosen?.phone || initialValues.mahasiswa?.phone,
        nidn: initialValues.dosen?.nip,
        npm: initialValues.mahasiswa?.npm,
        angkatan: initialValues.mahasiswa?.angkatan,
      };
      form.setFieldsValue(formData);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      // Format data sesuai dengan yang diharapkan backend
      const submitData = {
        email: values.email,
        nama: values.name,
        phone: values.phone,
        ...(values.role === USER_ROLES.DOSEN && { nip: values.nidn }),
        ...(values.role === USER_ROLES.MAHASISWA && { 
          npm: values.npm,
          angkatan: values.angkatan 
        }),
        ...(!isEdit && { 
          password: values.password,
          role: values.role 
        })
      };
      
      await onSubmit(submitData);
      if (!isEdit) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleRoleChange = (role) => {
    // Clear role-specific fields when role changes
    if (role === USER_ROLES.DOSEN) {
      form.setFieldsValue({ npm: undefined, angkatan: undefined });
    } else if (role === USER_ROLES.MAHASISWA) {
      form.setFieldsValue({ nidn: undefined });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        label="Role"
        name="role"
        rules={[{ required: true, message: 'Role harus dipilih' }]}
      >
        <Select 
          placeholder="Pilih role" 
          onChange={handleRoleChange}
          disabled={isEdit}
        >
          <Option value={USER_ROLES.ADMIN}>Admin</Option>
          <Option value={USER_ROLES.DOSEN}>Dosen</Option>
          <Option value={USER_ROLES.MAHASISWA}>Mahasiswa</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Nama Lengkap"
        name="name"
        rules={[{ required: true, message: 'Nama lengkap harus diisi' }]}
      >
        <Input placeholder="Masukkan nama lengkap" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Email harus diisi' },
          { 
            validator: (_, value) => {
              if (!value || validateEmail(value)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Format email tidak valid'));
            }
          }
        ]}
      >
        <Input type="email" placeholder="Masukkan email" />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
      >
        {({ getFieldValue }) => {
          const role = getFieldValue('role');
          
          if (role === USER_ROLES.DOSEN) {
            return (
              <Form.Item
                label="NIDN"
                name="nidn"
                rules={[
                  { required: true, message: 'NIDN harus diisi' },
                  {
                    validator: (_, value) => {
                      if (!value || validateNIDN(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('NIDN harus 10 digit angka'));
                    }
                  }
                ]}
              >
                <Input placeholder="Masukkan NIDN (10 digit)" maxLength={10} />
              </Form.Item>
            );
          }
          
          if (role === USER_ROLES.MAHASISWA) {
            return (
              <>
                <Form.Item
                  label="NPM"
                  name="npm"
                  rules={[
                    { required: true, message: 'NPM harus diisi' },
                    {
                      validator: (_, value) => {
                        if (!value || validateNPM(value)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('NPM harus 10 digit angka'));
                      }
                    }
                  ]}
                >
                  <Input placeholder="Masukkan NPM (10 digit)" maxLength={10} />
                </Form.Item>
                
                <Form.Item
                  label="Angkatan"
                  name="angkatan"
                  rules={[{ required: true, message: 'Angkatan harus diisi' }]}
                >
                  <Input 
                    type="number" 
                    placeholder="Masukkan angkatan (contoh: 2023)" 
                    min={2000}
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Item>
              </>
            );
          }
          
          return null;
        }}
      </Form.Item>

      {!isEdit && (
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Password harus diisi' },
            { min: 8, message: 'Password minimal 8 karakter' }
          ]}
        >
          <Input.Password placeholder="Masukkan password" />
        </Form.Item>
      )}

      <Form.Item
        label="No. Telepon"
        name="phone"
      >
        <Input placeholder="Masukkan nomor telepon" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Update' : 'Tambah'} Pengguna
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
              Batal
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default UserForm;