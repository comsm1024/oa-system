const db = require('../config/database');
const response = require('../utils/response');

const processDefinitionController = {
  // 获取流程列表
  async getProcessList(req, res) {
    try {
      const { page = 1, pageSize = 10, status, search } = req.query;
      const offset = (page - 1) * pageSize;
      
      let query = `
        SELECT p.*, u.username as created_by
        FROM process_definitions p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // 获取总数
      const [countResult] = await db.query(
        query.replace('SELECT p.*, u.username as created_by', 'SELECT COUNT(*) as total'),
        params
      );
      const total = countResult[0].total;

      // 获取分页数据
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      const [processes] = await db.query(query, params);

      res.json(response.success({
        list: processes,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }));
    } catch (error) {
      console.error('获取流程列表失败:', error);
      res.status(500).json(response.serverError('获取流程列表失败'));
    }
  },

  // 获取流程详情
  async getProcessDetail(req, res) {
    try {
      const [process] = await db.query(`
        SELECT p.*, u.username as created_by
        FROM process_definitions p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ?
      `, [req.params.id]);

      if (process.length === 0) {
        return res.status(404).json(response.notFound('流程不存在'));
      }

      // 获取流程步骤
      const [steps] = await db.query(`
        SELECT * FROM process_steps
        WHERE process_id = ?
        ORDER BY order_num
      `, [req.params.id]);
      
      const result = {
        ...process[0],
        steps
      };

      res.json(response.success(result));
    } catch (error) {
      console.error('获取流程详情失败:', error);
      res.status(500).json(response.serverError('获取流程详情失败'));
    }
  },

  // 创建流程
  async createProcess(req, res) {
    try {
      if (!req.body) {
        return res.status(400).json(response.badRequest('请求体不能为空'));
      }

      const { name, description, steps } = req.body;
      
      if (!name) {
        return res.status(400).json(response.badRequest('流程名称不能为空'));
      }

      if (!description) {
        return res.status(400).json(response.badRequest('流程描述不能为空'));
      }

      if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json(response.badRequest('流程步骤不能为空'));
      }

      const created_by = req.user.id;

      // 开始事务
      await db.query('START TRANSACTION');

      try {
        // 创建流程定义
        const [result] = await db.query(
          'INSERT INTO process_definitions (name, description, created_by) VALUES (?, ?, ?)',
          [name, description, created_by]
        );

        const processId = result.insertId;

        // 创建流程步骤
        for (const step of steps) {
          await db.query(
            'INSERT INTO process_steps (process_id, name, description, order_num, assignee_role, deadline, required_fields) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              processId,
              step.name,
              step.description,
              step.order,
              step.assignee_role,
              step.deadline,
              JSON.stringify(step.required_fields)
            ]
          );
        }

        // 提交事务
        await db.query('COMMIT');

        res.json(response.success(null, '流程创建成功'));
      } catch (error) {
        // 回滚事务
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('创建流程失败:', error);
      res.status(500).json(response.serverError('创建流程失败'));
    }
  },

  // 更新流程
  async updateProcess(req, res) {
    try {
      const { name, description, steps } = req.body;
      const processId = req.params.id;

      if (!name) {
        return res.status(400).json(response.badRequest('流程名称不能为空'));
      }

      if (!description) {
        return res.status(400).json(response.badRequest('流程描述不能为空'));
      }

      if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json(response.badRequest('流程步骤不能为空'));
      }

      // 开始事务
      await db.query('START TRANSACTION');

      try {
        // 更新流程定义
        await db.query(
          'UPDATE process_definitions SET name = ?, description = ? WHERE id = ?',
          [name, description, processId]
        );

        // 删除旧的步骤
        await db.query('DELETE FROM process_steps WHERE process_id = ?', [processId]);

        // 创建新的步骤
        for (const step of steps) {
          await db.query(
            'INSERT INTO process_steps (process_id, name, description, order_num, assignee_role, deadline, required_fields) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              processId,
              step.name,
              step.description,
              step.order,
              step.assignee_role,
              step.deadline,
              JSON.stringify(step.required_fields)
            ]
          );
        }

        // 提交事务
        await db.query('COMMIT');

        res.json(response.success(null, '流程更新成功'));
      } catch (error) {
        // 回滚事务
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('更新流程失败:', error);
      res.status(500).json(response.serverError('更新流程失败'));
    }
  },

  // 删除流程
  async deleteProcess(req, res) {
    try {
      const processId = req.params.id;

      // 开始事务
      await db.query('START TRANSACTION');

      try {
        // 删除流程步骤
        await db.query('DELETE FROM process_steps WHERE process_id = ?', [processId]);
        
        // 删除流程定义
        await db.query('DELETE FROM process_definitions WHERE id = ?', [processId]);

        // 提交事务
        await db.query('COMMIT');

        res.json(response.success(null, '流程删除成功'));
      } catch (error) {
        // 回滚事务
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('删除流程失败:', error);
      res.status(500).json(response.serverError('删除流程失败'));
    }
  },

  // 激活流程
  async activateProcess(req, res) {
    try {
      const processId = req.params.id;
      
      await db.query(
        'UPDATE process_definitions SET status = "active" WHERE id = ?',
        [processId]
      );

      res.json(response.success(null, '流程激活成功'));
    } catch (error) {
      console.error('激活流程失败:', error);
      res.status(500).json(response.serverError('激活流程失败'));
    }
  },

  // 停用流程
  async deactivateProcess(req, res) {
    try {
      const processId = req.params.id;
      
      await db.query(
        'UPDATE process_definitions SET status = "inactive" WHERE id = ?',
        [processId]
      );

      res.json(response.success(null, '流程停用成功'));
    } catch (error) {
      console.error('停用流程失败:', error);
      res.status(500).json(response.serverError('停用流程失败'));
    }
  },

  // 归档流程
  async archiveProcess(req, res) {
    try {
      const processId = req.params.id;
      
      await db.query(
        'UPDATE process_definitions SET status = "archived" WHERE id = ?',
        [processId]
      );

      res.json(response.success(null, '流程归档成功'));
    } catch (error) {
      console.error('归档流程失败:', error);
      res.status(500).json(response.serverError('归档流程失败'));
    }
  }
};

module.exports = processDefinitionController; 