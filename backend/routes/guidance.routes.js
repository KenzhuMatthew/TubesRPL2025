// routes/guidance.routes.js
const express = require('express');
const router = express.Router();
const guidanceController = require('../controllers/guidance.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Mahasiswa routes
router.get(
  '/mahasiswa/available-slots',
  authorize('MAHASISWA'),
  guidanceController.getAvailableSlots
);

router.post(
  '/mahasiswa/sessions/request',
  authorize('MAHASISWA'),
  guidanceController.requestSession
);

router.get(
  '/mahasiswa/sessions',
  authorize('MAHASISWA'),
  guidanceController.getMahasiswaSessions
);

router.get(
  '/mahasiswa/progress',
  authorize('MAHASISWA'),
  guidanceController.getMahasiswaProgress
);

// Dosen routes
router.get(
  '/dosen/sessions',
  authorize('DOSEN'),
  guidanceController.getDosenSessions
);

router.post(
  '/dosen/sessions/:sessionId/approve',
  authorize('DOSEN'),
  guidanceController.approveSession
);

router.post(
  '/dosen/sessions/:sessionId/reject',
  authorize('DOSEN'),
  guidanceController.rejectSession
);

router.post(
  '/dosen/sessions/:sessionId/notes',
  authorize('DOSEN'),
  guidanceController.addNotes
);

router.get(
  '/dosen/students',
  authorize('DOSEN'),
  guidanceController.getStudents
);

module.exports = router;