const db = require('../config/database');
const response = require('../utils/response');

const departmentController = {

  async createDepartment(req, res) {
    try {
      const { name, code, parentId, description } = req.body;

      // 参数校验
      if (!name || !code) {
        return res.status(400).json(response.error('部门名称和编码不能为空'));
      }

      // 检查部门编码是否已存在
      const [existingDept] = await db.query(
        'SELECT id FROM department WHERE code = ?',
        [code]
      );

      if (existingDept.length > 0) {
        return res.status(400).json(response.error('部门编码已存在'));
      }

      // 如果有父部门ID,检查父部门是否存在
      if (parentId) {
        const [parentDept] = await db.query(
          'SELECT id FROM department WHERE id = ?',
          [parentId]
        );

        if (parentDept.length === 0) {
          return res.status(400).json(response.error('父部门不存在'));
        }
      }

      // 插入新部门
      const [result] = await db.query(
        'INSERT INTO department (name, code, parent_id, description) VALUES (?, ?, ?, ?)',
        [name, code, parentId || null, description]
      );

      // 获取新创建的部门信息
      const [newDepartment] = await db.query(
        'SELECT * FROM department WHERE id = ?',
        [result.insertId]
      );

      return res.status(201).json(response.success(newDepartment[0]));
    } catch (error) {
      console.error('创建部门失败:', error);
      return res.status(500).json(response.error(error, '创建部门失败'));
    }
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