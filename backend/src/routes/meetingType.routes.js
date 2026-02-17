const express = require('express');
const router = express.Router();
const meetingTypeController = require('../controllers/meetingTypeController');

router.get('/', meetingTypeController.getAllMeetingTypes);

module.exports = router;
