const db = require('../config/database');

class User {
  static async create({ name, username, email, phone, password }) {
    const result = await db.query(
      'INSERT INTO users (name, username, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, phone, balance, created_at',
      [name, username, email, phone, password]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, name, username, email, phone, balance, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { name, username, email, phone, password, balance }) {
    const result = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name), 
        username = COALESCE($2, username), 
        email = COALESCE($3, email), 
        phone = COALESCE($4, phone), 
        password = COALESCE($5, password), 
        balance = COALESCE($6, balance) 
      WHERE id = $7 
      RETURNING id, name, username, email, phone, balance`,
      [name, username, email, phone, password, balance, id]
    );
    return result.rows[0];
  }

  static async getTransactionHistory(userId) {
    const result = await db.query(
      `SELECT t.id, i.name AS item_name, t.quantity, t.total, t.status, t.created_at
       FROM transactions t
       JOIN items i ON t.item_id = i.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getTotalSpent(userId) {
    const result = await db.query(
      `SELECT COALESCE(SUM(total), 0) AS total_spent
       FROM transactions
       WHERE user_id = $1 AND status = 'paid'`,
      [userId]
    );
    return parseInt(result.rows[0].total_spent, 10);
  }

  static async updateBalance(id, newBalance) {
    const result = await db.query(
      'UPDATE users SET balance = $1 WHERE id = $2 RETURNING balance',
      [newBalance, id]
    );
    return result.rows[0].balance;
  }

  static async getTopUsers(limit = 10) {
    const result = await db.query(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.balance,
              COALESCE(SUM(t.total), 0) AS total_spent,
              RANK() OVER (ORDER BY COALESCE(SUM(t.total), 0) DESC) AS rank
       FROM users u
       LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'paid'
       GROUP BY u.id
       ORDER BY total_spent DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getItemsSold() {
    const result = await db.query(
      `SELECT i.id, i.name, i.price, i.stock,
              COALESCE(SUM(t.quantity), 0) AS total_quantity_sold,
              COALESCE(SUM(t.total), 0) AS total_revenue
       FROM items i
       LEFT JOIN transactions t ON i.id = t.item_id AND t.status = 'paid'
       GROUP BY i.id
       ORDER BY total_revenue DESC`
    );
    return result.rows;
  }

  static async getMonthlySales(year) {
    const result = await db.query(
      `SELECT DATE_TRUNC('month', created_at) AS month,
              COUNT(*) AS transaction_count,
              SUM(total) AS total_revenue
       FROM transactions
       WHERE status = 'paid'
         AND EXTRACT(YEAR FROM created_at) = $1
       GROUP BY month
       ORDER BY month`,
      [year]
    );
    return result.rows;
  }
}

module.exports = User;