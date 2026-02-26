const express = require('express');
const router = express.Router();
const meetingTypeController = require('../controllers/meetingTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, meetingTypeController.getAllMeetingTypes);

module.exports = router;
