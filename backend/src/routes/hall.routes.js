const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Any authenticated user: get all halls (admin view) and available halls for booking
router.get('/', authMiddleware, hallController.getAllHalls);

router.get('/available', authMiddleware, hallController.getAvailableHalls);   // ?date=YYYY-MM-DD
router.get('/availability', authMiddleware, hallController.checkAvailability); // ?hallId&date&startSlot&endSlot

// Admin only: disable hall (re-enable is automatic via nightly DB event)
router.put('/status', authMiddleware, requireRole('ADMIN'), hallController.updateHallStatus);

// Admin only: enable hall manually
router.put('/enable', authMiddleware, requireRole('ADMIN'), hallController.enableHall);

module.exports = router;