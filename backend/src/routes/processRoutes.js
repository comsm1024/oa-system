const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');

// 流程管理路由
router.get('/processes', processController.getProcesses);
router.get('/processes/:id', processController.getProcessById);
router.post('/processes', processController.createProcess);
router.put('/processes/:id', processController.updateProcess);
router.put('/processes/:id/status', processController.updateProcessStatus);
router.delete('/processes/:id', processController.deleteProcess);

module.exports = router; 