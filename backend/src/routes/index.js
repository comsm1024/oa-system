const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const documentRoutes = require('./documentRoutes');
const communicationRoutes = require('./communicationRoutes');
const reportRoutes = require('./reportRoutes');
const processRoutes = require('./processRoutes');
const dailyRoutes = require('./dailyRoutes');
const authRoutes = require('./authRoutes');

// 测试路由
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 认证路由
router.use('/auth', authRoutes);

// 用户路由
router.use('/', userRoutes);

// 文档路由
router.use('/', documentRoutes);

// 沟通路由
router.use('/', communicationRoutes);

// 报表路由
router.use('/', reportRoutes);

// 流程路由
router.use('/', processRoutes);

// 日常管理路由
router.use('/', dailyRoutes);

module.exports = router;