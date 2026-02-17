const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/pending', adminController.getPendingBookings);

router.post('/decide', adminController.decideBooking); 
router.post('/hall', adminController.addHall);         
router.post('/user', adminController.addUser);      

module.exports = router;