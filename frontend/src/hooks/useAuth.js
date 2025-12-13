import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, login, logout } = useAuthStore();

  const handleLogin = async (credentials) => {
    const result = await login(credentials.email, credentials.password);
    if (result.success) {
      message.success('Login berhasil!');
      // Navigate based on role
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'DOSEN') navigate('/dosen');
      else if (user?.role === 'MAHASISWA') navigate('/mahasiswa');
    } else {
      message.error(result.message || 'Login gagal');
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    message.success('Logout berhasil');
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };
};
