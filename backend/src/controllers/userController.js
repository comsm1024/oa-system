const sequelize = require('../config/sequelize');
const response = require('../utils/response');
const User = require('../models/user');
const Department = require('../models/department');
const { Op } = require('sequelize');

const userController = {
  // 获取用户列表
  async getUsers(req, res) {
    try {
      const { page = 1, pageSize = 10, search } = req.query;
      const offset = (page - 1) * pageSize;

      const where = {};
      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows: users, count } = await User.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        raw: false // 确保返回模型实例而不是原始数据
      });

      res.json(response.success({
        list: users,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }));
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json(response.error('获取用户列表失败', error.message));
    }
  },

  // 获取单个用户
  async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }]
      });
      
      if (!user) {
        return res.status(404).json(response.error('用户不存在'));
      }
      
      res.json(response.success(user));
    } catch (error) {
      res.status(500).json(response.error('获取用户信息失败', error.message));
    }
  },

  // 创建用户
  async createUser(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { username, email, password, role, departments } = req.body;
      
      // 确保 departments 是数组且不为空
      if (!Array.isArray(departments) || departments.length === 0) {
        throw new Error('必须指定至少一个部门');
      }

      const user = await User.create({
        username,
        password: password || '123456',
        email,
        role,
        departments
      }, { transaction });

      await transaction.commit();
      res.json(response.success(user, '用户创建成功'));
    } catch (error) {
      await transaction.rollback();
      res.status(500).json(response.error('用户创建失败', error.message));
    }
  },

  // 更新用户
  async updateUser(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { username, fullName, email, role, departments } = req.body;
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.json(response.error('用户不存在', 400));
      }

      if (!fullName) {
        return res.json(response.badRequest('姓名不能为空', 400));
      }

      // 确保 departments 是数组且不为空
      if (!Array.isArray(departments) || departments.length === 0) {
        throw new Error('必须指定至少一个部门');
      }

      await user.update({
        username,
        fullName,
        email,
        role,
        departments
      }, { transaction });

      await transaction.commit();
      res.json(response.success(user, '用户更新成功'));
    } catch (error) {
      await transaction.rollback();
      res.status(500).json(response.error('用户更新失败'));
    }
  },

  // 删除用户
  async deleteUser(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const result = await User.destroy({
        where: { id: req.params.id },
        transaction
      });

      if (!result) {
        return res.status(404).json(response.error('用户不存在'));
      }

      await transaction.commit();
      res.json(response.success(null, '用户删除成功'));
    } catch (error) {
      await transaction.rollback();
      res.status(500).json(response.error('用户删除失败', error.message));
    }
  }
};

module.exports = userController;