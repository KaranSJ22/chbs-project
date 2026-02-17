const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');

router.get('/', hallController.getAllHalls);
router.get('/availability', hallController.checkAvailability);
router.put('/status',hallController.updateHallStatus);

module.exports = router;