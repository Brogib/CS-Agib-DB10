const UserService = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const redisClient = require("../database/redis");
const pool = require("../database/db");


class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await UserService.login(email, password);
      // Return only user data (no token) for /user/login
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { id, name, username, email, phone, password, balance } = req.body;
      const updatedUser = await UserService.updateProfile(id, { name, username, email, phone, password, balance });
      // number 3 answer
      const key = `user:${email}`;
      await redisClient.del(key);
      console.log("CACHE DELETED");
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.user.userId;
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  }
    // added part for number 2 
    static async getUserByEmail(req, res, next) {
    const { email } = req.params;
    const key = `user:${email}`;

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        console.log("CACHE HIT");
        return res.status(200).json({
          success: true,
          message: "User retrieved (cache)",
          payload: JSON.parse(cached),
        });
      }

      console.log("CACHE MISS");

      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        throw new AppError("User not found", 404);
      }

      await redisClient.setEx(key, 60, JSON.stringify(user));

      return res.status(200).json({
        success: true,
        message: "User retrieved (db)",
        payload: user,
      });

    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = UserController;