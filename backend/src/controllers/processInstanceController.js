const db = require('../config/database');

const processInstanceController = {
  // 获取流程实例列表
  async getProcessInstanceList(req, res) {
    try {
      const { page = 1, pageSize = 10, status, processId, search } = req.query;
      const offset = (page - 1) * pageSize;
      
      let query = `
        SELECT pi.*, pd.name as processName, u.username as createdBy
        FROM process_instances pi
        LEFT JOIN process_definitions pd ON pi.process_id = pd.id
        LEFT JOIN users u ON pi.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND pi.status = ?';
        params.push(status);
      }

      if (processId) {
        query += ' AND pi.process_id = ?';
        params.push(processId);
      }

      if (search) {
        query += ' AND (pd.name LIKE ? OR pi.data LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // 获取总数
      const [countResult] = await db.query(
        query.replace('SELECT pi.*, pd.name as processName, u.username as createdBy', 'SELECT COUNT(*) as total'),
        params
      );
      const total = countResult[0].total;

      // 获取分页数据
      query += ' ORDER BY pi.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      const [instances] = await db.query(query, params);

      res.json({
        list: instances.map(instance => ({
          ...instance,
          data: JSON.parse(instance.data)
        })),
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching process instances', error: error.message });
    }
  },

  // 获取流程实例详情
  async getProcessInstanceDetail(req, res) {
    try {
      const [instance] = await db.query(`
        SELECT pi.*, pd.name as processName, u.username as createdBy
        FROM process_instances pi
        LEFT JOIN process_definitions pd ON pi.process_id = pd.id
        LEFT JOIN users u ON pi.created_by = u.id
        WHERE pi.id = ?
      `, [req.params.id]);

      if (instance.length === 0) {
        return res.status(404).json({ message: 'Process instance not found' });
      }

      // 获取流程历史记录
      const [history] = await db.query(`
        SELECT ph.*, u.username as operator, ps.name as stepName
        FROM process_history ph
        LEFT JOIN users u ON ph.operator_id = u.id
        LEFT JOIN process_steps ps ON ph.step_id = ps.id
        WHERE ph.instance_id = ?
        ORDER BY ph.created_at DESC
      `, [req.params.id]);

      const result = {
        ...instance[0],
        data: JSON.parse(instance[0].data),
        history
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching process instance detail', error: error.message });
    }
  },

  // 创建流程实例
  async createProcessInstance(req, res) {
    try {
      const { processId, data } = req.body;
      const created_by = req.user.id; // 假设通过认证中间件设置了req.user

      // 获取流程的第一个步骤
      const [steps] = await db.query(
        'SELECT id FROM process_steps WHERE process_id = ? ORDER BY order_num LIMIT 1',
        [processId]
      );

      if (steps.length === 0) {
        return res.status(400).json({ message: 'Process has no steps' });
      }

      const [result] = await db.query(
        'INSERT INTO process_instances (process_id, current_step, created_by, data) VALUES (?, ?, ?, ?)',
        [processId, steps[0].id, created_by, JSON.stringify(data)]
      );

      res.status(201).json({
        id: result.insertId,
        processId,
        currentStep: steps[0].id,
        data
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating process instance', error: error.message });
    }
  },

  // 审批流程实例
  async approveProcessInstance(req, res) {
    try {
      const { comment } = req.body;
      const instanceId = req.params.id;
      const operator_id = req.user.id;

      await db.query('START TRANSACTION');

      // 获取当前实例信息
      const [instance] = await db.query(
        'SELECT * FROM process_instances WHERE id = ?',
        [instanceId]
      );

      if (instance.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Process instance not found' });
      }

      // 获取当前步骤信息
      const [currentStep] = await db.query(
        'SELECT * FROM process_steps WHERE id = ?',
        [instance[0].current_step]
      );

      // 获取下一个步骤
      const [nextStep] = await db.query(
        'SELECT id FROM process_steps WHERE process_id = ? AND order_num > ? ORDER BY order_num LIMIT 1',
        [instance[0].process_id, currentStep[0].order_num]
      );

      // 记录历史
      await db.query(
        'INSERT INTO process_history (instance_id, step_id, action, comment, operator_id) VALUES (?, ?, ?, ?, ?)',
        [instanceId, currentStep[0].id, 'approve', comment, operator_id]
      );

      // 更新实例状态
      if (nextStep.length === 0) {
        // 如果没有下一步，则完成流程
        await db.query(
          'UPDATE process_instances SET status = ? WHERE id = ?',
          ['completed', instanceId]
        );
      } else {
        // 更新到下一步
        await db.query(
          'UPDATE process_instances SET current_step = ?, status = ? WHERE id = ?',
          [nextStep[0].id, 'in_progress', instanceId]
        );
      }

      await db.query('COMMIT');
      res.json({ message: 'Process instance approved successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error approving process instance', error: error.message });
    }
  },

  // 拒绝流程实例
  async rejectProcessInstance(req, res) {
    try {
      const { comment } = req.body;
      const instanceId = req.params.id;
      const operator_id = req.user.id;

      await db.query('START TRANSACTION');

      // 获取当前实例信息
      const [instance] = await db.query(
        'SELECT * FROM process_instances WHERE id = ?',
        [instanceId]
      );

      if (instance.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Process instance not found' });
      }

      // 记录历史
      await db.query(
        'INSERT INTO process_history (instance_id, step_id, action, comment, operator_id) VALUES (?, ?, ?, ?, ?)',
        [instanceId, instance[0].current_step, 'reject', comment, operator_id]
      );

      // 更新实例状态
      await db.query(
        'UPDATE process_instances SET status = ? WHERE id = ?',
        ['rejected', instanceId]
      );

      await db.query('COMMIT');
      res.json({ message: 'Process instance rejected successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error rejecting process instance', error: error.message });
    }
  },

  // 退回流程实例
  async returnProcessInstance(req, res) {
    try {
      const { stepId, comment } = req.body;
      const instanceId = req.params.id;
      const operator_id = req.user.id;

      await db.query('START TRANSACTION');

      // 获取当前实例信息
      const [instance] = await db.query(
        'SELECT * FROM process_instances WHERE id = ?',
        [instanceId]
      );

      if (instance.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Process instance not found' });
      }

      // 记录历史
      await db.query(
        'INSERT INTO process_history (instance_id, step_id, action, comment, operator_id) VALUES (?, ?, ?, ?, ?)',
        [instanceId, instance[0].current_step, 'return', comment, operator_id]
      );

      // 更新实例状态
      await db.query(
        'UPDATE process_instances SET current_step = ?, status = ? WHERE id = ?',
        [stepId, 'in_progress', instanceId]
      );

      await db.query('COMMIT');
      res.json({ message: 'Process instance returned successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      res.status(500).json({ message: 'Error returning process instance', error: error.message });
    }
  },

  // 获取我的待办流程
  async getMyPendingProcesses(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;
      const user_id = req.user.id;

      // 获取用户角色
      const [user] = await db.query(
        'SELECT role FROM users WHERE id = ?',
        [user_id]
      );

      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 获取待办流程
      const query = `
        SELECT pi.*, pd.name as processName, u.username as createdBy
        FROM process_instances pi
        LEFT JOIN process_definitions pd ON pi.process_id = pd.id
        LEFT JOIN users u ON pi.created_by = u.id
        LEFT JOIN process_steps ps ON pi.current_step = ps.id
        WHERE pi.status = 'in_progress'
        AND ps.assignee_role = ?
        ORDER BY pi.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [instances] = await db.query(query, [user[0].role, parseInt(pageSize), offset]);

      // 获取总数
      const [countResult] = await db.query(
        query.replace('SELECT pi.*, pd.name as processName, u.username as createdBy', 'SELECT COUNT(*) as total')
          .replace('ORDER BY pi.created_at DESC LIMIT ? OFFSET ?', ''),
        [user[0].role]
      );

      res.json({
        list: instances.map(instance => ({
          ...instance,
          data: JSON.parse(instance.data)
        })),
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pending processes', error: error.message });
    }
  },

  // 获取我发起的流程
  async getMyInitiatedProcesses(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;
      const user_id = req.user.id;

      const query = `
        SELECT pi.*, pd.name as processName, u.username as createdBy
        FROM process_instances pi
        LEFT JOIN process_definitions pd ON pi.process_id = pd.id
        LEFT JOIN users u ON pi.created_by = u.id
        WHERE pi.created_by = ?
        ORDER BY pi.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [instances] = await db.query(query, [user_id, parseInt(pageSize), offset]);

      // 获取总数
      const [countResult] = await db.query(
        query.replace('SELECT pi.*, pd.name as processName, u.username as createdBy', 'SELECT COUNT(*) as total')
          .replace('ORDER BY pi.created_at DESC LIMIT ? OFFSET ?', ''),
        [user_id]
      );

      res.json({
        list: instances.map(instance => ({
          ...instance,
          data: JSON.parse(instance.data)
        })),
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching initiated processes', error: error.message });
    }
  }
};

module.exports = processInstanceController; 