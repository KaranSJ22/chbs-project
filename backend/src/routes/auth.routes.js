const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public — no authentication required
router.post('/login', authController.login);    // Employee / Admin login
router.post('/login-pa', authController.loginPA);  // PA login

// Protected valid JWT required
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);


module.exports = router;
