const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/authMiddleware');

// router.get('/holidays', authMiddleware, holidayController.getAllHolidays);

router.get('/holidays/monthly',authMiddleware,holidayController.getMonthlyCalendarData);

module.exports = router;