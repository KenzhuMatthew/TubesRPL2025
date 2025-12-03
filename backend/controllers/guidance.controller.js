// controllers/guidance.controller.js - Guidance Session Controller (PostgreSQL Native)
const db = require('../config/database');
const notificationService = require('../services/notification.service');

// Helper function to check time conflict
function checkTimeConflict(startTime, endTime, schedules) {
  for (const schedule of schedules) {
    const schedStart = schedule.start_time || schedule.startTime;
    const schedEnd = schedule.end_time || schedule.endTime;

    // Check if times overlap
    if (
      (startTime >= schedStart && startTime < schedEnd) ||
      (endTime > schedStart && endTime <= schedEnd) ||
      (startTime <= schedStart && endTime >= schedEnd)
    ) {
      return true; // Conflict found
    }
  }
  return false; // No conflict
}

// Mahasiswa - Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { dosenId, date } = req.query;

    if (!dosenId || !date) {
      return res.status(400).json({ message: 'Dosen ID dan tanggal harus disediakan' });
    }

    // Get mahasiswa data
    const mahasiswaResult = await db.query(
      'SELECT * FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Get mahasiswa schedules
    const dayOfWeek = new Date(date).getDay();
    const mahasiswaSchedulesResult = await db.query(
      'SELECT * FROM mahasiswa_schedules WHERE mahasiswa_id = $1 AND day_of_week = $2',
      [mahasiswa.id, dayOfWeek]
    );

    // Get dosen availabilities for that date
    const availabilitiesResult = await db.query(
      `SELECT * FROM dosen_availabilities
       WHERE dosen_id = $1
       AND is_active = true
       AND (
         (day_of_week = $2 AND is_recurring = true) OR
         (specific_date = $3)
       )`,
      [dosenId, dayOfWeek, date]
    );

    // Get dosen schedules (teaching schedule)
    const dosenSchedulesResult = await db.query(
      'SELECT * FROM dosen_schedules WHERE dosen_id = $1 AND day_of_week = $2',
      [dosenId, dayOfWeek]
    );

    // Get existing sessions for that date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const existingSessionsResult = await db.query(
      `SELECT * FROM guidance_sessions
       WHERE scheduled_date >= $1 
       AND scheduled_date <= $2
       AND status IN ('PENDING', 'APPROVED')`,
      [dateStart, dateEnd]
    );

    // Calculate available slots
    const availableSlots = availabilitiesResult.rows.map((avail) => {
      const allSchedules = [
        ...dosenSchedulesResult.rows,
        ...existingSessionsResult.rows,
        ...mahasiswaSchedulesResult.rows
      ];

      const isConflict = checkTimeConflict(
        avail.start_time,
        avail.end_time,
        allSchedules
      );

      return {
        id: avail.id,
        startTime: avail.start_time,
        endTime: avail.end_time,
        isAvailable: !isConflict,
      };
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Mahasiswa - Request guidance session
exports.requestSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { thesisProjectId, dosenId, scheduledDate, timeSlotId, notes } = req.body;

    // Validate
    if (!thesisProjectId || !dosenId || !scheduledDate || !timeSlotId) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Get availability details
    const availResult = await client.query(
      'SELECT * FROM dosen_availabilities WHERE id = $1',
      [timeSlotId]
    );

    if (availResult.rows.length === 0) {
      return res.status(404).json({ message: 'Slot waktu tidak ditemukan' });
    }

    const availability = availResult.rows[0];

    await client.query('BEGIN');

    // Create session
    const sessionResult = await client.query(
      `INSERT INTO guidance_sessions 
       (thesis_project_id, scheduled_date, start_time, end_time, location, session_type, status, created_by)
       VALUES ($1, $2, $3, $4, 'TBD', 'INDIVIDUAL', 'PENDING', $5)
       RETURNING *`,
      [thesisProjectId, scheduledDate, availability.start_time, availability.end_time, req.user.id]
    );

    const session = sessionResult.rows[0];

    // Get mahasiswa and dosen data for notification
    const dataResult = await client.query(
      `SELECT 
        m.nama as mahasiswa_nama,
        d.user_id as dosen_user_id
       FROM thesis_projects tp
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE tp.id = $1 AND d.id = $2
       LIMIT 1`,
      [thesisProjectId, dosenId]
    );

    await client.query('COMMIT');

    if (dataResult.rows.length > 0) {
      const data = dataResult.rows[0];
      
      // Send notification to dosen
      await notificationService.sendNotification({
        userId: data.dosen_user_id,
        type: 'SESSION_REQUESTED',
        title: 'Pengajuan Bimbingan Baru',
        message: `${data.mahasiswa_nama} mengajukan bimbingan pada ${scheduledDate}`,
        link: `/dosen/sessions/${session.id}`,
      });

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${data.dosen_user_id}`).emit('notification', {
          type: 'SESSION_REQUESTED',
          sessionId: session.id,
        });
      }
    }

    res.status(201).json({
      message: 'Pengajuan bimbingan berhasil dikirim',
      session,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Request session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Mahasiswa - Get session history
exports.getMahasiswaSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const mahasiswaResult = await db.query(
      'SELECT id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    let whereClause = 'WHERE tp.mahasiswa_id = $1';
    const params = [mahasiswa.id];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND gs.status = $${paramCount++}`;
      params.push(status);
    }

    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const sessionsResult = await db.query(
      `SELECT 
        gs.*,
        tp.judul, tp.tipe,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', d.id,
            'nama', d.nama,
            'nip', d.nip,
            'supervisor_order', ts.supervisor_order
          )
        ) as supervisors,
        (
          SELECT json_agg(jsonb_build_object(
            'id', gn.id,
            'content', gn.content,
            'tasks', gn.tasks,
            'dosen_nama', dn.nama
          ))
          FROM guidance_notes gn
          JOIN dosen dn ON gn.dosen_id = dn.id
          WHERE gn.session_id = gs.id
        ) as notes
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       LEFT JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       LEFT JOIN dosen d ON ts.dosen_id = d.id
       ${whereClause}
       GROUP BY gs.id, tp.id
       ORDER BY gs.scheduled_date DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) as count
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       ${whereClause}`,
      params.slice(0, paramCount - 2)
    );

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      sessions: sessionsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get mahasiswa sessions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Dosen - Get all sessions
exports.getDosenSessions = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    // Build WHERE clause and params for filtering
    let whereClause = 'WHERE ts.dosen_id = $1';
    const filterParams = [dosen.id];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND gs.status = $${paramIndex}`;
      filterParams.push(status);
      paramIndex++;
    }

    if (date) {
      whereClause += ` AND gs.scheduled_date = $${paramIndex}`;
      filterParams.push(date);
      paramIndex++;
    }

    // Get total count first (using only filter params)
    const totalResult = await db.query(
      `SELECT COUNT(DISTINCT gs.id) as count
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       ${whereClause}`,
      filterParams
    );

    const total = parseInt(totalResult.rows[0].count);

    // Get paginated sessions (filter params + pagination params)
    const offset = (page - 1) * limit;
    const sessionParams = [...filterParams, parseInt(limit), offset];

    const sessionsResult = await db.query(
      `SELECT 
        gs.*,
        tp.judul, tp.tipe,
        m.id as mahasiswa_id, m.nama as mahasiswa_nama, m.npm,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', d.id,
            'nama', d.nama,
            'nip', d.nip,
            'supervisor_order', ts2.supervisor_order
          )
        ) as supervisors,
        (
          SELECT COUNT(*) 
          FROM guidance_notes gn 
          WHERE gn.session_id = gs.id
        ) as notes_count
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       LEFT JOIN thesis_supervisors ts2 ON tp.id = ts2.thesis_project_id
       LEFT JOIN dosen d ON ts2.dosen_id = d.id
       ${whereClause}
       GROUP BY gs.id, tp.id, m.id
       ORDER BY gs.scheduled_date ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      sessionParams
    );

    res.json({
      sessions: sessionsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get dosen sessions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Dosen - Approve session
exports.approveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { location } = req.body;

    const sessionResult = await db.query(
      `UPDATE guidance_sessions 
       SET status = 'APPROVED', location = $1
       WHERE id = $2
       RETURNING *`,
      [location || 'TBD', sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

    // Get mahasiswa data for notification
    const mahasiswaResult = await db.query(
      `SELECT m.*, u.id as user_id
       FROM mahasiswa m
       JOIN thesis_projects tp ON m.id = tp.mahasiswa_id
       JOIN users u ON m.user_id = u.id
       WHERE tp.id = $1`,
      [session.thesis_project_id]
    );

    if (mahasiswaResult.rows.length > 0) {
      const mahasiswa = mahasiswaResult.rows[0];

      // Send notification to mahasiswa
      await notificationService.sendNotification({
        userId: mahasiswa.user_id,
        type: 'SESSION_APPROVED',
        title: 'Bimbingan Disetujui',
        message: `Bimbingan Anda pada ${session.scheduled_date} telah disetujui`,
        link: `/mahasiswa/sessions/${session.id}`,
      });
    }

    res.json({ message: 'Bimbingan berhasil disetujui', session });
  } catch (error) {
    console.error('Approve session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Dosen - Reject session
exports.rejectSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const sessionResult = await db.query(
      `UPDATE guidance_sessions 
       SET status = 'REJECTED'
       WHERE id = $1
       RETURNING *`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi bimbingan tidak ditemukan' });
    }

    const session = sessionResult.rows[0];

    // Get mahasiswa data for notification
    const mahasiswaResult = await db.query(
      `SELECT m.*, u.id as user_id
       FROM mahasiswa m
       JOIN thesis_projects tp ON m.id = tp.mahasiswa_id
       JOIN users u ON m.user_id = u.id
       WHERE tp.id = $1`,
      [session.thesis_project_id]
    );

    if (mahasiswaResult.rows.length > 0) {
      const mahasiswa = mahasiswaResult.rows[0];

      // Send notification
      await notificationService.sendNotification({
        userId: mahasiswa.user_id,
        type: 'SESSION_REJECTED',
        title: 'Bimbingan Ditolak',
        message: reason || 'Bimbingan Anda ditolak oleh dosen',
        link: `/mahasiswa/sessions/${session.id}`,
      });
    }

    res.json({ message: 'Bimbingan ditolak', session });
  } catch (error) {
    console.error('Reject session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Dosen - Add guidance notes
exports.addNotes = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { sessionId } = req.params;
    const { content, tasks } = req.body;

    const dosenResult = await client.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    await client.query('BEGIN');

    // Update session status to completed
    await client.query(
      'UPDATE guidance_sessions SET status = $1 WHERE id = $2',
      ['COMPLETED', sessionId]
    );

    // Create note
    const noteResult = await client.query(
      `INSERT INTO guidance_notes (session_id, dosen_id, content, tasks)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionId, dosen.id, content, tasks || null]
    );

    const note = noteResult.rows[0];

    // Get session and mahasiswa data for notification
    const sessionDataResult = await client.query(
      `SELECT tp.id as thesis_project_id, m.user_id as mahasiswa_user_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       WHERE gs.id = $1`,
      [sessionId]
    );

    await client.query('COMMIT');

    if (sessionDataResult.rows.length > 0) {
      const sessionData = sessionDataResult.rows[0];

      // Send notification to mahasiswa
      await notificationService.sendNotification({
        userId: sessionData.mahasiswa_user_id,
        type: 'NOTE_ADDED',
        title: 'Catatan Bimbingan Ditambahkan',
        message: 'Dosen telah menambahkan catatan hasil bimbingan',
        link: `/mahasiswa/sessions/${sessionId}`,
      });
    }

    res.status(201).json({
      message: 'Catatan bimbingan berhasil ditambahkan',
      note,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add notes error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Dosen - Get supervised students
exports.getStudents = async (req, res) => {
  try {
    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    // Get current academic period dates
    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    const studentsResult = await db.query(
      `SELECT 
        m.id, m.npm, m.nama, m.email,
        tp.id as thesis_project_id, tp.judul, tp.tipe,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED') as total_guidance,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $2) as before_uts,
        COUNT(gs.id) FILTER (WHERE gs.status = 'COMPLETED' AND gs.scheduled_date < $3) as before_uas
       FROM thesis_supervisors ts
       JOIN thesis_projects tp ON ts.thesis_project_id = tp.id
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       LEFT JOIN guidance_sessions gs ON tp.id = gs.thesis_project_id
       WHERE ts.dosen_id = $1
       GROUP BY m.id, tp.id
       ORDER BY m.nama`,
      [dosen.id, utsDate, uasDate]
    );

    const studentsWithProgress = studentsResult.rows.map((student) => {
      const requiredBeforeUTS = student.tipe === 'TA1' ? 4 : 4;
      const requiredBeforeUAS = student.tipe === 'TA1' ? 4 : 4;

      return {
        id: student.id,
        nama: student.nama,
        npm: student.npm,
        email: student.email,
        thesisType: student.tipe,
        judul: student.judul,
        totalGuidance: parseInt(student.total_guidance),
        beforeUTS: parseInt(student.before_uts),
        beforeUAS: parseInt(student.before_uas),
        requiredBeforeUTS,
        requiredBeforeUAS,
        meetsRequirement: parseInt(student.before_uts) >= requiredBeforeUTS && 
                         parseInt(student.before_uas) >= requiredBeforeUAS,
      };
    });

    res.json({ students: studentsWithProgress });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get mahasiswa progress
exports.getMahasiswaProgress = async (req, res) => {
  try {
    const mahasiswaResult = await db.query(
      'SELECT * FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    const projectResult = await db.query(
      'SELECT * FROM thesis_projects WHERE mahasiswa_id = $1 AND status = $2 LIMIT 1',
      [mahasiswa.id, 'ACTIVE']
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data tugas akhir tidak ditemukan' });
    }

    const project = projectResult.rows[0];

    // Get academic period dates
    const utsDate = new Date(process.env.UTS_DATE || '2025-03-15');
    const uasDate = new Date(process.env.UAS_DATE || '2025-06-01');

    const sessionsResult = await db.query(
      `SELECT gs.*,
        (SELECT COUNT(*) FROM guidance_notes WHERE session_id = gs.id) > 0 as has_notes
       FROM guidance_sessions gs
       WHERE gs.thesis_project_id = $1 AND gs.status = 'COMPLETED'
       ORDER BY gs.scheduled_date ASC`,
      [project.id]
    );

    const sessions = sessionsResult.rows;
    const beforeUTS = sessions.filter((s) => new Date(s.scheduled_date) < utsDate).length;
    const beforeUAS = sessions.filter((s) => new Date(s.scheduled_date) < uasDate).length;

    const requiredBeforeUTS = project.tipe === 'TA1' ? 4 : 4;
    const requiredBeforeUAS = project.tipe === 'TA1' ? 4 : 4;

    const progress = {
      thesisType: project.tipe,
      judul: project.judul,
      totalGuidance: sessions.length,
      beforeUTS,
      beforeUAS,
      requiredBeforeUTS,
      requiredBeforeUAS,
      meetsRequirement: beforeUTS >= requiredBeforeUTS && beforeUAS >= requiredBeforeUAS,
      sessions: sessions.map((s) => ({
        id: s.id,
        date: s.scheduled_date,
        location: s.location,
        hasNotes: s.has_notes,
      })),
    };

    res.json({ progress });
  } catch (error) {
    console.error('Get mahasiswa progress error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Dosen - Offer session to mahasiswa
exports.offerSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { mahasiswaId, scheduledDate, startTime, endTime, location, notes } = req.body;

    // Validate required fields
    if (!mahasiswaId || !scheduledDate || !startTime || !endTime || !location) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Get dosen data
    const dosenResult = await client.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    // Get mahasiswa thesis project
    const projectResult = await client.query(
      `SELECT tp.id, tp.judul, tp.tipe, m.nama, m.user_id
       FROM thesis_projects tp
       JOIN mahasiswa m ON tp.mahasiswa_id = m.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       WHERE m.id = $1 AND ts.dosen_id = $2 AND tp.status = 'ACTIVE'
       LIMIT 1`,
      [mahasiswaId, dosen.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Mahasiswa tidak ditemukan atau bukan mahasiswa bimbingan Anda' 
      });
    }

    const project = projectResult.rows[0];

    // Check for time conflicts
    const dayOfWeek = new Date(scheduledDate).getDay();
    
    // Check dosen teaching schedule
    const dosenScheduleResult = await client.query(
      `SELECT * FROM dosen_schedules 
       WHERE dosen_id = $1 AND day_of_week = $2
       AND (
         ($3 >= start_time AND $3 < end_time) OR
         ($4 > start_time AND $4 <= end_time) OR
         ($3 <= start_time AND $4 >= end_time)
       )`,
      [dosen.id, dayOfWeek, startTime, endTime]
    );

    if (dosenScheduleResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Waktu bentrok dengan jadwal mengajar Anda' 
      });
    }

    // Check existing sessions on that date
    const dateStart = new Date(scheduledDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(scheduledDate);
    dateEnd.setHours(23, 59, 59, 999);

    const existingSessionResult = await client.query(
      `SELECT * FROM guidance_sessions
       WHERE scheduled_date >= $1 AND scheduled_date <= $2
       AND status IN ('PENDING', 'APPROVED', 'OFFERED')
       AND (
         ($3 >= start_time AND $3 < end_time) OR
         ($4 > start_time AND $4 <= end_time) OR
         ($3 <= start_time AND $4 >= end_time)
       )`,
      [dateStart, dateEnd, startTime, endTime]
    );

    if (existingSessionResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Waktu bentrok dengan sesi bimbingan lain' 
      });
    }

    // Check mahasiswa schedule
    const mahasiswaScheduleResult = await client.query(
      `SELECT * FROM mahasiswa_schedules
       WHERE mahasiswa_id = $1 AND day_of_week = $2
       AND (
         ($3 >= start_time AND $3 < end_time) OR
         ($4 > start_time AND $4 <= end_time) OR
         ($3 <= start_time AND $4 >= end_time)
       )`,
      [mahasiswaId, dayOfWeek, startTime, endTime]
    );

    if (mahasiswaScheduleResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Waktu bentrok dengan jadwal kuliah mahasiswa' 
      });
    }

    await client.query('BEGIN');

    // Create session with status OFFERED
    const sessionResult = await client.query(
      `INSERT INTO guidance_sessions 
       (thesis_project_id, scheduled_date, start_time, end_time, location, session_type, status, created_by, notes)
       VALUES ($1, $2, $3, $4, $5, 'INDIVIDUAL', 'OFFERED', $6, $7)
       RETURNING *`,
      [project.id, scheduledDate, startTime, endTime, location, req.user.id, notes]
    );

    const session = sessionResult.rows[0];

    await client.query('COMMIT');

    // Send notification to mahasiswa
    await notificationService.sendNotification({
      userId: project.user_id,
      type: 'SESSION_OFFERED',
      title: 'Tawaran Bimbingan Baru',
      message: `Dosen mengajukan bimbingan pada ${new Date(scheduledDate).toLocaleDateString('id-ID')} pukul ${startTime}`,
      link: `/mahasiswa/sessions/${session.id}`,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${project.user_id}`).emit('notification', {
        type: 'SESSION_OFFERED',
        sessionId: session.id,
      });
    }

    res.status(201).json({
      message: 'Tawaran bimbingan berhasil dikirim ke mahasiswa',
      session,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Offer session error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Mahasiswa - Accept offered session
exports.acceptOfferedSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { sessionId } = req.params;

    // Get mahasiswa data
    const mahasiswaResult = await client.query(
      'SELECT id, user_id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Get session and verify it's for this mahasiswa
    const sessionResult = await client.query(
      `SELECT gs.*, tp.mahasiswa_id, d.user_id as dosen_user_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE gs.id = $1 AND tp.mahasiswa_id = $2 AND gs.status = 'OFFERED'`,
      [sessionId, mahasiswa.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Sesi bimbingan tidak ditemukan atau bukan untuk Anda' 
      });
    }

    const session = sessionResult.rows[0];

    await client.query('BEGIN');

    // Update session status to APPROVED
    await client.query(
      'UPDATE guidance_sessions SET status = $1 WHERE id = $2',
      ['APPROVED', sessionId]
    );

    await client.query('COMMIT');

    // Send notification to dosen
    await notificationService.sendNotification({
      userId: session.dosen_user_id,
      type: 'SESSION_ACCEPTED',
      title: 'Tawaran Bimbingan Diterima',
      message: `Mahasiswa menerima tawaran bimbingan pada ${new Date(session.scheduled_date).toLocaleDateString('id-ID')}`,
      link: `/dosen/sessions/${sessionId}`,
    });

    res.json({
      message: 'Tawaran bimbingan berhasil diterima',
      session,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept offered session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};

// Mahasiswa - Decline offered session
exports.declineOfferedSession = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    // Get mahasiswa data
    const mahasiswaResult = await client.query(
      'SELECT id, user_id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Get session and verify
    const sessionResult = await client.query(
      `SELECT gs.*, tp.mahasiswa_id, d.user_id as dosen_user_id
       FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       JOIN dosen d ON ts.dosen_id = d.id
       WHERE gs.id = $1 AND tp.mahasiswa_id = $2 AND gs.status = 'OFFERED'`,
      [sessionId, mahasiswa.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Sesi bimbingan tidak ditemukan atau bukan untuk Anda' 
      });
    }

    const session = sessionResult.rows[0];

    await client.query('BEGIN');

    // Update session status to DECLINED
    await client.query(
      'UPDATE guidance_sessions SET status = $1 WHERE id = $2',
      ['DECLINED', sessionId]
    );

    await client.query('COMMIT');

    // Send notification to dosen
    await notificationService.sendNotification({
      userId: session.dosen_user_id,
      type: 'SESSION_DECLINED',
      title: 'Tawaran Bimbingan Ditolak',
      message: reason || `Mahasiswa menolak tawaran bimbingan pada ${new Date(session.scheduled_date).toLocaleDateString('id-ID')}`,
      link: `/dosen/sessions/${sessionId}`,
    });

    res.json({
      message: 'Tawaran bimbingan ditolak',
      session,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Decline offered session error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    client.release();
  }
};