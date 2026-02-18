const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const meetingTypeController=require('../controllers/meetingTypeController');
router.get('/pending', adminController.getPendingBookings);
router.post('/decide', adminController.decideBooking); 
router.post('/hall', adminController.addHall);         
router.post('/user', adminController.addUser);      
router.post('/add-meet',meetingTypeController.addMeetingType);

module.exports = router;