const User = require('../models/user.model');

class ReportController {
  static async getTopUsers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topUsers = await User.getTopUsers(limit);
      res.status(200).json({
        success: true,
        message: 'Top users retrieved successfully',
        payload: topUsers,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsSold(req, res, next) {
    try {
      const itemsSold = await User.getItemsSold();
      res.status(200).json({
        success: true,
        message: 'Items sold retrieved successfully',
        payload: itemsSold,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlySales(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const monthlySales = await User.getMonthlySales(year);
      res.status(200).json({
        success: true,
        message: 'Monthly sales retrieved successfully',
        payload: monthlySales,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;