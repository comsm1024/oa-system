const db = require('../config/database');
const response = require('../utils/response');

const departmentController = {

  async createDepartment() {
    
  },

  async getDepartments(req, res) {
    try {
      const { page = 1, pageSize = 10, search } = req.query;
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM department';

      const params = [];

      if (search) {
        query += ' AND (name LIKE ? OR code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // 获取总数
      const [countResult] = await db.query(
        query.replace('SELECT * FROM department', 'SELECT COUNT(*) as total'),
        params
      );
      const total = countResult[0].total;

      // 获取分页数据
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      const [departments] = await db.query(query, params);

      return res.json(response.success({
        list: departments,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }));
    } catch (error) {
      console.error('获取部门列表失败:', error);
      return res.status(500).json(response.error(error, '获取部门列表失败'));
    }
  },

  async getDepartmentById() {
    
  },

  async updateDepartment() {

  },

  async deleteDepartment() {

  }
}

module.exports = departmentController