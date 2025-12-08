// routes/dosen.routes.js
const express = require('express');
const router = express.Router();
const dosenController = require('../controllers/dosen.controller');
const guidanceController = require('../controllers/guidance.controller');
const scheduleController = require('../controllers/schedule.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and dosen role
router.use(authenticate);
router.use(authorize('DOSEN'));

// ===== DASHBOARD =====
router.get('/dashboard', dosenController.getDashboard);

// ===== STUDENTS =====
router.get('/students', guidanceController.getStudents);
router.get('/students/:mahasiswaId/progress', dosenController.getStudentProgress);

// ===== TEACHING SCHEDULES =====
router.get('/schedules', scheduleController.getDosenSchedules);
router.post('/schedules', scheduleController.addDosenSchedule);
router.put('/schedules/:id', scheduleController.updateDosenSchedule);
router.delete('/schedules/:id', scheduleController.deleteDosenSchedule);

// ===== AVAILABILITIES =====
router.get('/availabilities', scheduleController.getAvailabilities);
router.post('/availabilities', scheduleController.createAvailability);
router.put('/availabilities/:id', scheduleController.updateAvailability);
router.delete('/availabilities/:id', scheduleController.deleteAvailability);
router.patch('/availabilities/:id/toggle', scheduleController.toggleAvailability);

// ===== GUIDANCE SESSIONS =====
router.get('/sessions', guidanceController.getDosenSessions);
router.post('/sessions', dosenController.createSession);
router.put('/sessions/:id', dosenController.updateSession);
router.post('/sessions/:sessionId/approve', guidanceController.approveSession);
router.post('/sessions/:sessionId/reject', guidanceController.rejectSession);
router.post('/sessions/:sessionId/notes', guidanceController.addNotes);
router.get('/sessions/:id', dosenController.getSessionDetail);

module.exports = router;