const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// 登录路由
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/current-user', authMiddleware, authController.getCurrentUser);

module.exports = router; 