const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authController = {
  // 登录
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查询用户
      const [users] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      // 生成token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回用户信息和token
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        code: 0,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        code: 500,
        message: '登录失败',
        data: null,
        error: error.message 
      });
    }
  },

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const [users] = await db.query(
        'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      res.json({
        code: 0,
        message: '获取用户信息成功',
        data: users[0]
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        code: 500,
        message: '获取用户信息失败',
        data: null,
        error: error.message 
      });
    }
  }
};

module.exports = authController; 