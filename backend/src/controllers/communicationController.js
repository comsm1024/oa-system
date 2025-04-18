const db = require('../config/database');

const communicationController = {
  // 获取消息列表
  async getMessages(req, res) {
    try {
      const [messages] = await db.query(`
        SELECT m.*, 
               u1.username as sender_name,
               u2.username as receiver_name
        FROM messages m
        LEFT JOIN users u1 ON m.sender_id = u1.id
        LEFT JOIN users u2 ON m.receiver_id = u2.id
        ORDER BY m.created_at DESC
      `);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  },

  // 获取单个消息
  async getMessageById(req, res) {
    try {
      const [message] = await db.query(`
        SELECT m.*, 
               u1.username as sender_name,
               u2.username as receiver_name
        FROM messages m
        LEFT JOIN users u1 ON m.sender_id = u1.id
        LEFT JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.id = ?
      `, [req.params.id]);
      
      if (message.length === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching message', error: error.message });
    }
  },

  // 发送消息
  async sendMessage(req, res) {
    try {
      const { sender_id, receiver_id, content, type } = req.body;
      const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)',
        [sender_id, receiver_id, content, type]
      );
      res.status(201).json({ 
        id: result.insertId, 
        sender_id, 
        receiver_id, 
        content, 
        type 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error sending message', error: error.message });
    }
  },

  // 更新消息状态（已读/未读）
  async updateMessageStatus(req, res) {
    try {
      const { status } = req.body;
      await db.query(
        'UPDATE messages SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
      res.json({ message: 'Message status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating message status', error: error.message });
    }
  },

  // 删除消息
  async deleteMessage(req, res) {
    try {
      await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
  }
};

module.exports = communicationController; 