// controllers/dosen.controller.js - Dosen Specific Controller (PostgreSQL Native)
const db = require('../config/database');
const notificationService = require('../services/notification.service');

// Get dosen dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    // Get stats
    const [totalStudentsResult, pendingRequestsResult, completedThisMonthResult] = await Promise.all([
      // Total students supervised
      db.query(
        'SELECT COUNT(DISTINCT thesis_project_id) as count FROM thesis_supervisors WHERE dosen_id = $1',
        [dosen.id]
      ),

      // Pending session requests
      db.query(
        `SELECT COUNT(*) as count FROM guidance_sessions gs
         JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
         JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
         WHERE ts.dosen_id = $1 AND gs.status = 'PENDING'`,
        [dosen.id]
      ),

      // Completed sessions this month
      db.query(
        `SELECT COUNT(*) as count FROM guidance_sessions gs
         JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
         JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
         WHERE ts.dosen_id = $1 
         AND gs.status = 'COMPLETED'
         AND gs.scheduled_date >= date_trunc('month', CURRENT_DATE)`,
        [dosen.id]
      ),
    ]);

    const totalStudents = parseInt(totalStudentsResult.rows[0].count);
    const pendingRequests = parseInt(pendingRequestsResult.rows[0].count);
    const completedThisMonth = parseInt(completedThisMonthResult.rows[0].count);

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessionsResult = await db.query(
      `SELECT gs.*, tp.judul, m.nama as mahasiswa_nama, m.npm
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       WHERE ts.dosen_id = $1
       AND gs.scheduled_date >= $2 
       AND gs.scheduled_date < $3
       AND gs.status IN ('APPROVED', 'PENDING')
       ORDER BY gs.start_time ASC`,
      [dosen.id, today, tomorrow]
    );

    // Get pending requests
    const pendingRequestsListResult = await db.query(
      `SELECT gs.*, tp.judul, m.nama as mahasiswa_nama, m.npm
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       WHERE ts.dosen_id = $1 AND gs.status = 'PENDING'
       ORDER BY gs.created_at DESC
       LIMIT 5`,
      [dosen.id]
    );

    res.json({
      stats: {
        totalStudents,
        pendingRequests,
        todaySessions: todaySessionsResult.rows.length,
        completedThisMonth,
      },
      todaySessions: todaySessionsResult.rows,
      pendingRequests: pendingRequestsListResult.rows,
    });
  } catch (error) {
    console.error('Get dosen dashboard error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Create/offer guidance session
exports.createSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const {
      thesisProjectId,
      scheduledDate,
      startTime,
      endTime,
      location,
      sessionType,
      additionalStudents,
    } = req.body;

    if (!thesisProjectId || !scheduledDate || !startTime || !location) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const dosenResult = await client.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    const dosen = dosenResult.rows[0];

    // Verify dosen is supervisor of this thesis
    const supervisorResult = await client.query(
      'SELECT id FROM thesis_supervisors WHERE thesis_project_id = $1 AND dosen_id = $2',
      [thesisProjectId, dosen.id]
    );

    if (supervisorResult.rows.length === 0) {
      return res.status(403).json({
        message: 'Anda bukan pembimbing untuk mahasiswa ini',
      });
    }

    await client.query('BEGIN');

    // Create session (directly approved since created by dosen)
    const sessionResult = await client.query(
      `INSERT INTO guidance_sessions 
       (thesis_project_id, scheduled_date, start_time, end_time, location, session_type, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'APPROVED', $7)
       RETURNING *`,
      [thesisProjectId, scheduledDate, startTime, endTime || null, location, sessionType || 'INDIVIDUAL', req.user.id]
    );

    const session = sessionResult.rows[0];

    // Get mahasiswa data for notification
    const mahasiswaResult = await client.query(
      `SELECT m.*, u.id as user_id 
       FROM mahasiswa m
       JOIN thesis_projects tp ON m.id = tp.mahasiswa_id
       JOIN users u ON m.user_id = u.id
       WHERE tp.id = $1`,
      [thesisProjectId]
    );

    const mahasiswa = mahasiswaResult.rows[0];

    // Add additional students for group session
    if (additionalStudents && additionalStudents.length > 0) {
      for (const mahasiswaId of additionalStudents) {
        await client.query(
          'INSERT INTO guidance_session_students (session_id, mahasiswa_id) VALUES ($1, $2)',
          [session.id, mahasiswaId]
        );
      }
    }

    await client.query('COMMIT');

    // Send notification to mahasiswa
    await notificationService.sendNotification({
      userId: mahasiswa.user_id,
      type: 'SESSION_APPROVED',
      title: 'Jadwal Bimbingan Baru',
      message: `Dosen telah menjadwalkan bimbingan untuk Anda pada ${scheduledDate}`,
      link: `/mahasiswa/sessions/${session.id}`,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${mahasiswa.user_id}`).emit('notification', {
        type: 'SESSION_APPROVED',
        sessionId: session.id,
      });
    }

    res.status(201).json({
      message: 'Jadwal bimbingan berhasil dibuat',
      session,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Update session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, startTime, endTime, location } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (scheduledDate) {
      updateFields.push(`scheduled_date = $${paramCount++}`);
      values.push(scheduledDate);
    }
    if (startTime) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(startTime);
    }
    if (endTime) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(endTime);
    }
    if (location) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(location);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const sessionResult = await db.query(
      `UPDATE guidance_sessions 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    const session = sessionResult.rows[0];

    // Get mahasiswa data for notification
    const mahasiswaResult = await db.query(
      `SELECT m.*, u.id as user_id 
       FROM mahasiswa m
       JOIN thesis_projects tp ON m.id = tp.mahasiswa_id
       JOIN users u ON m.user_id = u.id
       JOIN guidance_sessions gs ON tp.id = gs.thesis_project_id
       WHERE gs.id = $1`,
      [id]
    );

    if (mahasiswaResult.rows.length > 0) {
      const mahasiswa = mahasiswaResult.rows[0];

      // Send notification to mahasiswa
      await notificationService.sendNotification({
        userId: mahasiswa.user_id,
        type: 'SESSION_UPDATED',
        title: 'Jadwal Bimbingan Diubah',
        message: 'Dosen telah mengubah detail jadwal bimbingan Anda',
        link: `/mahasiswa/sessions/${session.id}`,
      });
    }

    res.json({
      message: 'Jadwal bimbingan berhasil diupdate',
      session,
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get session detail
exports.getSessionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const sessionResult = await db.query(
      `SELECT 
        gs.*,
        tp.judul, tp.tipe,
        m.id as mahasiswa_id, m.nama as mahasiswa_nama, m.npm, m.email as mahasiswa_email
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       WHERE gs.id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

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

    // Get additional students
    const additionalStudentsResult = await db.query(
      `SELECT m.*
       FROM guidance_session_students gss
       JOIN mahasiswa m ON gss.mahasiswa_id = m.id
       WHERE gss.session_id = $1`,
      [id]
    );

    session.supervisors = supervisorsResult.rows;
    session.notes = notesResult.rows;
    session.additionalStudents = additionalStudentsResult.rows;

    res.json({ session });
  } catch (error) {
    console.error('Get session detail error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get student progress - FIXED: Added exports
exports.getStudentProgress = async (req, res) => {
  try {
    const { mahasiswaId } = req.params;

    const thesisProjectResult = await db.query(
      `SELECT tp.*, m.nama, m.npm, m.email
       FROM thesis_projects tp
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       WHERE tp.mahasiswa_id = $1 AND tp.status = 'ACTIVE'
       LIMIT 1`,
      [mahasiswaId]
    );

    if (thesisProjectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data tugas akhir tidak ditemukan' });
    }

    const thesisProject = thesisProjectResult.rows[0];

    // Get supervisors
    const supervisorsResult = await db.query(
      `SELECT d.*, ts.supervisor_order
       FROM thesis_supervisors ts
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE ts.thesis_project_id = $1
       ORDER BY ts.supervisor_order`,
      [thesisProject.id]
    );

    // Get completed sessions
    const sessionsResult = await db.query(
      `SELECT gs.*, 
        (SELECT json_agg(json_build_object('id', gn.id, 'content', gn.content, 'tasks', gn.tasks, 'dosen_nama', d.nama))
         FROM guidance_notes gn
         JOIN dosen d ON gn.dosen_id = d.id
         WHERE gn.session_id = gs.id) as notes
       FROM guidance_sessions gs
       WHERE gs.thesis_project_id = $1 AND gs.status = 'COMPLETED'
       ORDER BY gs.scheduled_date ASC`,
      [thesisProject.id]
    );

    // Calculate progress
    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    const sessions = sessionsResult.rows;
    const beforeUTS = sessions.filter((s) => new Date(s.scheduled_date) < utsDate).length;
    const beforeUAS = sessions.filter((s) => new Date(s.scheduled_date) < uasDate).length;

    const requiredBeforeUTS = thesisProject.tipe === 'TA1' ? 4 : 4;
    const requiredBeforeUAS = thesisProject.tipe === 'TA1' ? 4 : 4;

    const progress = {
      mahasiswa: {
        id: thesisProject.mahasiswa_id,
        nama: thesisProject.nama,
        npm: thesisProject.npm,
        email: thesisProject.email
      },
      thesisType: thesisProject.tipe,
      judul: thesisProject.judul,
      supervisors: supervisorsResult.rows,
      totalGuidance: sessions.length,
      beforeUTS,
      beforeUAS,
      requiredBeforeUTS,
      requiredBeforeUAS,
      meetsRequirement: beforeUTS >= requiredBeforeUTS && beforeUAS >= requiredBeforeUAS,
      sessions: sessions.map((s) => ({
        id: s.id,
        date: s.scheduled_date,
        startTime: s.start_time,
        location: s.location,
        notes: s.notes || []
      })),
    };

    res.json({ progress });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};