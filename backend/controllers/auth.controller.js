// controllers/auth.controller.js (PostgreSQL Native)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return { accessToken, refreshToken };
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // Find user with profile
    const userResult = await db.query(
      `SELECT 
        u.*,
        d.id as dosen_id, d.nip, d.nama as dosen_nama, d.email as dosen_email, d.phone as dosen_phone,
        m.id as mahasiswa_id, m.npm, m.nama as mahasiswa_nama, m.email as mahasiswa_email, 
        m.phone as mahasiswa_phone, m.angkatan
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Akun tidak aktif' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Get user profile data
    let profile = null;
    if (user.role === 'DOSEN' && user.dosen_id) {
      profile = {
        id: user.dosen_id,
        nip: user.nip,
        nama: user.dosen_nama,
        email: user.dosen_email,
        phone: user.dosen_phone
      };
    } else if (user.role === 'MAHASISWA' && user.mahasiswa_id) {
      profile = {
        id: user.mahasiswa_id,
        npm: user.npm,
        nama: user.mahasiswa_nama,
        email: user.mahasiswa_email,
        phone: user.mahasiswa_phone,
        angkatan: user.angkatan
      };
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Register (untuk testing, production harus lewat admin)
exports.register = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { email, password, role, nama, npm, nip } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Check existing user
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, email, role`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    // Create profile based on role
    if (role === 'DOSEN') {
      await client.query(
        `INSERT INTO dosen (user_id, nip, nama, email)
         VALUES ($1, $2, $3, $4)`,
        [user.id, nip || `NIP${Date.now()}`, nama || 'Dosen', email]
      );
    } else if (role === 'MAHASISWA') {
      await client.query(
        `INSERT INTO mahasiswa (user_id, npm, nama, email, angkatan)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, npm || `NPM${Date.now()}`, nama || 'Mahasiswa', email, 2024]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token harus disediakan' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Get user
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ message: 'User tidak valid' });
    }

    const user = userResult.rows[0];

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Refresh token tidak valid' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In production, add token to blacklist
    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userResult = await db.query(
      `SELECT 
        u.id, u.email, u.role, u.is_active,
        d.id as dosen_id, d.nip, d.nama as dosen_nama, d.email as dosen_email, d.phone as dosen_phone,
        m.id as mahasiswa_id, m.npm, m.nama as mahasiswa_nama, m.email as mahasiswa_email, 
        m.phone as mahasiswa_phone, m.angkatan
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = userResult.rows[0];

    let profile = null;
    if (user.role === 'DOSEN' && user.dosen_id) {
      profile = {
        id: user.dosen_id,
        nip: user.nip,
        nama: user.dosen_nama,
        email: user.dosen_email,
        phone: user.dosen_phone
      };
    } else if (user.role === 'MAHASISWA' && user.mahasiswa_id) {
      profile = {
        id: user.mahasiswa_id,
        npm: user.npm,
        nama: user.mahasiswa_nama,
        email: user.mahasiswa_email,
        phone: user.mahasiswa_phone,
        angkatan: user.angkatan
      };
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan baru harus diisi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    // Get user
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, req.user.id]
    );

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};