const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const meetingTypeController = require('../controllers/meetingTypeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');


router.get('/pending', authMiddleware, requireRole('ADMIN'), adminController.getPendingBookings);
router.post('/decide', authMiddleware, requireRole('ADMIN'), adminController.decideBooking);
router.post('/cancel', authMiddleware, requireRole('ADMIN'), adminController.adminCancelBooking);
router.post('/hall', authMiddleware, requireRole('ADMIN'), adminController.addHall);
router.put('/hall', authMiddleware, requireRole('ADMIN'), adminController.editHall);
// router.post('/user', authMiddleware, requireRole('ADMIN'), adminController.addUser);
router.post('/meet-type', authMiddleware, requireRole('ADMIN'), meetingTypeController.addMeetingType);
router.put('/meet-type', authMiddleware, requireRole('ADMIN'), adminController.editMeetingType);


module.exports = router;
