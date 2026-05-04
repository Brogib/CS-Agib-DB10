const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/item.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);

// Protected routes (optional: add admin middleware)
router.post('/', authenticateToken, ItemController.createItem);
router.put('/:id', authenticateToken, ItemController.updateItem);

module.exports = router;