// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// ===== USER MANAGEMENT =====
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);
router.post('/users/:id/reset-password', adminController.resetPassword);

// ===== DATA IMPORT =====
router.post(
  '/import/schedules',
  upload.single('file'),
  adminController.importDosenSchedules
);
router.post(
  '/import/students',
  upload.single('file'),
  adminController.importStudentData
);
router.post(
  '/import/thesis-projects',
  upload.single('file'),
  adminController.importThesisProjects
);

// ===== MONITORING & REPORTS =====
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/monitoring', adminController.getMonitoringReport);
router.get('/monitoring/not-meeting-requirements', adminController.getStudentsNotMeetingRequirements);
router.get('/monitoring/export', adminController.exportMonitoringReport);

// ===== ACADEMIC PERIOD MANAGEMENT =====
router.get('/academic-periods', adminController.getAcademicPeriods);
router.get('/academic-periods/active', adminController.getActivePeriod);
router.post('/academic-periods', adminController.createAcademicPeriod);
router.put('/academic-periods/:id', adminController.updateAcademicPeriod);
router.post('/academic-periods/:id/activate', adminController.setActivePeriod);
router.delete('/academic-periods/:id', adminController.deleteAcademicPeriod);

// ===== ROOM MANAGEMENT =====
router.get('/rooms', adminController.getRooms);
router.post('/rooms', adminController.createRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

module.exports = router;