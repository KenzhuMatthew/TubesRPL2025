// services/validation.service.js - Validation Service (PostgreSQL Native)
const db = require('../config/database');
const Joi = require('joi');

class ValidationService {
  /**
   * Validasi input user (create/update)
   */
  validateUserInput(data, isUpdate = false) {
    const schema = Joi.object({
      nama: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().required(),
      password: isUpdate 
        ? Joi.string().min(6).optional() 
        : Joi.string().min(6).required(),
      role: Joi.string().valid('ADMIN', 'DOSEN', 'MAHASISWA').required(),
      npm: Joi.when('role', {
        is: 'MAHASISWA',
        then: Joi.string().required(),
        otherwise: Joi.string().optional()
      }),
      nip: Joi.when('role', {
        is: 'DOSEN',
        then: Joi.string().required(),
        otherwise: Joi.string().optional()
      }),
      phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
      angkatan: Joi.when('role', {
        is: 'MAHASISWA',
        then: Joi.number().integer().required(),
        otherwise: Joi.number().optional()
      })
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input jadwal bimbingan
   */
  validateGuidanceSessionInput(data) {
    const schema = Joi.object({
      mahasiswaId: Joi.string().required(),
      thesisProjectId: Joi.string().required(),
      scheduledDate: Joi.date().min('now').required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      location: Joi.string().max(255).required(),
      sessionType: Joi.string().valid('INDIVIDUAL', 'GROUP').default('INDIVIDUAL'),
      notes: Joi.string().optional()
    }).custom((value, helpers) => {
      // Custom validation: endTime harus lebih besar dari startTime
      const startMinutes = this.timeToMinutes(value.startTime);
      const endMinutes = this.timeToMinutes(value.endTime);
      
      if (endMinutes <= startMinutes) {
        return helpers.error('custom.endTimeBeforeStart');
      }

      // Minimal durasi 30 menit
      if (endMinutes - startMinutes < 30) {
        return helpers.error('custom.minimumDuration');
      }

      return value;
    }, 'time validation').messages({
      'custom.endTimeBeforeStart': 'Waktu selesai harus lebih besar dari waktu mulai',
      'custom.minimumDuration': 'Durasi minimal 30 menit'
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input jadwal mengajar dosen
   */
  validateTeachingScheduleInput(data) {
    const schema = Joi.object({
      dosenId: Joi.string().required(),
      courseName: Joi.string().required(),
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      room: Joi.string().max(100).optional(),
      semester: Joi.string().required()
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input jadwal kuliah mahasiswa
   */
  validateCourseScheduleInput(data) {
    const schema = Joi.object({
      mahasiswaId: Joi.string().required(),
      courseName: Joi.string().required(),
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      semester: Joi.string().required()
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input thesis project
   */
  validateThesisProjectInput(data) {
    const schema = Joi.object({
      mahasiswaId: Joi.string().required(),
      dosen1Id: Joi.string().required(),
      dosen2Id: Joi.string().optional().allow(null),
      judul: Joi.string().min(10).max(500).required(),
      tipe: Joi.string().valid('TA1', 'TA2').required(),
      semester: Joi.string().required(),
      status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').default('ACTIVE')
    }).custom((value, helpers) => {
      // Validasi: dosen1 dan dosen2 tidak boleh sama
      if (value.dosen2Id && value.dosen1Id === value.dosen2Id) {
        return helpers.error('custom.sameSupervisor');
      }
      return value;
    }).messages({
      'custom.sameSupervisor': 'Dosen pembimbing 1 dan 2 tidak boleh sama'
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input availability slot dosen
   */
  validateAvailabilityInput(data) {
    const schema = Joi.object({
      dosenId: Joi.string().required(),
      dayOfWeek: Joi.number().integer().min(0).max(6).optional(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      isRecurring: Joi.boolean().default(true),
      specificDate: Joi.date().optional(),
      isActive: Joi.boolean().default(true)
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input catatan bimbingan
   */
  validateGuidanceNoteInput(data) {
    const schema = Joi.object({
      sessionId: Joi.string().required(),
      dosenId: Joi.string().required(),
      content: Joi.string().min(10).required(),
      tasks: Joi.string().optional()
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi input academic period
   */
  validateAcademicPeriodInput(data) {
    const schema = Joi.object({
      semester: Joi.string().required(), // e.g., "Ganjil 2024/2025"
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      utsDate: Joi.date().greater(Joi.ref('startDate')).less(Joi.ref('endDate')).required(),
      uasDate: Joi.date().greater(Joi.ref('utsDate')).less(Joi.ref('endDate')).required(),
      isActive: Joi.boolean().default(false)
    });

    return schema.validate(data, { abortEarly: false });
  }

  /**
   * Validasi keunikan email
   */
  async validateUniqueEmail(email, excludeUserId = null) {
    let query = 'SELECT id FROM users WHERE email = $1';
    const params = [email];
    
    if (excludeUserId) {
      query += ' AND id != $2';
      params.push(excludeUserId);
    }

    const result = await db.query(query, params);

    if (result.rows.length > 0) {
      return {
        isValid: false,
        message: 'Email sudah terdaftar'
      };
    }

    return { isValid: true };
  }

  /**
   * Validasi keunikan NPM
   */
  async validateUniqueNPM(npm, excludeUserId = null) {
    let query = 'SELECT m.id FROM mahasiswa m';
    const params = [npm];
    
    if (excludeUserId) {
      query += ' WHERE m.npm = $1 AND m.user_id != $2';
      params.push(excludeUserId);
    } else {
      query += ' WHERE m.npm = $1';
    }

    const result = await db.query(query, params);

    if (result.rows.length > 0) {
      return {
        isValid: false,
        message: 'NPM sudah terdaftar'
      };
    }

    return { isValid: true };
  }

  /**
   * Validasi keunikan NIP
   */
  async validateUniqueNIP(nip, excludeUserId = null) {
    let query = 'SELECT d.id FROM dosen d';
    const params = [nip];
    
    if (excludeUserId) {
      query += ' WHERE d.nip = $1 AND d.user_id != $2';
      params.push(excludeUserId);
    } else {
      query += ' WHERE d.nip = $1';
    }

    const result = await db.query(query, params);

    if (result.rows.length > 0) {
      return {
        isValid: false,
        message: 'NIP sudah terdaftar'
      };
    }

    return { isValid: true };
  }

  /**
   * Validasi relasi mahasiswa-dosen
   */
  async validateMahasiswaDosenRelation(mahasiswaId, dosenId) {
    const result = await db.query(
      `SELECT tp.* 
       FROM thesis_projects tp
       JOIN thesis_supervisors ts ON tp.id = ts.thesis_project_id
       WHERE tp.mahasiswa_id = $1 
       AND ts.dosen_id = $2
       AND tp.status = 'ACTIVE'
       LIMIT 1`,
      [mahasiswaId, dosenId]
    );

    if (result.rows.length === 0) {
      return {
        isValid: false,
        message: 'Tidak ada relasi pembimbingan aktif antara mahasiswa dan dosen'
      };
    }

    return { isValid: true, thesisProject: result.rows[0] };
  }

  /**
   * Validasi perubahan status sesi bimbingan
   */
  validateSessionStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = {
      'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['COMPLETED', 'CANCELLED'],
      'REJECTED': [],
      'COMPLETED': [],
      'CANCELLED': []
    };

    const allowed = allowedTransitions[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {
      return {
        isValid: false,
        message: `Tidak dapat mengubah status dari ${currentStatus} ke ${newStatus}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validasi batch import data
   */
  async validateBatchImport(data, type) {
    const errors = [];
    const validRecords = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let validation;

      switch (type) {
        case 'teaching_schedule':
          validation = this.validateTeachingScheduleInput(row);
          break;
        case 'course_schedule':
          validation = this.validateCourseScheduleInput(row);
          break;
        case 'thesis_project':
          validation = this.validateThesisProjectInput(row);
          break;
        case 'user':
          validation = this.validateUserInput(row);
          break;
        default:
          throw new Error(`Tipe import tidak dikenal: ${type}`);
      }

      if (validation.error) {
        errors.push({
          row: i + 1,
          data: row,
          errors: validation.error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        });
      } else {
        validRecords.push(validation.value);
      }
    }

    return {
      isValid: errors.length === 0,
      validRecords,
      invalidRecords: errors,
      summary: {
        total: data.length,
        valid: validRecords.length,
        invalid: errors.length
      }
    };
  }

  /**
   * Validasi perubahan data thesis project
   */
  async validateThesisProjectUpdate(projectId, updates, semester) {
    const result = await db.query(
      'SELECT * FROM thesis_projects WHERE id = $1',
      [projectId]
    );

    if (result.rows.length === 0) {
      return {
        isValid: false,
        message: 'Project tidak ditemukan'
      };
    }

    const project = result.rows[0];

    // Validasi: Tidak bisa mengubah data penting di semester yang sama
    if (project.semester === semester) {
      const restrictedFields = ['judul'];
      const hasRestrictedChanges = restrictedFields.some(field => 
        updates[field] && updates[field] !== project[field]
      );

      if (hasRestrictedChanges) {
        return {
          isValid: false,
          message: 'Tidak dapat mengubah judul di semester yang sedang berjalan'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Helper: Convert time string to minutes
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Sanitize input untuk mencegah XSS
   */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    return input;
  }

  /**
   * Validasi file upload
   */
  validateFileUpload(file, allowedTypes, maxSizeInMB = 5) {
    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: `Tipe file tidak diizinkan. Hanya ${allowedTypes.join(', ')} yang diperbolehkan`
      });
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      errors.push({
        field: 'file',
        message: `Ukuran file terlalu besar. Maksimal ${maxSizeInMB}MB`
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validasi query parameters untuk filtering/pagination
   */
  validateQueryParams(query) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
      search: Joi.string().optional(),
      status: Joi.string().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().when('startDate', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('startDate')),
        otherwise: Joi.date()
      }).optional()
    });

    return schema.validate(query, { abortEarly: false });
  }
}

module.exports = new ValidationService();