// controllers/admin.controller.js - Admin Controller (PostgreSQL Native)
const db = require('../config/database');
const bcrypt = require('bcrypt');
const importService = require('../services/import.service');

// ===== USER MANAGEMENT =====

// Get all users with pagination
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      whereClause += ` AND u.role = $${paramCount++}`;
      params.push(role);
    }

    if (search) {
      whereClause += ` AND (
        u.email ILIKE $${paramCount} OR
        d.nama ILIKE $${paramCount} OR
        m.nama ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    params.push(parseInt(limit), offset);

    const usersResult = await db.query(
      `SELECT 
        u.id, u.email, u.role, u.is_active, u.created_at,
        d.id as dosen_id, d.nip, d.nama as dosen_nama, d.email as dosen_email, d.phone as dosen_phone,
        m.id as mahasiswa_id, m.npm, m.nama as mahasiswa_nama, m.email as mahasiswa_email, 
        m.phone as mahasiswa_phone, m.angkatan
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) as count
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       ${whereClause}`,
      params.slice(0, paramCount - 2)
    );

    const total = parseInt(totalResult.rows[0].count);

    // Format users with profile
    const users = usersResult.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      dosen: user.dosen_id ? {
        id: user.dosen_id,
        nip: user.nip,
        nama: user.dosen_nama,
        email: user.dosen_email,
        phone: user.dosen_phone
      } : null,
      mahasiswa: user.mahasiswa_id ? {
        id: user.mahasiswa_id,
        npm: user.npm,
        nama: user.mahasiswa_nama,
        email: user.mahasiswa_email,
        phone: user.mahasiswa_phone,
        angkatan: user.angkatan
      } : null
    }));

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.query(
      `SELECT 
        u.*,
        d.id as dosen_id, d.nip, d.nama as dosen_nama, d.email as dosen_email, d.phone as dosen_phone,
        m.id as mahasiswa_id, m.npm, m.nama as mahasiswa_nama, m.email as mahasiswa_email, 
        m.phone as mahasiswa_phone, m.angkatan
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      dosen: user.dosen_id ? {
        id: user.dosen_id,
        nip: user.nip,
        nama: user.dosen_nama,
        email: user.dosen_email,
        phone: user.dosen_phone
      } : null,
      mahasiswa: user.mahasiswa_id ? {
        id: user.mahasiswa_id,
        npm: user.npm,
        nama: user.mahasiswa_nama,
        email: user.mahasiswa_email,
        phone: user.mahasiswa_phone,
        angkatan: user.angkatan
      } : null
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { email, password, role, nama, nip, npm, phone, angkatan } = req.body;

    // Validation
    if (!email || !password || !role || !nama) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Check if email already exists
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
       RETURNING *`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    // Create profile based on role
    if (role === 'DOSEN') {
      await client.query(
        `INSERT INTO dosen (user_id, nip, nama, email, phone)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, nip || `NIP${Date.now()}`, nama, email, phone || null]
      );
    } else if (role === 'MAHASISWA') {
      await client.query(
        `INSERT INTO mahasiswa (user_id, npm, nama, email, phone, angkatan)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, npm || `NPM${Date.now()}`, nama, email, phone || null, angkatan || new Date().getFullYear()]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;
    const { email, nama, nip, npm, phone, angkatan } = req.body;

    // Get user with profile
    const userResult = await client.query(
      `SELECT u.*, d.id as dosen_id, m.id as mahasiswa_id
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = userResult.rows[0];

    await client.query('BEGIN');

    // Update user email if provided
    if (email && email !== user.email) {
      // Check if new email already exists
      const emailExistsResult = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (emailExistsResult.rows.length > 0) {
        return res.status(400).json({ message: 'Email sudah digunakan' });
      }

      await client.query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [email, id]
      );
    }

    // Update profile based on role
    if (user.role === 'DOSEN' && user.dosen_id) {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (nama) {
        updateFields.push(`nama = $${paramCount++}`);
        values.push(nama);
      }
      if (nip) {
        updateFields.push(`nip = $${paramCount++}`);
        values.push(nip);
      }
      if (email) {
        updateFields.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        updateFields.push(`phone = $${paramCount++}`);
        values.push(phone);
      }

      if (updateFields.length > 0) {
        values.push(user.dosen_id);
        await client.query(
          `UPDATE dosen SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }
    } else if (user.role === 'MAHASISWA' && user.mahasiswa_id) {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (nama) {
        updateFields.push(`nama = $${paramCount++}`);
        values.push(nama);
      }
      if (npm) {
        updateFields.push(`npm = $${paramCount++}`);
        values.push(npm);
      }
      if (email) {
        updateFields.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        updateFields.push(`phone = $${paramCount++}`);
        values.push(phone);
      }
      if (angkatan) {
        updateFields.push(`angkatan = $${paramCount++}`);
        values.push(angkatan);
      }

      if (updateFields.length > 0) {
        values.push(user.mahasiswa_id);
        await client.query(
          `UPDATE mahasiswa SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }
    }

    await client.query('COMMIT');

    // Get updated user
    const updatedUserResult = await client.query(
      `SELECT 
        u.*,
        d.id as dosen_id, d.nip, d.nama as dosen_nama, d.email as dosen_email, d.phone as dosen_phone,
        m.id as mahasiswa_id, m.npm, m.nama as mahasiswa_nama, m.email as mahasiswa_email, 
        m.phone as mahasiswa_phone, m.angkatan
       FROM users u
       LEFT JOIN dosen d ON u.id = d.user_id
       LEFT JOIN mahasiswa m ON u.id = m.user_id
       WHERE u.id = $1`,
      [id]
    );

    res.json({
      message: 'User berhasil diupdate',
      user: updatedUserResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting own account
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'Status isActive harus disediakan' });
    }

    const userResult = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({
      message: `User berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const defaultPassword = 'password123';

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
      [passwordHash, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({
      message: 'Password berhasil direset',
      newPassword: defaultPassword,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== DATA IMPORT =====

exports.importDosenSchedules = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const { semester } = req.body;
    const result = await importService.importDosenSchedules(req.file, semester);

    res.json(result);
  } catch (error) {
    console.error('Import schedules error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat import data' });
  }
};

exports.importStudentData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const { semester } = req.body;
    const result = await importService.importStudentData(req.file, semester);

    res.json(result);
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat import data' });
  }
};

exports.importThesisProjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const { semester } = req.body;
    const result = await importService.importThesisProjects(req.file, semester);

    res.json(result);
  } catch (error) {
    console.error('Import thesis projects error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat import data' });
  }
};

// ===== MONITORING & REPORTS =====

exports.getDashboardStats = async (req, res) => {
  try {
    const statsResult = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM dosen) as total_dosen,
        (SELECT COUNT(*) FROM mahasiswa) as total_mahasiswa,
        (SELECT COUNT(*) FROM guidance_sessions) as total_sessions,
        (SELECT COUNT(*) FROM guidance_sessions WHERE status = 'PENDING') as pending_sessions,
        (SELECT COUNT(*) FROM guidance_sessions WHERE status = 'COMPLETED') as completed_sessions`
    );

    const stats = statsResult.rows[0];

    res.json({
      totalUsers: parseInt(stats.total_users),
      totalDosen: parseInt(stats.total_dosen),
      totalMahasiswa: parseInt(stats.total_mahasiswa),
      totalSessions: parseInt(stats.total_sessions),
      pendingSessions: parseInt(stats.pending_sessions),
      completedSessions: parseInt(stats.completed_sessions),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getMonitoringReport = async (req, res) => {
  try {
    const { semester, type } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (semester) {
      whereClause += ` AND tp.semester = $${paramCount++}`;
      params.push(semester);
    }
    if (type) {
      whereClause += ` AND tp.tipe = $${paramCount++}`;
      params.push(type);
    }

    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    params.push(utsDate, uasDate);

    const reportResult = await db.query(
      `SELECT 
        tp.id, tp.judul, tp.tipe, tp.semester,
        m.npm, m.nama as mahasiswa_nama,
        string_agg(d.nama, ', ' ORDER BY ts.supervisor_order) as dosen_names,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED') as total_guidance,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $${paramCount++}) as before_uts,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $${paramCount++}) as before_uas
       FROM thesis_projects tp
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       LEFT JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       LEFT JOIN dosen d ON ts.dosen_id = d.id
       LEFT JOIN guidance_sessions gs ON tp.id = gs.thesis_project_id
       ${whereClause}
       GROUP BY tp.id, m.id
       ORDER BY m.npm`,
      params
    );

    const report = reportResult.rows.map(project => {
      const requiredBeforeUTS = project.tipe === 'TA1' ? 4 : 4;
      const requiredBeforeUAS = project.tipe === 'TA1' ? 4 : 4;
      const beforeUTS = parseInt(project.before_uts);
      const beforeUAS = parseInt(project.before_uas);

      return {
        npm: project.npm,
        nama: project.mahasiswa_nama,
        type: project.tipe,
        judul: project.judul,
        dosen: project.dosen_names || '-',
        totalGuidance: parseInt(project.total_guidance),
        beforeUTS,
        beforeUAS,
        requiredBeforeUTS,
        requiredBeforeUAS,
        meetsRequirement: beforeUTS >= requiredBeforeUTS && beforeUAS >= requiredBeforeUAS,
      };
    });

    const summary = {
      totalStudents: report.length,
      meetingRequirements: report.filter(r => r.meetsRequirement).length,
      notMeetingRequirements: report.filter(r => !r.meetsRequirement).length,
    };

    res.json({ summary, students: report });
  } catch (error) {
    console.error('Get monitoring report error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getStudentsNotMeetingRequirements = async (req, res) => {
  try {
    const { semester, type } = req.query;

    let whereClause = "WHERE tp.status = 'ACTIVE'";
    const params = [];
    let paramCount = 1;

    if (semester) {
      whereClause += ` AND tp.semester = $${paramCount++}`;
      params.push(semester);
    }
    if (type) {
      whereClause += ` AND tp.tipe = $${paramCount++}`;
      params.push(type);
    }

    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    params.push(utsDate, uasDate);

    const reportResult = await db.query(
      `SELECT 
        tp.tipe,
        m.npm, m.nama as mahasiswa_nama,
        string_agg(d.nama, ', ' ORDER BY ts.supervisor_order) as dosen_names,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $${paramCount++}) as before_uts,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $${paramCount++}) as before_uas
       FROM thesis_projects tp
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       LEFT JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       LEFT JOIN dosen d ON ts.dosen_id = d.id
       LEFT JOIN guidance_sessions gs ON tp.id = gs.thesis_project_id
       ${whereClause}
       GROUP BY tp.id, tp.tipe, m.id
       ORDER BY m.npm`,
      params
    );

    const notMeeting = reportResult.rows
      .map(project => {
        const requiredBeforeUTS = project.tipe === 'TA1' ? 4 : 4;
        const requiredBeforeUAS = project.tipe === 'TA1' ? 4 : 4;
        const beforeUTS = parseInt(project.before_uts);
        const beforeUAS = parseInt(project.before_uas);

        return {
          npm: project.npm,
          nama: project.mahasiswa_nama,
          type: project.tipe,
          dosen: project.dosen_names || '-',
          beforeUTS,
          beforeUAS,
          requiredBeforeUTS,
          requiredBeforeUAS,
          meetsRequirement: beforeUTS >= requiredBeforeUTS && beforeUAS >= requiredBeforeUAS,
        };
      })
      .filter(student => !student.meetsRequirement);

    res.json({ students: notMeeting });
  } catch (error) {
    console.error('Get students not meeting requirements error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.exportMonitoringReport = async (req, res) => {
  try {
    // Implementation for export to Excel/CSV
    res.json({ message: 'Export feature coming soon' });
  } catch (error) {
    console.error('Export monitoring report error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== ACADEMIC PERIOD MANAGEMENT =====

exports.getAcademicPeriods = async (req, res) => {
  try {
    const periodsResult = await db.query(
      'SELECT * FROM academic_periods ORDER BY start_date DESC'
    );

    res.json({ periods: periodsResult.rows });
  } catch (error) {
    console.error('Get academic periods error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getActivePeriod = async (req, res) => {
  try {
    const periodResult = await db.query(
      'SELECT * FROM academic_periods WHERE is_active = true LIMIT 1'
    );

    if (periodResult.rows.length === 0) {
      return res.status(404).json({ message: 'Periode akademik aktif tidak ditemukan' });
    }

    res.json(periodResult.rows[0]);
  } catch (error) {
    console.error('Get active period error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.createAcademicPeriod = async (req, res) => {
  try {
    const { semester, startDate, endDate, utsDate, uasDate } = req.body;

    if (!semester || !startDate || !endDate || !utsDate || !uasDate) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const periodResult = await db.query(
      `INSERT INTO academic_periods (semester, start_date, end_date, uts_date, uas_date, is_active)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [semester, new Date(startDate), new Date(endDate), new Date(utsDate), new Date(uasDate)]
    );

    res.status(201).json({
      message: 'Periode akademik berhasil dibuat',
      period: periodResult.rows[0],
    });
  } catch (error) {
    console.error('Create academic period error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateAcademicPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, startDate, endDate, utsDate, uasDate } = req.body;

    const periodResult = await db.query(
      `UPDATE academic_periods 
       SET semester = $1, start_date = $2, end_date = $3, uts_date = $4, uas_date = $5
       WHERE id = $6
       RETURNING *`,
      [semester, new Date(startDate), new Date(endDate), new Date(utsDate), new Date(uasDate), id]
    );

    if (periodResult.rows.length === 0) {
      return res.status(404).json({ message: 'Periode akademik tidak ditemukan' });
    }

    res.json({
      message: 'Periode akademik berhasil diupdate',
      period: periodResult.rows[0],
    });
  } catch (error) {
    console.error('Update academic period error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.setActivePeriod = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Deactivate all periods
    await client.query('UPDATE academic_periods SET is_active = false');

    // Activate selected period
    const periodResult = await client.query(
      'UPDATE academic_periods SET is_active = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (periodResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Periode akademik tidak ditemukan' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Periode akademik aktif berhasil diubah',
      period: periodResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Set active period error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

exports.deleteAcademicPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM academic_periods WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Periode akademik tidak ditemukan' });
    }

    res.json({ message: 'Periode akademik berhasil dihapus' });
  } catch (error) {
    console.error('Delete academic period error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== ROOM MANAGEMENT =====

exports.getRooms = async (req, res) => {
  try {
    const roomsResult = await db.query(
      'SELECT * FROM rooms ORDER BY name ASC'
    );

    res.json({ rooms: roomsResult.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, building, capacity } = req.body;

    if (!name || !building) {
      return res.status(400).json({ message: 'Nama ruangan dan gedung harus diisi' });
    }

    const roomResult = await db.query(
      `INSERT INTO rooms (name, building, capacity, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [name, building, capacity || null]
    );

    res.status(201).json({
      message: 'Ruangan berhasil ditambahkan',
      room: roomResult.rows[0],
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, building, capacity, isActive } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = ${paramCount++}`);
      values.push(name);
    }
    if (building) {
      updateFields.push(`building = ${paramCount++}`);
      values.push(building);
    }
    if (capacity !== undefined) {
      updateFields.push(`capacity = ${paramCount++}`);
      values.push(capacity);
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = ${paramCount++}`);
      values.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const roomResult = await db.query(
      `UPDATE rooms 
       SET ${updateFields.join(', ')}
       WHERE id = ${paramCount}
       RETURNING *`,
      values
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    res.json({
      message: 'Ruangan berhasil diupdate',
      room: roomResult.rows[0],
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM rooms WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    res.json({ message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};