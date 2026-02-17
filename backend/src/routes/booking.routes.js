const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/dashboard/:empCode', bookingController.getUserDashboard);
router.post('/cancel', bookingController.cancelBooking);
router.put('/status', bookingController.updateStatus);

module.exports = router;