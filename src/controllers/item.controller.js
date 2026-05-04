const ItemService = require('../services/item.service');

class ItemController {
  static async getAllItems(req, res, next) {
    try {
      const items = await ItemService.getAllItems();
      res.status(200).json({
        success: true,
        message: 'Items retrieved successfully',
        payload: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await ItemService.getItemById(id);
      res.status(200).json({
        success: true,
        message: 'Item retrieved successfully',
        payload: item,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req, res, next) {
    try {
      const { name, price, stock } = req.body;
      const item = await ItemService.createItem({ name, price, stock });
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        payload: item,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const item = await ItemService.updateItem(id, updateData);
      res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        payload: item,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ItemController;