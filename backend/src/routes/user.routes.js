const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Accessible to all authenticated roles (NORMAL, ADMIN, PA need it for on-behalf dropdown)
router.get('/all', authMiddleware, requireRole('NORMAL', 'ADMIN', 'PA'), userController.getAllUsers);

module.exports = router;
