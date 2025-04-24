const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const processDefinitionController = require('../controllers/processDefinitionController');
const processInstanceController = require('../controllers/processInstanceController');
const authMiddleware = require('../middleware/authMiddleware');

// 流程管理路由
router.get('/processes', processController.getProcesses);
router.get('/processes/:id', processController.getProcessById);
router.post('/processes', authMiddleware, processController.createProcess);
router.put('/processes/:id', authMiddleware, processController.updateProcess);
router.put('/processes/:id/status', authMiddleware, processController.updateProcessStatus);
router.delete('/processes/:id', authMiddleware, processController.deleteProcess);

// 流程定义路由
router.get('/process/list', processDefinitionController.getProcessList);
router.get('/process/:id', processDefinitionController.getProcessDetail);
router.post('/process/create', authMiddleware, processDefinitionController.createProcess);
router.put('/process/:id', authMiddleware, processDefinitionController.updateProcess);
router.delete('/process/:id', authMiddleware, processDefinitionController.deleteProcess);
router.put('/process/:id/activate', authMiddleware, processDefinitionController.activateProcess);
router.put('/process/:id/deactivate', authMiddleware, processDefinitionController.deactivateProcess);
router.put('/process/:id/archive', authMiddleware, processDefinitionController.archiveProcess);

// 流程实例路由
router.get('/process-instance/list', processInstanceController.getProcessInstanceList);
router.get('/process-instance/:id', processInstanceController.getProcessInstanceDetail);
router.post('/process-instance/create', authMiddleware, processInstanceController.createProcessInstance);
router.put('/process-instance/:id/approve', authMiddleware, processInstanceController.approveProcessInstance);
router.put('/process-instance/:id/reject', authMiddleware, processInstanceController.rejectProcessInstance);
router.put('/process-instance/:id/return', authMiddleware, processInstanceController.returnProcessInstance);
router.get('/process-instance/my-pending', authMiddleware, processInstanceController.getMyPendingProcesses);
router.get('/process-instance/my-initiated', authMiddleware, processInstanceController.getMyInitiatedProcesses);

module.exports = router; 