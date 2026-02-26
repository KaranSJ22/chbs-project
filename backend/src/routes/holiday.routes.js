const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/holidays', authMiddleware, holidayController.getAllHolidays);

module.exports = router;