const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller'); //added for number 2
const { authenticateToken } = require('../middleware/authMiddleware');
const { userRegistrationValidation, userUpdateValidation, validate } = require('../utils/validators');
const { getUserByEmail } = require("../controllers/user.controller"); //added for number 2

// Public routes
router.post('/register', userRegistrationValidation, validate, UserController.register);
router.post('/login', UserController.login);
router.get("/:email", UserController.getUserByEmail); //added for number 2

// Protected routes
router.put('/update', authenticateToken, userUpdateValidation, validate, UserController.updateProfile);
router.get('/history', authenticateToken, UserController.getTransactionHistory);
router.get('/total-spent', authenticateToken, UserController.getTotalSpent);

module.exports = router;

