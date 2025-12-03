// controllers/mahasiswa.controller.js - Mahasiswa Specific Controller (PostgreSQL Native)
const db = require('../config/database');
const notificationService = require('../services/notification.service');

// Get mahasiswa dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const mahasiswaResult = await db.query(
      'SELECT * FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.json({
        stats: {
          totalGuidance: 0,
          pendingSessions: 0,
          beforeUTS: 0,
          beforeUAS: 0,
        },
        upcomingSessions: [],
        hasThesisProject: false,
      });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Get active thesis project
    const projectResult = await db.query(
      `SELECT tp.* FROM thesis_projects tp
       WHERE tp.mahasiswa_id = $1 AND tp.status = 'ACTIVE'
       LIMIT 1`,
      [mahasiswa.id]
    );

    if (projectResult.rows.length === 0) {
      return res.json({
        stats: {
          totalGuidance: 0,
          pendingSessions: 0,
          beforeUTS: 0,
          beforeUAS: 0,
        },
        upcomingSessions: [],
        hasThesisProject: false,
      });
    }

    const project = projectResult.rows[0];

    // Calculate stats
    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    const statsResult = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as total_guidance,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_sessions,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND scheduled_date < $2) as before_uts,
        COUNT(*) FILTER (WHERE status = 'COMPLETED' AND scheduled_date < $3) as before_uas
       FROM guidance_sessions
       WHERE thesis_project_id = $1`,
      [project.id, utsDate, uasDate]
    );

    const stats = statsResult.rows[0];

    // Get upcoming sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingResult = await db.query(
      `SELECT 
        gs.*,
        tp.judul, tp.tipe,
        json_agg(
          json_build_object(
            'id', d.id,
            'nama', d.nama,
            'nip', d.nip,
            'email', d.email,
            'supervisor_order', ts.supervisor_order
          ) ORDER BY ts.supervisor_order
        ) as supervisors
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE gs.thesis_project_id = $1
       AND gs.scheduled_date >= $2
       AND gs.status IN ('PENDING', 'APPROVED')
       GROUP BY gs.id, tp.id
       ORDER BY gs.scheduled_date ASC, gs.start_time ASC
       LIMIT 5`,
      [project.id, today]
    );

    // Get supervisors
    const supervisorsResult = await db.query(
      `SELECT d.*, ts.supervisor_order
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE ts.thesis_project_id = $1
       ORDER BY ts.supervisor_order`,
      [project.id]
    );

    res.json({
      stats: {
        totalGuidance: parseInt(stats.total_guidance || 0),
        pendingSessions: parseInt(stats.pending_sessions || 0),
        beforeUTS: parseInt(stats.before_uts || 0),
        beforeUAS: parseInt(stats.before_uas || 0),
      },
      upcomingSessions: upcomingResult.rows,
      thesisProject: {
        id: project.id,
        judul: project.judul,
        tipe: project.tipe,
        supervisors: supervisorsResult.rows,
      },
      hasThesisProject: true,
    });
  } catch (error) {
    console.error('Get mahasiswa dashboard error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get supervisors
exports.getSupervisors = async (req, res) => {
  try {
    const mahasiswaResult = await db.query(
      'SELECT * FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Get active thesis project with supervisors
    const projectResult = await db.query(
      `SELECT tp.id FROM thesis_projects tp
       WHERE tp.mahasiswa_id = $1 AND tp.status = 'ACTIVE'
       LIMIT 1`,
      [mahasiswa.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data tugas akhir tidak ditemukan' });
    }

    const project = projectResult.rows[0];

    // Get supervisors
    const supervisorsResult = await db.query(
      `SELECT 
        d.id,
        d.user_id,
        d.nip,
        d.nama,
        d.email,
        d.phone,
        ts.supervisor_order
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE ts.thesis_project_id = $1
       ORDER BY ts.supervisor_order ASC`,
      [project.id]
    );

    res.json({ supervisors: supervisorsResult.rows });
  } catch (error) {
    console.error('Get supervisors error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get session detail
exports.getSessionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get session with related data
    const sessionResult = await db.query(
      `SELECT 
        gs.*,
        tp.id as thesis_project_id, tp.judul, tp.tipe, tp.mahasiswa_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       WHERE gs.id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

    // Check if user is authorized to view this session
    const mahasiswaResult = await db.query(
      'SELECT id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke sesi ini' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    if (session.mahasiswa_id !== mahasiswa.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke sesi ini' });
    }

    // Get mahasiswa data
    const mahasiswaDataResult = await db.query(
      'SELECT id, npm, nama, email, phone, angkatan FROM mahasiswa WHERE id = $1',
      [session.mahasiswa_id]
    );

    // Get supervisors
    const supervisorsResult = await db.query(
      `SELECT d.*, ts.supervisor_order
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE ts.thesis_project_id = $1
       ORDER BY ts.supervisor_order`,
      [session.thesis_project_id]
    );

    // Get notes
    const notesResult = await db.query(
      `SELECT gn.*, d.nama as dosen_nama, d.nip
       FROM guidance_notes gn
       JOIN dosen d ON gn.dosen_id = d.id
       WHERE gn.session_id = $1
       ORDER BY gn.created_at DESC`,
      [id]
    );

    // Construct response
    const response = {
      ...session,
      thesisProject: {
        id: session.thesis_project_id,
        judul: session.judul,
        tipe: session.tipe,
        mahasiswa: mahasiswaDataResult.rows[0],
        supervisors: supervisorsResult.rows,
      },
      notes: notesResult.rows,
    };

    // Clean up duplicate fields
    delete response.thesis_project_id;
    delete response.mahasiswa_id;
    delete response.judul;
    delete response.tipe;

    res.json({ session: response });
  } catch (error) {
    console.error('Get session detail error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update session request
exports.updateSessionRequest = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;
    const { scheduledDate, timeSlotId, notes } = req.body;

    // Get the session
    const sessionResult = await client.query(
      `SELECT gs.*, tp.mahasiswa_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       WHERE gs.id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

    // Check if session is still pending
    if (session.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Hanya sesi dengan status pending yang dapat diubah',
      });
    }

    // Verify ownership
    const mahasiswaResult = await client.query(
      'SELECT id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(403).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    if (session.mahasiswa_id !== mahasiswa.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke sesi ini' });
    }

    await client.query('BEGIN');

    // Prepare update data
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (scheduledDate) {
      updateFields.push(`scheduled_date = $${paramCount++}`);
      values.push(scheduledDate);
    }

    if (timeSlotId) {
      // Get new time slot details
      const availResult = await client.query(
        'SELECT * FROM dosen_availabilities WHERE id = $1',
        [timeSlotId]
      );
      
      if (availResult.rows.length > 0) {
        const availability = availResult.rows[0];
        updateFields.push(`start_time = $${paramCount++}`);
        values.push(availability.start_time);
        updateFields.push(`end_time = $${paramCount++}`);
        values.push(availability.end_time);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const updatedSessionResult = await client.query(
      `UPDATE guidance_sessions 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const updatedSession = updatedSessionResult.rows[0];

    // Get supervisors for notification
    const supervisorsResult = await client.query(
      `SELECT d.user_id, d.nama, m.nama as mahasiswa_nama
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       JOIN thesis_projects tp ON ts.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       WHERE ts.thesis_project_id = $1`,
      [session.thesis_project_id]
    );

    await client.query('COMMIT');

    // Send notification to dosen(s)
    for (const supervisor of supervisorsResult.rows) {
      await notificationService.sendNotification({
        userId: supervisor.user_id,
        type: 'SESSION_UPDATED',
        title: 'Perubahan Pengajuan Bimbingan',
        message: `${supervisor.mahasiswa_nama} mengubah detail pengajuan bimbingan`,
        link: `/dosen/sessions/${updatedSession.id}`,
      });
    }

    res.json({
      message: 'Pengajuan bimbingan berhasil diupdate',
      session: updatedSession,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update session request error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Cancel session
exports.cancelSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;

    // Get the session
    const sessionResult = await client.query(
      `SELECT gs.*, tp.mahasiswa_id, tp.id as thesis_project_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       WHERE gs.id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

    // Verify ownership
    const mahasiswaResult = await client.query(
      'SELECT id, nama FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(403).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    if (session.mahasiswa_id !== mahasiswa.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke sesi ini' });
    }

    // Can only cancel pending or approved sessions
    if (!['PENDING', 'APPROVED'].includes(session.status)) {
      return res.status(400).json({
        message: 'Sesi ini tidak dapat dibatalkan',
      });
    }

    await client.query('BEGIN');

    // Update session status to cancelled
    await client.query(
      'UPDATE guidance_sessions SET status = $1 WHERE id = $2',
      ['CANCELLED', id]
    );

    // Get supervisors for notification
    const supervisorsResult = await client.query(
      `SELECT d.user_id
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE ts.thesis_project_id = $1`,
      [session.thesis_project_id]
    );

    await client.query('COMMIT');

    // Send notification to dosen(s)
    for (const supervisor of supervisorsResult.rows) {
      await notificationService.sendNotification({
        userId: supervisor.user_id,
        type: 'SESSION_CANCELLED',
        title: 'Pembatalan Bimbingan',
        message: `${mahasiswa.nama} membatalkan jadwal bimbingan`,
        link: `/dosen/sessions/${session.id}`,
      });
    }

    res.json({ message: 'Sesi bimbingan berhasil dibatalkan' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};