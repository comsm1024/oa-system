const db = require('../config/database');

const userController = {
  // 获取用户列表
  async getUsers(req, res) {
    try {
      const [users] = await db.query('SELECT * FROM users');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  },

  // 获取单个用户
  async getUserById(req, res) {
    try {
      const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
  },

  // 创建用户
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, role]
      );
      res.status(201).json({ id: result.insertId, username, email, role });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  },

  // 更新用户
  async updateUser(req, res) {
    try {
      const { username, email, role } = req.body;
      await db.query(
        'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
        [username, email, role, req.params.id]
      );
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  },

  // 删除用户
  async deleteUser(req, res) {
    try {
      await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
};

module.exports = userController;