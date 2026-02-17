const express = require('express');
const router = express.Router();

const hallRoutes = require('./hall.routes');
const bookingRoutes = require('./booking.routes');
const meetingTypeRoutes = require('./meetingType.routes');
const adminRoutes=require('./admin.routes');
const holidayRouutes=require('./holiday.routes');


router.use('/halls', hallRoutes);
router.use('/bookings', bookingRoutes);
router.use('/meeting-types', meetingTypeRoutes);
router.use('/admin',adminRoutes);
router.use('/calendar',holidayRouutes);


module.exports = router;