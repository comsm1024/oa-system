const db = require('../config/database')
const reponse = require('../utils/response')

const leaveController = {
    // 获取请假列表
    async getLeaveList(req, res) {
        try {
            const { page = 1, pageSize = 10, status, search } = req.query;
            const offset = (page - 1) * pageSize;
            
            let query = `
                SELECT l.*, u.username as user_name
                FROM leave_application l
                LEFT JOIN users u ON l.user_id = u.id
                WHERE 1=1
            `
            const params = [];

            if (status) {
                query += 'AND l.status =?';
                params.push(status);
            }

            if (search) {
                query += ' AND (l.reason LIKE ? OR l.start_time LIKE ? OR l.end_time LIKE ?)';
            }
            // 获取总数
            const [countResult] = await db.query(
                query.replace('SELECT l.*, u.username as user_name', 'SELECT COUNT(*) as total'),
                params
            );
            console.log(countResult)
            const total = countResult[0].total;

            // 获取分页数据
            query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(pageSize), offset);

            const [leaves] = await db.query(query, params);

            res.json(reponse.success({
                list: leaves,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }));
        }
        catch (error) {
            console.error('获取请假列表失败:', error);
            res.status(500).json(reponse.serverError('获取请假列表失败'));
        }
    },

    // 获取请假详情
    async getLeaveDetail(req, res) {
        try {
            const leave_id = req.params.id;
            const [leave] = await db.query(
                'SELECT l.*, u.username as user_name FROM leave_application l LEFT JOIN users u ON l.user_id = u.id WHERE l.id =?',
                [leave_id]
            );
            if (!leave) {
                return res.status(404).json(reponse.notFound('请假申请不存在'));
            }
            res.json(reponse.success(leave));
        } catch (error) {
            console.error('获取请假详情失败:', error);
            res.status(500).json(reponse.serverError('获取请假详情失败'));
        }
    },
    
    // 创建请假申请 (用户提交)
    async createLeave(req, res) {
        try {
            const { reason, start_time, end_time } = req.body;
            const user_id = req.user.id;

            // 检查用户是否有足够的可用假期
            const [user] = await db.query('SELECT * FROM users WHERE id =?', [user_id]);
            if (!user) {
                return res.status(404).json(reponse.notFound('用户不存在'));
            }

            if (user.available_leave < 1) {
                return res.status(400).json(reponse.badRequest('可用假期不足'));
            }

            // 开始事务
            await db.query('START TRANSACTION');

            try {
                // 插入请假申请
                const [result] = await db.query(
                    'INSERT INTO leave_application (user_id, user_name, reason, start_time, end_time, status, process_key) VALUES (?,?,?,?,?,?,UUID())',
                    [user_id, user[0].username, reason, start_time, end_time, 'pending']
                );

                const leave_id = result.insertId;

                // 更新用户可用假期
                await db.query(
                    'UPDATE users SET available_leave = available_leave - 1 WHERE id =?',
                    [user_id]
                )
                // 提交事务
                await db.query('COMMIT');

                res.json(reponse.success(null, '请假申请提交成功'));
            } catch (error) {
                // 回滚事务
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('提交请假申请失败:', error);
            res.status(500).json(reponse.serverError('提交请假申请失败'));
        }
    }
}

module.exports = leaveController; 