// services/schedule.service.js - Schedule Service (PostgreSQL Native)
const db = require('../config/database');

// Constants
const SESSION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const THESIS_REQUIREMENTS = {
  TA1: {
    beforeUTS: 4,
    beforeUAS: 4,
    total: 8
  },
  TA2: {
    beforeUTS: 4,
    beforeUAS: 4,
    total: 8
  }
};

class ScheduleService {
  /**
   * Helper: Check if two time ranges overlap
   */
  isTimeOverlap(start1, end1, start2, end2) {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }

  /**
   * Helper: Convert time string to minutes
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Cek konflik jadwal untuk dosen
   * @param {string} dosenId - ID dosen
   * @param {Date} date - Tanggal
   * @param {string} startTime - Waktu mulai (HH:mm)
   * @param {string} endTime - Waktu selesai (HH:mm)
   * @param {string} excludeId - ID jadwal yang dikecualikan (untuk update)
   * @returns {Object} - { hasConflict, conflicts, conflictType }
   */
  async checkDosenScheduleConflict(dosenId, date, startTime, endTime, excludeId = null) {
    const conflicts = [];
    const dayOfWeek = this.getDayOfWeek(date);
    
    // 1. Cek konflik dengan jadwal mengajar dosen
    const teachingSchedulesResult = await db.query(
      `SELECT * FROM dosen_schedules
       WHERE dosen_id = $1 AND day_of_week = $2`,
      [dosenId, dayOfWeek]
    );

    for (const schedule of teachingSchedulesResult.rows) {
      if (this.isTimeOverlap(startTime, endTime, schedule.start_time, schedule.end_time)) {
        conflicts.push({
          type: 'teaching',
          schedule: {
            courseName: schedule.course_name,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            room: schedule.room
          }
        });
      }
    }

    // 2. Cek konflik dengan sesi bimbingan lain
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    let guidanceQuery = `
      SELECT gs.*, m.nama as mahasiswa_nama, m.npm as mahasiswa_npm
      FROM guidance_sessions gs
      JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
      JOIN mahasiswa m ON tp.mahasiswa_id = m.id
      JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
      WHERE ts.dosen_id = $1
      AND gs.scheduled_date >= $2 
      AND gs.scheduled_date <= $3
      AND gs.status IN ('APPROVED', 'PENDING')
    `;
    
    const guidanceParams = [dosenId, dateStart, dateEnd];
    
    if (excludeId) {
      guidanceQuery += ' AND gs.id != $4';
      guidanceParams.push(excludeId);
    }

    const guidanceSessionsResult = await db.query(guidanceQuery, guidanceParams);

    for (const session of guidanceSessionsResult.rows) {
      if (this.isTimeOverlap(startTime, endTime, session.start_time, session.end_time)) {
        conflicts.push({
          type: 'guidance',
          session: {
            mahasiswaName: session.mahasiswa_nama,
            mahasiswaNpm: session.mahasiswa_npm,
            startTime: session.start_time,
            endTime: session.end_time,
            location: session.location
          }
        });
      }
    }

    // 3. Cek konflik dengan availability slot (jika ada)
    const availabilitySlotsResult = await db.query(
      `SELECT * FROM dosen_availabilities
       WHERE dosen_id = $1 
       AND specific_date >= $2 
       AND specific_date <= $3
       AND is_active = false`,
      [dosenId, dateStart, dateEnd]
    );

    for (const slot of availabilitySlotsResult.rows) {
      if (this.isTimeOverlap(startTime, endTime, slot.start_time, slot.end_time)) {
        conflicts.push({
          type: 'unavailable',
          slot: {
            startTime: slot.start_time,
            endTime: slot.end_time
          }
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      conflictType: conflicts.length > 0 ? conflicts[0].type : null
    };
  }

  /**
   * Cek konflik jadwal untuk mahasiswa
   * @param {string} mahasiswaId - ID mahasiswa
   * @param {Date} date - Tanggal
   * @param {string} startTime - Waktu mulai (HH:mm)
   * @param {string} endTime - Waktu selesai (HH:mm)
   * @param {string} excludeId - ID jadwal yang dikecualikan
   * @returns {Object} - { hasConflict, conflicts, conflictType }
   */
  async checkMahasiswaScheduleConflict(mahasiswaId, date, startTime, endTime, excludeId = null) {
    const conflicts = [];
    const dayOfWeek = this.getDayOfWeek(date);

    // 1. Cek konflik dengan jadwal kuliah mahasiswa
    const courseSchedulesResult = await db.query(
      `SELECT * FROM mahasiswa_schedules
       WHERE mahasiswa_id = $1 AND day_of_week = $2`,
      [mahasiswaId, dayOfWeek]
    );

    for (const schedule of courseSchedulesResult.rows) {
      if (this.isTimeOverlap(startTime, endTime, schedule.start_time, schedule.end_time)) {
        conflicts.push({
          type: 'course',
          schedule: {
            courseName: schedule.course_name,
            startTime: schedule.start_time,
            endTime: schedule.end_time
          }
        });
      }
    }

    // 2. Cek konflik dengan sesi bimbingan lain
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    let guidanceQuery = `
      SELECT gs.*, d.nama as dosen_nama, d.nip as dosen_nip
      FROM guidance_sessions gs
      JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
      LEFT JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id AND ts.supervisor_order = 1
      LEFT JOIN dosen d ON ts.dosen_id = d.id
      WHERE tp.mahasiswa_id = $1
      AND gs.scheduled_date >= $2 
      AND gs.scheduled_date <= $3
      AND gs.status IN ('APPROVED', 'PENDING')
    `;
    
    const guidanceParams = [mahasiswaId, dateStart, dateEnd];
    
    if (excludeId) {
      guidanceQuery += ' AND gs.id != $4';
      guidanceParams.push(excludeId);
    }

    const guidanceSessionsResult = await db.query(guidanceQuery, guidanceParams);

    for (const session of guidanceSessionsResult.rows) {
      if (this.isTimeOverlap(startTime, endTime, session.start_time, session.end_time)) {
        conflicts.push({
          type: 'guidance',
          session: {
            dosenName: session.dosen_nama,
            dosenNip: session.dosen_nip,
            startTime: session.start_time,
            endTime: session.end_time,
            location: session.location
          }
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      conflictType: conflicts.length > 0 ? conflicts[0].type : null
    };
  }

  /**
   * Cek ketersediaan slot waktu dosen
   * @param {string} dosenId - ID dosen
   * @param {Date} date - Tanggal
   * @param {string} startTime - Waktu mulai
   * @param {string} endTime - Waktu selesai
   * @returns {Object} - { isAvailable, reason }
   */
  async checkDosenAvailability(dosenId, date, startTime, endTime) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const result = await db.query(
      `SELECT * FROM dosen_availabilities
       WHERE dosen_id = $1
       AND ((specific_date >= $2 AND specific_date <= $3) OR (day_of_week = $4 AND is_recurring = true))
       AND start_time <= $5
       AND end_time >= $6
       AND is_active = true
       LIMIT 1`,
      [dosenId, dateStart, dateEnd, this.getDayOfWeek(date), startTime, endTime]
    );

    if (result.rows.length === 0) {
      return {
        isAvailable: false,
        reason: 'Dosen tidak memiliki slot ketersediaan pada waktu tersebut'
      };
    }

    return { isAvailable: true, reason: null };
  }

  /**
   * Validasi jadwal bimbingan sebelum dibuat/diupdate
   * @param {Object} scheduleData - Data jadwal
   * @returns {Object} - { isValid, errors }
   */
  async validateGuidanceSchedule(scheduleData) {
    const { dosenId, mahasiswaId, date, startTime, endTime, excludeId } = scheduleData;
    const errors = [];

    // 1. Cek apakah tanggal di masa lalu
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      errors.push({
        field: 'date',
        message: 'Tidak dapat menjadwalkan bimbingan di masa lalu'
      });
    }

    // 2. Validasi format waktu
    if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
      errors.push({
        field: 'time',
        message: 'Format waktu tidak valid (gunakan HH:mm)'
      });
    }

    // 3. Validasi durasi minimum (misalnya 30 menit)
    const duration = this.calculateDuration(startTime, endTime);
    if (duration < 30) {
      errors.push({
        field: 'duration',
        message: 'Durasi bimbingan minimal 30 menit'
      });
    }

    // 4. Cek konflik jadwal dosen
    const dosenConflict = await this.checkDosenScheduleConflict(
      dosenId, 
      new Date(date), 
      startTime, 
      endTime, 
      excludeId
    );

    if (dosenConflict.hasConflict) {
      errors.push({
        field: 'schedule',
        message: 'Dosen memiliki konflik jadwal',
        conflicts: dosenConflict.conflicts
      });
    }

    // 5. Cek konflik jadwal mahasiswa
    const mahasiswaConflict = await this.checkMahasiswaScheduleConflict(
      mahasiswaId, 
      new Date(date), 
      startTime, 
      endTime, 
      excludeId
    );

    if (mahasiswaConflict.hasConflict) {
      errors.push({
        field: 'schedule',
        message: 'Mahasiswa memiliki konflik jadwal',
        conflicts: mahasiswaConflict.conflicts
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Dapatkan slot waktu yang tersedia untuk dosen pada tanggal tertentu
   * @param {string} dosenId - ID dosen
   * @param {Date} date - Tanggal
   * @returns {Array} - Array of available time slots
   */
  async getAvailableSlots(dosenId, date) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Ambil semua availability slots dosen
    const availabilitySlotsResult = await db.query(
      `SELECT * FROM dosen_availabilities
       WHERE dosen_id = $1
       AND ((specific_date >= $2 AND specific_date <= $3) OR (day_of_week = $4 AND is_recurring = true))
       AND is_active = true`,
      [dosenId, dateStart, dateEnd, this.getDayOfWeek(date)]
    );

    if (availabilitySlotsResult.rows.length === 0) {
      return [];
    }

    // Ambil semua jadwal yang sudah terbooked
    const bookedSlots = await this.getBookedSlots(dosenId, date);

    // Filter slot yang available
    const availableSlots = [];
    for (const slot of availabilitySlotsResult.rows) {
      const isBooked = bookedSlots.some(booked => 
        this.isTimeOverlap(slot.start_time, slot.end_time, booked.startTime, booked.endTime)
      );

      if (!isBooked) {
        availableSlots.push({
          startTime: slot.start_time,
          endTime: slot.end_time
        });
      }
    }

    return availableSlots;
  }

  /**
   * Dapatkan slot waktu yang sudah terbooked untuk dosen
   * @param {string} dosenId - ID dosen
   * @param {Date} date - Tanggal
   * @returns {Array} - Array of booked slots
   */
  async getBookedSlots(dosenId, date) {
    const slots = [];
    const dayOfWeek = this.getDayOfWeek(date);

    // Jadwal mengajar
    const teachingSchedulesResult = await db.query(
      `SELECT * FROM dosen_schedules
       WHERE dosen_id = $1 AND day_of_week = $2`,
      [dosenId, dayOfWeek]
    );

    slots.push(...teachingSchedulesResult.rows.map(s => ({
      type: 'teaching',
      startTime: s.start_time,
      endTime: s.end_time
    })));

    // Sesi bimbingan
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const guidanceSessionsResult = await db.query(
      `SELECT gs.* FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       WHERE ts.dosen_id = $1
       AND gs.scheduled_date >= $2 
       AND gs.scheduled_date <= $3
       AND gs.status IN ('APPROVED', 'PENDING')`,
      [dosenId, dateStart, dateEnd]
    );

    slots.push(...guidanceSessionsResult.rows.map(s => ({
      type: 'guidance',
      startTime: s.start_time,
      endTime: s.end_time
    })));

    return slots;
  }

  /**
   * Validasi batch jadwal (untuk import)
   * @param {Array} schedules - Array of schedule objects
   * @returns {Object} - { valid, invalid, errors }
   */
  async validateBatchSchedules(schedules) {
    const valid = [];
    const invalid = [];
    const errors = [];

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      const validation = await this.validateGuidanceSchedule(schedule);

      if (validation.isValid) {
        valid.push(schedule);
      } else {
        invalid.push({
          row: i + 1,
          schedule,
          errors: validation.errors
        });
        errors.push(...validation.errors);
      }
    }

    return { valid, invalid, errors };
  }

  /**
   * Helper: Dapatkan hari dalam minggu (0 = Minggu, 6 = Sabtu)
   */
  getDayOfWeek(date) {
    return new Date(date).getDay();
  }

  /**
   * Helper: Validasi format waktu HH:mm
   */
  isValidTimeFormat(time) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  }

  /**
   * Helper: Hitung durasi dalam menit
   */
  calculateDuration(startTime, endTime) {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    return endMinutes - startMinutes;
  }

  /**
   * Cek apakah mahasiswa memenuhi syarat minimum bimbingan
   * @param {string} mahasiswaId - ID mahasiswa
   * @param {string} thesisType - 'TA1' or 'TA2'
   * @param {string} semesterId - ID semester
   * @returns {Object} - { isSufficient, count, required, breakdown }
   */
  async checkMinimumGuidanceRequirement(mahasiswaId, thesisType, semesterId) {
    // Ambil periode semester
    const semesterResult = await db.query(
      'SELECT * FROM academic_periods WHERE id = $1',
      [semesterId]
    );

    if (semesterResult.rows.length === 0) {
      throw new Error('Semester tidak ditemukan');
    }

    const semester = semesterResult.rows[0];

    // Tentukan syarat minimum berdasarkan jenis TA
    const required = THESIS_REQUIREMENTS[thesisType];

    // Hitung bimbingan sebelum UTS
    const beforeUTSResult = await db.query(
      `SELECT COUNT(*) as count FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       WHERE tp.mahasiswa_id = $1
       AND tp.tipe = $2
       AND gs.status = 'COMPLETED'
       AND gs.scheduled_date >= $3
       AND gs.scheduled_date <= $4`,
      [mahasiswaId, thesisType, semester.start_date, semester.uts_date]
    );

    const beforeUTS = parseInt(beforeUTSResult.rows[0].count);

    // Hitung bimbingan sebelum UAS
    const beforeUASResult = await db.query(
      `SELECT COUNT(*) as count FROM guidance_sessions gs
       JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
       WHERE tp.mahasiswa_id = $1
       AND tp.tipe = $2
       AND gs.status = 'COMPLETED'
       AND gs.scheduled_date > $3
       AND gs.scheduled_date <= $4`,
      [mahasiswaId, thesisType, semester.uts_date, semester.uas_date]
    );

    const beforeUAS = parseInt(beforeUASResult.rows[0].count);
    const totalCount = beforeUTS + beforeUAS;

    return {
      isSufficient: beforeUTS >= required.beforeUTS && beforeUAS >= required.beforeUAS,
      count: {
        beforeUTS,
        beforeUAS,
        total: totalCount
      },
      required: {
        beforeUTS: required.beforeUTS,
        beforeUAS: required.beforeUAS,
        total: required.total
      },
      breakdown: {
        utsRequirementMet: beforeUTS >= required.beforeUTS,
        uasRequirementMet: beforeUAS >= required.beforeUAS,
        totalRequirementMet: totalCount >= required.total
      }
    };
  }

  /**
   * Dapatkan daftar mahasiswa yang tidak memenuhi syarat sidang
   * @param {string} semesterId - ID semester
   * @param {string} thesisType - 'TA1' or 'TA2'
   * @returns {Array} - Array mahasiswa yang tidak memenuhi syarat
   */
  async getInsufficientGuidanceStudents(semesterId, thesisType = null) {
    // Ambil semua mahasiswa aktif di semester ini
    let query = `
      SELECT 
        tp.*,
        m.id as mahasiswa_id,
        m.nama as mahasiswa_nama,
        m.npm as mahasiswa_npm,
        m.email as mahasiswa_email,
        d1.nama as dosen1_nama,
        d1.email as dosen1_email,
        d2.nama as dosen2_nama,
        d2.email as dosen2_email
      FROM thesis_projects tp
      JOIN mahasiswa m ON tp.mahasiswa_id = m.id
      LEFT JOIN thesis_supervisors ts1 ON tp.id = ts1.thesis_project_id AND ts1.supervisor_order = 1
      LEFT JOIN dosen d1 ON ts1.dosen_id = d1.id
      LEFT JOIN thesis_supervisors ts2 ON tp.id = ts2.thesis_project_id AND ts2.supervisor_order = 2
      LEFT JOIN dosen d2 ON ts2.dosen_id = d2.id
      WHERE tp.semester = $1
    `;
    
    const params = [semesterId];
    
    if (thesisType) {
      query += ' AND tp.tipe = $2';
      params.push(thesisType);
    }

    const studentsResult = await db.query(query, params);
    const students = studentsResult.rows;

    const insufficientStudents = [];

    for (const project of students) {
      const requirement = await this.checkMinimumGuidanceRequirement(
        project.mahasiswa_id,
        project.tipe,
        semesterId
      );

      if (!requirement.isSufficient) {
        insufficientStudents.push({
          mahasiswa: {
            id: project.mahasiswa_id,
            nama: project.mahasiswa_nama,
            npm: project.mahasiswa_npm,
            email: project.mahasiswa_email
          },
          thesisType: project.tipe,
          thesisTitle: project.judul,
          supervisors: [
            project.dosen1_nama ? { nama: project.dosen1_nama, email: project.dosen1_email } : null,
            project.dosen2_nama ? { nama: project.dosen2_nama, email: project.dosen2_email } : null
          ].filter(Boolean),
          guidanceCount: requirement.count,
          required: requirement.required,
          breakdown: requirement.breakdown
        });
      }
    }

    return insufficientStudents;
  }

  /**
   * Generate laporan jadwal untuk periode tertentu
   * @param {Object} filters - Filter options
   * @returns {Object} - Report data
   */
  async generateScheduleReport(filters) {
    const { startDate, endDate, dosenId, mahasiswaId, status } = filters;

    let query = `
      SELECT 
        gs.*,
        d.nama as dosen_nama,
        d.nip as dosen_nip,
        m.nama as mahasiswa_nama,
        m.npm as mahasiswa_npm
      FROM guidance_sessions gs
      JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
      JOIN mahasiswa m ON tp.mahasiswa_id = m.id
      LEFT JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id AND ts.supervisor_order = 1
      LEFT JOIN dosen d ON ts.dosen_id = d.id
      WHERE gs.scheduled_date >= $1 AND gs.scheduled_date <= $2
    `;

    const params = [startDate, endDate];
    let paramCount = 2;

    if (dosenId) {
      paramCount++;
      query += ` AND ts.dosen_id = ${paramCount}`;
      params.push(dosenId);
    }

    if (mahasiswaId) {
      paramCount++;
      query += ` AND tp.mahasiswa_id = ${paramCount}`;
      params.push(mahasiswaId);
    }

    if (status) {
      paramCount++;
      query += ` AND gs.status = ${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY gs.scheduled_date ASC, gs.start_time ASC';

    const sessionsResult = await db.query(query, params);
    const sessions = sessionsResult.rows;

    // Agregasi data
    const statistics = {
      total: sessions.length,
      byStatus: {},
      byDosen: {},
      byMonth: {},
      averageDuration: 0
    };

    sessions.forEach(session => {
      // Count by status
      statistics.byStatus[session.status] = (statistics.byStatus[session.status] || 0) + 1;

      // Count by dosen
      const dosenName = session.dosen_nama || 'Unknown';
      if (!statistics.byDosen[dosenName]) {
        statistics.byDosen[dosenName] = { count: 0, nip: session.dosen_nip };
      }
      statistics.byDosen[dosenName].count++;

      // Count by month
      const month = new Date(session.scheduled_date).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      statistics.byMonth[month] = (statistics.byMonth[month] || 0) + 1;

      // Calculate duration
      if (session.start_time && session.end_time) {
        statistics.averageDuration += this.calculateDuration(session.start_time, session.end_time);
      }
    });

    if (sessions.length > 0) {
      statistics.averageDuration = Math.round(statistics.averageDuration / sessions.length);
    }

    return {
      sessions,
      statistics
    };
  }
}

module.exports = new ScheduleService();