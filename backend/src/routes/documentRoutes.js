const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// 文档管理路由
router.get('/documents', documentController.getDocuments);
router.get('/documents/:id', documentController.getDocumentById);
router.post('/documents', documentController.createDocument);
router.put('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

module.exports = router; 