const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const departmentController = require('../controllers/departmentController');

// 创建部门
router.post('/', authMiddleware, departmentController.createDepartment);

// 获取部门列表
router.get('/', departmentController.getDepartments);

// 获取单个部门
router.get('/:id', departmentController.getDepartmentById);

// 更新部门
router.put('/:id', authMiddleware, departmentController.updateDepartment);

// 删除部门
router.delete('/:id', authMiddleware, departmentController.deleteDepartment);

module.exports = router; 