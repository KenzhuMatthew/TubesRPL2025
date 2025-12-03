// controllers/schedule.controller.js - Schedule Management Controller (PostgreSQL Native)
const db = require('../config/database');

// ===== DOSEN SCHEDULE MANAGEMENT =====

// Get dosen schedules
exports.getDosenSchedules = async (req, res) => {
  try {
    const { semester } = req.query;
    
    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    let whereClause = 'WHERE dosen_id = $1';
    const params = [dosen.id];

    if (semester) {
      whereClause += ' AND semester = $2';
      params.push(semester);
    }

    const schedulesResult = await db.query(
      `SELECT * FROM dosen_schedules
       ${whereClause}
       ORDER BY day_of_week ASC, start_time ASC`,
      params
    );

    res.json({ schedules: schedulesResult.rows });
  } catch (error) {
    console.error('Get dosen schedules error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Add dosen schedule
exports.addDosenSchedule = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, courseName, room, semester } = req.body;

    if (!dayOfWeek && dayOfWeek !== 0 || !startTime || !endTime || !courseName) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    // Check for conflicts (time overlap)
    const conflictResult = await db.query(
      `SELECT * FROM dosen_schedules 
       WHERE dosen_id = $1 
       AND day_of_week = $2
       AND (
         (start_time < $4 AND end_time > $3) OR
         (start_time < $4 AND end_time > $4) OR
         (start_time >= $3 AND start_time < $4)
       )`,
      [dosen.id, parseInt(dayOfWeek), startTime, endTime]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        message: 'Jadwal bentrok dengan jadwal yang sudah ada',
        conflict: conflictResult.rows[0],
      });
    }

    const scheduleResult = await db.query(
      `INSERT INTO dosen_schedules 
       (dosen_id, day_of_week, start_time, end_time, course_name, room, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dosen.id, parseInt(dayOfWeek), startTime, endTime, courseName, room || null, semester || 'Default']
    );

    res.status(201).json({
      message: 'Jadwal berhasil ditambahkan',
      schedule: scheduleResult.rows[0],
    });
  } catch (error) {
    console.error('Add dosen schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update dosen schedule
exports.updateDosenSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, courseName, room } = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (dayOfWeek !== undefined) {
      updateFields.push(`day_of_week = $${paramCount++}`);
      values.push(parseInt(dayOfWeek));
    }
    if (startTime) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(startTime);
    }
    if (endTime) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(endTime);
    }
    if (courseName) {
      updateFields.push(`course_name = $${paramCount++}`);
      values.push(courseName);
    }
    if (room !== undefined) {
      updateFields.push(`room = $${paramCount++}`);
      values.push(room);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const scheduleResult = await db.query(
      `UPDATE dosen_schedules 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.json({
      message: 'Jadwal berhasil diupdate',
      schedule: scheduleResult.rows[0],
    });
  } catch (error) {
    console.error('Update dosen schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Delete dosen schedule
exports.deleteDosenSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM dosen_schedules WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error('Delete dosen schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== DOSEN AVAILABILITY MANAGEMENT =====

// Get availabilities
exports.getAvailabilities = async (req, res) => {
  try {
    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    const availabilitiesResult = await db.query(
      `SELECT * FROM dosen_availabilities
       WHERE dosen_id = $1
       ORDER BY 
         CASE WHEN is_recurring THEN 0 ELSE 1 END,
         day_of_week ASC NULLS LAST,
         specific_date ASC NULLS LAST,
         start_time ASC`,
      [dosen.id]
    );

    res.json({ availabilities: availabilitiesResult.rows });
  } catch (error) {
    console.error('Get availabilities error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Create availability
exports.createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, isRecurring, specificDate } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Waktu mulai dan selesai harus diisi' });
    }

    if (!isRecurring && !specificDate) {
      return res.status(400).json({
        message: 'Untuk slot non-recurring, tanggal spesifik harus diisi',
      });
    }

    if (isRecurring && (dayOfWeek === undefined || dayOfWeek === null)) {
      return res.status(400).json({
        message: 'Untuk slot recurring, hari harus diisi',
      });
    }

    const dosenResult = await db.query(
      'SELECT id FROM dosen WHERE user_id = $1',
      [req.user.id]
    );

    if (dosenResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data dosen tidak ditemukan' });
    }

    const dosen = dosenResult.rows[0];

    const availabilityResult = await db.query(
      `INSERT INTO dosen_availabilities 
       (dosen_id, day_of_week, start_time, end_time, is_recurring, specific_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [
        dosen.id,
        isRecurring ? parseInt(dayOfWeek) : null,
        startTime,
        endTime,
        isRecurring || false,
        specificDate ? new Date(specificDate) : null,
      ]
    );

    res.status(201).json({
      message: 'Waktu tersedia berhasil ditambahkan',
      availability: availabilityResult.rows[0],
    });
  } catch (error) {
    console.error('Create availability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isRecurring, specificDate } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (dayOfWeek !== undefined) {
      updateFields.push(`day_of_week = $${paramCount++}`);
      values.push(dayOfWeek !== null ? parseInt(dayOfWeek) : null);
    }
    if (startTime) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(startTime);
    }
    if (endTime) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(endTime);
    }
    if (isRecurring !== undefined) {
      updateFields.push(`is_recurring = $${paramCount++}`);
      values.push(isRecurring);
    }
    if (specificDate !== undefined) {
      updateFields.push(`specific_date = $${paramCount++}`);
      values.push(specificDate ? new Date(specificDate) : null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const availabilityResult = await db.query(
      `UPDATE dosen_availabilities 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (availabilityResult.rows.length === 0) {
      return res.status(404).json({ message: 'Waktu tersedia tidak ditemukan' });
    }

    res.json({
      message: 'Waktu tersedia berhasil diupdate',
      availability: availabilityResult.rows[0],
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Delete availability
exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM dosen_availabilities WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Waktu tersedia tidak ditemukan' });
    }

    res.json({ message: 'Waktu tersedia berhasil dihapus' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Toggle availability active status
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'Status isActive harus disediakan' });
    }

    const availabilityResult = await db.query(
      `UPDATE dosen_availabilities 
       SET is_active = $1
       WHERE id = $2
       RETURNING *`,
      [isActive, id]
    );

    if (availabilityResult.rows.length === 0) {
      return res.status(404).json({ message: 'Waktu tersedia tidak ditemukan' });
    }

    res.json({
      message: `Waktu tersedia berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      availability: availabilityResult.rows[0],
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== MAHASISWA SCHEDULE MANAGEMENT =====

// Get mahasiswa schedules
exports.getMahasiswaSchedules = async (req, res) => {
  try {
    const { semester } = req.query;

    const mahasiswaResult = await db.query(
      'SELECT id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    let whereClause = 'WHERE mahasiswa_id = $1';
    const params = [mahasiswa.id];

    if (semester) {
      whereClause += ' AND semester = $2';
      params.push(semester);
    }

    const schedulesResult = await db.query(
      `SELECT * FROM mahasiswa_schedules
       ${whereClause}
       ORDER BY day_of_week ASC, start_time ASC`,
      params
    );

    res.json({ schedules: schedulesResult.rows });
  } catch (error) {
    console.error('Get mahasiswa schedules error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Add mahasiswa schedule
exports.addMahasiswaSchedule = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, courseName, semester } = req.body;

    if (!dayOfWeek && dayOfWeek !== 0 || !startTime || !endTime || !courseName) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const mahasiswaResult = await db.query(
      'SELECT id FROM mahasiswa WHERE user_id = $1',
      [req.user.id]
    );

    if (mahasiswaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan' });
    }

    const mahasiswa = mahasiswaResult.rows[0];

    // Check for conflicts
    const conflictResult = await db.query(
      `SELECT * FROM mahasiswa_schedules 
       WHERE mahasiswa_id = $1 
       AND day_of_week = $2
       AND (
         (start_time < $4 AND end_time > $3) OR
         (start_time < $4 AND end_time > $4) OR
         (start_time >= $3 AND start_time < $4)
       )`,
      [mahasiswa.id, parseInt(dayOfWeek), startTime, endTime]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        message: 'Jadwal bentrok dengan jadwal yang sudah ada',
        conflict: conflictResult.rows[0],
      });
    }

    const scheduleResult = await db.query(
      `INSERT INTO mahasiswa_schedules 
       (mahasiswa_id, day_of_week, start_time, end_time, course_name, semester)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [mahasiswa.id, parseInt(dayOfWeek), startTime, endTime, courseName, semester || 'Default']
    );

    res.status(201).json({
      message: 'Jadwal berhasil ditambahkan',
      schedule: scheduleResult.rows[0],
    });
  } catch (error) {
    console.error('Add mahasiswa schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update mahasiswa schedule
exports.updateMahasiswaSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, courseName } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (dayOfWeek !== undefined) {
      updateFields.push(`day_of_week = $${paramCount++}`);
      values.push(parseInt(dayOfWeek));
    }
    if (startTime) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(startTime);
    }
    if (endTime) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(endTime);
    }
    if (courseName) {
      updateFields.push(`course_name = $${paramCount++}`);
      values.push(courseName);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
    }

    values.push(id);

    const scheduleResult = await db.query(
      `UPDATE mahasiswa_schedules 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.json({
      message: 'Jadwal berhasil diupdate',
      schedule: scheduleResult.rows[0],
    });
  } catch (error) {
    console.error('Update mahasiswa schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Delete mahasiswa schedule
exports.deleteMahasiswaSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM mahasiswa_schedules WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error('Delete mahasiswa schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ===== COMMON FUNCTIONS =====

// Check conflict endpoint
exports.checkConflict = async (req, res) => {
  try {
    const { userId, dayOfWeek, startTime, endTime, userType } = req.body;

    if (!userId || dayOfWeek === undefined || !startTime || !endTime || !userType) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    let query;
    let params;

    if (userType === 'DOSEN') {
      query = `SELECT * FROM dosen_schedules 
               WHERE dosen_id = $1 
               AND day_of_week = $2
               AND (
                 (start_time < $4 AND end_time > $3) OR
                 (start_time < $4 AND end_time > $4) OR
                 (start_time >= $3 AND start_time < $4)
               )
               LIMIT 1`;
      params = [userId, parseInt(dayOfWeek), startTime, endTime];
    } else if (userType === 'MAHASISWA') {
      query = `SELECT * FROM mahasiswa_schedules 
               WHERE mahasiswa_id = $1 
               AND day_of_week = $2
               AND (
                 (start_time < $4 AND end_time > $3) OR
                 (start_time < $4 AND end_time > $4) OR
                 (start_time >= $3 AND start_time < $4)
               )
               LIMIT 1`;
      params = [userId, parseInt(dayOfWeek), startTime, endTime];
    } else {
      return res.status(400).json({ message: 'User type tidak valid' });
    }

    const conflictResult = await db.query(query, params);

    res.json({
      hasConflict: conflictResult.rows.length > 0,
      conflict: conflictResult.rows.length > 0 ? conflictResult.rows[0] : null,
    });
  } catch (error) {
    console.error('Check conflict endpoint error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get rooms
exports.getRooms = async (req, res) => {
  try {
    const roomsResult = await db.query(
      `SELECT * FROM rooms
       WHERE is_active = true
       ORDER BY name ASC`
    );

    res.json({ rooms: roomsResult.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};