const express = require('express');
const router = express.Router();
const dailyController = require('../controllers/dailyController');

// 日常管理路由
router.get('/tasks', dailyController.getTasks);
router.get('/tasks/:id', dailyController.getTaskById);
router.post('/tasks', dailyController.createTask);
router.put('/tasks/:id', dailyController.updateTask);
router.put('/tasks/:id/status', dailyController.updateTaskStatus);
router.delete('/tasks/:id', dailyController.deleteTask);

module.exports = router; 