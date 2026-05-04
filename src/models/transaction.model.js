const db = require('../config/database');

class Transaction {
  static async create({ user_id, item_id, quantity, total, description }) {
    const result = await db.query(
      'INSERT INTO transactions (user_id, item_id, quantity, total, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, item_id, quantity, total, description]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async pay(transactionId, userId) {
    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get transaction and verify ownership
      const transResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [transactionId, userId]
      );
      if (transResult.rows.length === 0) {
        throw new Error('Transaction not found or does not belong to user');
      }
      const transaction = transResult.rows[0];
      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not pending');
      }

      // 2. Get user balance
      const userResult = await client.query(
        'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      const userBalance = parseInt(userResult.rows[0].balance, 10);
      if (userBalance < transaction.total) {
        throw new Error('Insufficient balance');
      }

      // 3. Deduct balance
      const newBalance = userBalance - transaction.total;
      await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);

      // 4. Update transaction status
      await client.query(
        "UPDATE transactions SET status = 'paid' WHERE id = $1",
        [transactionId]
      );

      await client.query('COMMIT');
      return { success: true, newBalance, transactionId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Transaction;