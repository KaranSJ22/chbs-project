const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication (NORMAL, ADMIN, or PA)
router.post('/', authMiddleware, bookingController.createBooking);

router.get('/dashboard', authMiddleware, bookingController.getUserDashboard);
router.get('/history', authMiddleware, bookingController.getBookingHistory);
router.get('/timeline', authMiddleware, bookingController.getTimelineBookings); // ?date=YYYY-MM-DD

router.post('/cancel', authMiddleware, bookingController.cancelBooking);
module.exports = router;