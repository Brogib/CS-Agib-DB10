const db = require('../config/database');

class Item {
  static async findAll() {
    const result = await db.query('SELECT * FROM items ORDER BY id');
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create({ name, price, stock }) {
    const result = await db.query(
      'INSERT INTO items (name, price, stock) VALUES ($1, $2, $3) RETURNING *',
      [name, price, stock]
    );
    return result.rows[0];
  }

  static async update(id, { name, price, stock }) {
    const result = await db.query(
      'UPDATE items SET name = COALESCE($1, name), price = COALESCE($2, price), stock = COALESCE($3, stock) WHERE id = $4 RETURNING *',
      [name, price, stock, id]
    );
    return result.rows[0];
  }

  static async decreaseStock(id, quantity) {
    const result = await db.query(
      'UPDATE items SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock',
      [quantity, id]
    );
    return result.rows[0];
  }
}

module.exports = Item;