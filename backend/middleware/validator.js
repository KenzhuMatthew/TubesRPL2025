// middleware/validator.js
const Joi = require('joi');

// Validation schemas
const schemas = {
  // User validation
  createUser: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Format email tidak valid',
      'any.required': 'Email harus diisi'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password minimal 8 karakter',
      'any.required': 'Password harus diisi'
    }),
    role: Joi.string().valid('ADMIN', 'DOSEN', 'MAHASISWA').required().messages({
      'any.only': 'Role tidak valid',
      'any.required': 'Role harus dipilih'
    }),
    nama: Joi.string().required().messages({
      'any.required': 'Nama harus diisi'
    }),
    nip: Joi.string().pattern(/^\d{10}$/).messages({
      'string.pattern.base': 'NIP/NIDN harus 10 digit angka'
    }),
    npm: Joi.string().pattern(/^\d{10}$/).messages({
      'string.pattern.base': 'NPM harus 10 digit angka'
    }),
    phone: Joi.string().allow('', null),
    angkatan: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).messages({
      'number.min': 'Angkatan tidak valid',
      'number.max': 'Angkatan tidak valid'
    })
  }),

  updateUser: Joi.object({
    email: Joi.string().email().messages({
      'string.email': 'Format email tidak valid'
    }),
    nama: Joi.string(),
    nip: Joi.string().pattern(/^\d{10}$/).messages({
      'string.pattern.base': 'NIP/NIDN harus 10 digit angka'
    }),
    npm: Joi.string().pattern(/^\d{10}$/).messages({
      'string.pattern.base': 'NPM harus 10 digit angka'
    }),
    phone: Joi.string().allow('', null),
    angkatan: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).messages({
      'number.min': 'Angkatan tidak valid',
      'number.max': 'Angkatan tidak valid'
    })
  }),

  // Schedule validation
  createSchedule: Joi.object({
    day: Joi.string().valid('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU').required(),
    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
      'string.pattern.base': 'Format waktu tidak valid (HH:MM)'
    }),
    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
      'string.pattern.base': 'Format waktu tidak valid (HH:MM)'
    }),
    courseCode: Joi.string().required(),
    courseName: Joi.string().required(),
    room: Joi.string().required(),
    semester: Joi.string().required()
  }),

  // Guidance session validation
  createGuidanceSession: Joi.object({
    thesisProjectId: Joi.number().integer().required(),
    scheduledDate: Joi.date().iso().required(),
    scheduledTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    location: Joi.string().required(),
    notes: Joi.string().allow('', null)
  }),

  updateGuidanceSession: Joi.object({
    scheduledDate: Joi.date().iso(),
    scheduledTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    location: Joi.string(),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
  }),

  // Academic period validation
  createAcademicPeriod: Joi.object({
    semester: Joi.string().required().messages({
      'any.required': 'Semester harus diisi'
    }),
    startDate: Joi.date().iso().required().messages({
      'any.required': 'Tanggal mulai harus diisi'
    }),
    endDate: Joi.date().iso().required().messages({
      'any.required': 'Tanggal selesai harus diisi'
    }),
    utsDate: Joi.date().iso().required().messages({
      'any.required': 'Tanggal UTS harus diisi'
    }),
    uasDate: Joi.date().iso().required().messages({
      'any.required': 'Tanggal UAS harus diisi'
    })
  }),

  // Room validation
  createRoom: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Nama ruangan harus diisi'
    }),
    building: Joi.string().required().messages({
      'any.required': 'Gedung harus diisi'
    }),
    capacity: Joi.number().integer().min(1).allow(null)
  })
};

// Middleware function
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({ 
        message: 'Validation schema not found' 
      });
    }

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        message: 'Validasi gagal',
        errors
      });
    }

    next();
  };
};

// Custom validators
const validateNPM = (npm) => {
  const re = /^\d{10}$/;
  return re.test(npm);
};

const validateNIDN = (nidn) => {
  const re = /^\d{10}$/;
  return re.test(nidn);
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

module.exports = {
  validate,
  schemas,
  validateNPM,
  validateNIDN,
  validateEmail
};