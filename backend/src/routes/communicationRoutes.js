const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');

// 沟通管理路由
router.get('/messages', communicationController.getMessages);
router.get('/messages/:id', communicationController.getMessageById);
router.post('/messages', communicationController.sendMessage);
router.put('/messages/:id/status', communicationController.updateMessageStatus);
router.delete('/messages/:id', communicationController.deleteMessage);

module.exports = router; 