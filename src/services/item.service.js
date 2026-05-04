const Item = require('../models/item.model');
const { AppError } = require('../middleware/errorHandler');

class ItemService {
  static async getAllItems() {
    return await Item.findAll();
  }

  static async getItemById(id) {
    const item = await Item.findById(id);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  }

  static async createItem({ name, price, stock }) {
    return await Item.create({ name, price, stock });
  }

  static async updateItem(id, updateData) {
    const item = await Item.update(id, updateData);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  }
}

module.exports = ItemService;