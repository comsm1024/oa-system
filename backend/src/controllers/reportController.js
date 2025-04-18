const db = require('../config/database');

const reportController = {
  // 获取报表列表
  async getReports(req, res) {
    try {
      const [reports] = await db.query(`
        SELECT r.*, u.username as creator_name 
        FROM reports r
        LEFT JOIN users u ON r.creator_id = u.id
        ORDER BY r.created_at DESC
      `);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
  },

  // 获取单个报表
  async getReportById(req, res) {
    try {
      const [report] = await db.query(`
        SELECT r.*, u.username as creator_name 
        FROM reports r
        LEFT JOIN users u ON r.creator_id = u.id
        WHERE r.id = ?
      `, [req.params.id]);
      
      if (report.length === 0) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching report', error: error.message });
    }
  },

  // 创建报表
  async createReport(req, res) {
    try {
      const { title, content, type, creator_id, period } = req.body;
      const [result] = await db.query(
        'INSERT INTO reports (title, content, type, creator_id, period) VALUES (?, ?, ?, ?, ?)',
        [title, content, type, creator_id, period]
      );
      res.status(201).json({ 
        id: result.insertId, 
        title, 
        content, 
        type, 
        creator_id,
        period
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating report', error: error.message });
    }
  },

  // 更新报表
  async updateReport(req, res) {
    try {
      const { title, content, type, period } = req.body;
      await db.query(
        'UPDATE reports SET title = ?, content = ?, type = ?, period = ? WHERE id = ?',
        [title, content, type, period, req.params.id]
      );
      res.json({ message: 'Report updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating report', error: error.message });
    }
  },

  // 删除报表
  async deleteReport(req, res) {
    try {
      await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
  }
};

module.exports = reportController; 