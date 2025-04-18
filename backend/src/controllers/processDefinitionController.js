const db = require('../config/database');

const processDefinitionController = {
  // 获取流程列表
  async getProcessList(req, res) {
    try {
      const { page = 1, pageSize = 10, status, search } = req.query;
      const offset = (page - 1) * pageSize;
      
      let query = `
        SELECT p.*, u.username as createdBy
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
        query.replace('SELECT p.*, u.username as createdBy', 'SELECT COUNT(*) as total'),
        params
      );
      const total = countResult[0].total;

      // 获取分页数据
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      const [processes] = await db.query(query, params);

      res.json({
        list: processes,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching processes', error: error.message });
    }
  },

  // 获取流程详情
  async getProcessDetail(req, res) {
    try {
      const [process] = await db.query(`
        SELECT p.*, u.username as createdBy
        FROM process_definitions p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ?
      `, [req.params.id]);

      if (process.length === 0) {
        return res.status(404).json({ message: 'Process not found' });
      }

      // 获取流程步骤
      const [steps] = await db.query(`
        SELECT * FROM process_steps
        WHERE process_id = ?
        ORDER BY order_num
      `, [req.params.id]);

      const result = {
        ...process[0],
        steps: steps.map(step => ({
          ...step,
          requiredFields: JSON.parse(step.required_fields)
        }))
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching process detail', error: error.message });
    }
  },

  // 创建流程
  async createProcess(req, res) {
    try {
      const { name, description, steps } = req.body;
      const created_by = req.user.id; // 假设通过认证中间件设置了req.user

      // 开始事务
      await db.query('START TRANSACTION');

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
            step.assigneeRole,
            step.deadline,
            JSON.stringify(step.requiredFields)
          ]
        );
      }

      await db.query('COMMIT');

      res.status(201).json({
        id: processId,
        name,
        description,
        steps
      });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error creating process', error: error.message });
    }
  },

  // 更新流程
  async updateProcess(req, res) {
    try {
      const { name, description, steps, status } = req.body;
      const processId = req.params.id;

      await db.query('START TRANSACTION');

      // 更新流程定义
      await db.query(
        'UPDATE process_definitions SET name = ?, description = ?, status = ? WHERE id = ?',
        [name, description, status, processId]
      );

      if (steps) {
        // 删除现有步骤
        await db.query('DELETE FROM process_steps WHERE process_id = ?', [processId]);

        // 创建新步骤
        for (const step of steps) {
          await db.query(
            'INSERT INTO process_steps (process_id, name, description, order_num, assignee_role, deadline, required_fields) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              processId,
              step.name,
              step.description,
              step.order,
              step.assigneeRole,
              step.deadline,
              JSON.stringify(step.requiredFields)
            ]
          );
        }
      }

      await db.query('COMMIT');
      res.json({ message: 'Process updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error updating process', error: error.message });
    }
  },

  // 删除流程
  async deleteProcess(req, res) {
    try {
      await db.query('START TRANSACTION');

      // 删除流程步骤
      await db.query('DELETE FROM process_steps WHERE process_id = ?', [req.params.id]);
      
      // 删除流程定义
      await db.query('DELETE FROM process_definitions WHERE id = ?', [req.params.id]);

      await db.query('COMMIT');
      res.json({ message: 'Process deleted successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error deleting process', error: error.message });
    }
  },

  // 激活流程
  async activateProcess(req, res) {
    try {
      await db.query(
        'UPDATE process_definitions SET status = ? WHERE id = ?',
        ['active', req.params.id]
      );
      res.json({ message: 'Process activated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error activating process', error: error.message });
    }
  },

  // 停用流程
  async deactivateProcess(req, res) {
    try {
      await db.query(
        'UPDATE process_definitions SET status = ? WHERE id = ?',
        ['inactive', req.params.id]
      );
      res.json({ message: 'Process deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating process', error: error.message });
    }
  },

  // 归档流程
  async archiveProcess(req, res) {
    try {
      await db.query(
        'UPDATE process_definitions SET status = ? WHERE id = ?',
        ['archived', req.params.id]
      );
      res.json({ message: 'Process archived successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error archiving process', error: error.message });
    }
  }
};

module.exports = processDefinitionController; 