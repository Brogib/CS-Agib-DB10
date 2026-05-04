const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');
const { authenticateToken } = require('../middleware/authMiddleware');
const { transactionCreationValidation, transactionIdValidation, validate } = require('../utils/validators');

// All transaction routes are protected
router.post('/create', authenticateToken, transactionCreationValidation, validate, TransactionController.createTransaction);
router.get('/:id', authenticateToken, transactionIdValidation, validate, TransactionController.getTransactionById);
router.post('/pay/:id', authenticateToken, transactionIdValidation, validate, TransactionController.payTransaction);
router.delete('/:id', authenticateToken, transactionIdValidation, validate, TransactionController.deleteTransaction);

module.exports = router;