const db = require('../config/database');

const processController = {
  // 获取流程列表
  async getProcesses(req, res) {
    try {
      const [processes] = await db.query(`
        SELECT p.*, u.username as creator_name 
        FROM processes p
        LEFT JOIN users u ON p.creator_id = u.id
        ORDER BY p.created_at DESC
      `);
      res.json(processes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching processes', error: error.message });
    }
  },

  // 获取单个流程
  async getProcessById(req, res) {
    try {
      const [process] = await db.query(`
        SELECT p.*, u.username as creator_name 
        FROM processes p
        LEFT JOIN users u ON p.creator_id = u.id
        WHERE p.id = ?
      `, [req.params.id]);
      
      if (process.length === 0) {
        return res.status(404).json({ message: 'Process not found' });
      }
      res.json(process[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching process', error: error.message });
    }
  },

  // 创建流程
  async createProcess(req, res) {
    try {
      const { title, description, steps, creator_id, type } = req.body;
      const [result] = await db.query(
        'INSERT INTO processes (title, description, steps, creator_id, type) VALUES (?, ?, ?, ?, ?)',
        [title, description, JSON.stringify(steps), creator_id, type]
      );
      res.status(201).json({ 
        id: result.insertId, 
        title, 
        description, 
        steps, 
        creator_id,
        type
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating process', error: error.message });
    }
  },

  // 更新流程
  async updateProcess(req, res) {
    try {
      const { title, description, steps, type, status } = req.body;
      await db.query(
        'UPDATE processes SET title = ?, description = ?, steps = ?, type = ?, status = ? WHERE id = ?',
        [title, description, JSON.stringify(steps), type, status, req.params.id]
      );
      res.json({ message: 'Process updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating process', error: error.message });
    }
  },

  // 删除流程
  async deleteProcess(req, res) {
    try {
      await db.query('DELETE FROM processes WHERE id = ?', [req.params.id]);
      res.json({ message: 'Process deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting process', error: error.message });
    }
  },

  // 更新流程状态
  async updateProcessStatus(req, res) {
    try {
      const { status } = req.body;
      await db.query(
        'UPDATE processes SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
      res.json({ message: 'Process status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating process status', error: error.message });
    }
  }
};

module.exports = processController; 