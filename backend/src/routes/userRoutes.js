const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const department = require('../controllers/departmentController');

// 用户管理路由
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', authMiddleware, userController.createUser);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

// 部门管理路由
router.get('/departments', department.getDepartments);
router.get('/departments/:id', department.getDepartmentById);
router.post('/departments', authMiddleware, department.createDepartment);
router.put('/departments/:id', authMiddleware, department.updateDepartment);
router.delete('/departments/:id', authMiddleware, department.deleteDepartment);

module.exports = router;