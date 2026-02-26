const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const hallRoutes = require('./hall.routes');
const bookingRoutes = require('./booking.routes');
const meetingTypeRoutes = require('./meetingType.routes');
const adminRoutes = require('./admin.routes');
const holidayRoutes = require('./holiday.routes');
const userRoutes = require('./user.routes');

// Auth routes (login + login-pa are public, logout/me are protected)
router.use('/auth', authRoutes);

// All routes are protected by middleware
router.use('/halls', hallRoutes);
router.use('/bookings', bookingRoutes);
router.use('/meeting-types', meetingTypeRoutes);
router.use('/admin', adminRoutes);
router.use('/calendar', holidayRoutes);
router.use('/users', userRoutes);

module.exports = router;
