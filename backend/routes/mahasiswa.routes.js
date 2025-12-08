// routes/mahasiswa.routes.js
const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controllers/mahasiswa.controller');
const guidanceController = require('../controllers/guidance.controller');
const scheduleController = require('../controllers/schedule.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and mahasiswa role
router.use(authenticate);
router.use(authorize('MAHASISWA'));

// ===== DASHBOARD =====
router.get('/dashboard', mahasiswaController.getDashboard);

// ===== COURSE SCHEDULES =====
router.get('/schedules', scheduleController.getMahasiswaSchedules);
router.post('/schedules', scheduleController.addMahasiswaSchedule);
router.put('/schedules/:id', scheduleController.updateMahasiswaSchedule);
router.delete('/schedules/:id', scheduleController.deleteMahasiswaSchedule);

// ===== SUPERVISORS =====
router.get('/supervisors', mahasiswaController.getSupervisors);

// ===== GUIDANCE SESSIONS =====
router.get('/available-slots', guidanceController.getAvailableSlots);
router.post('/sessions/request', guidanceController.requestSession);
router.get('/sessions', guidanceController.getMahasiswaSessions);
router.get('/sessions/:id', mahasiswaController.getSessionDetail);
router.put('/sessions/:id', mahasiswaController.updateSessionRequest);
router.delete('/sessions/:id', mahasiswaController.cancelSession);

// ===== PROGRESS =====
router.get('/progress', guidanceController.getMahasiswaProgress);

module.exports = router;