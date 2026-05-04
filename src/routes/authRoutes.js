const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Rate limiting is applied globally in app.js for /auth
router.post('/login', AuthController.login);

module.exports = router;