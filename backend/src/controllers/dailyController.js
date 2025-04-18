const db = require('../config/database');

const dailyController = {
  // 获取日常任务列表
  async getTasks(req, res) {
    try {
      const [tasks] = await db.query(`
        SELECT t.*, u.username as creator_name 
        FROM daily_tasks t
        LEFT JOIN users u ON t.creator_id = u.id
        ORDER BY t.created_at DESC
      `);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
  },

  // 获取单个任务
  async getTaskById(req, res) {
    try {
      const [task] = await db.query(`
        SELECT t.*, u.username as creator_name 
        FROM daily_tasks t
        LEFT JOIN users u ON t.creator_id = u.id
        WHERE t.id = ?
      `, [req.params.id]);
      
      if (task.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
  },

  // 创建任务
  async createTask(req, res) {
    try {
      const { title, description, priority, due_date, creator_id, assignee_id } = req.body;
      const [result] = await db.query(
        'INSERT INTO daily_tasks (title, description, priority, due_date, creator_id, assignee_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, priority, due_date, creator_id, assignee_id]
      );
      res.status(201).json({ 
        id: result.insertId, 
        title, 
        description, 
        priority, 
        due_date, 
        creator_id,
        assignee_id
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating task', error: error.message });
    }
  },

  // 更新任务
  async updateTask(req, res) {
    try {
      const { title, description, priority, due_date, status, assignee_id } = req.body;
      await db.query(
        'UPDATE daily_tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, assignee_id = ? WHERE id = ?',
        [title, description, priority, due_date, status, assignee_id, req.params.id]
      );
      res.json({ message: 'Task updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating task', error: error.message });
    }
  },

  // 删除任务
  async deleteTask(req, res) {
    try {
      await db.query('DELETE FROM daily_tasks WHERE id = ?', [req.params.id]);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
  },

  // 更新任务状态
  async updateTaskStatus(req, res) {
    try {
      const { status } = req.body;
      await db.query(
        'UPDATE daily_tasks SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
      res.json({ message: 'Task status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
  }
};

module.exports = dailyController; 