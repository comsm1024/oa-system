const db = require('../config/database');

const documentController = {
  // 获取文档列表
  async getDocuments(req, res) {
    try {
      const [documents] = await db.query(`
        SELECT d.*, u.username as creator_name 
        FROM documents d 
        LEFT JOIN users u ON d.creator_id = u.id
      `);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  },

  // 获取单个文档
  async getDocumentById(req, res) {
    try {
      const [document] = await db.query(`
        SELECT d.*, u.username as creator_name 
        FROM documents d 
        LEFT JOIN users u ON d.creator_id = u.id 
        WHERE d.id = ?
      `, [req.params.id]);
      
      if (document.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }
      res.json(document[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
  },

  // 创建文档
  async createDocument(req, res) {
    try {
      const { title, content, category, creator_id } = req.body;
      const [result] = await db.query(
        'INSERT INTO documents (title, content, category, creator_id) VALUES (?, ?, ?, ?)',
        [title, content, category, creator_id]
      );
      res.status(201).json({ 
        id: result.insertId, 
        title, 
        content, 
        category, 
        creator_id 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating document', error: error.message });
    }
  },

  // 更新文档
  async updateDocument(req, res) {
    try {
      const { title, content, category } = req.body;
      await db.query(
        'UPDATE documents SET title = ?, content = ?, category = ? WHERE id = ?',
        [title, content, category, req.params.id]
      );
      res.json({ message: 'Document updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating document', error: error.message });
    }
  },

  // 删除文档
  async deleteDocument(req, res) {
    try {
      await db.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
  }
};

module.exports = documentController; 