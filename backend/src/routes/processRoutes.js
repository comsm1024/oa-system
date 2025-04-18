const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const processDefinitionController = require('../controllers/processDefinitionController');
const processInstanceController = require('../controllers/processInstanceController');

// 流程管理路由
router.get('/processes', processController.getProcesses);
router.get('/processes/:id', processController.getProcessById);
router.post('/processes', processController.createProcess);
router.put('/processes/:id', processController.updateProcess);
router.put('/processes/:id/status', processController.updateProcessStatus);
router.delete('/processes/:id', processController.deleteProcess);

// 流程定义路由
router.get('/process/list', processDefinitionController.getProcessList);
router.get('/process/:id', processDefinitionController.getProcessDetail);
router.post('/process/create', processDefinitionController.createProcess);
router.put('/process/:id', processDefinitionController.updateProcess);
router.delete('/process/:id', processDefinitionController.deleteProcess);
router.put('/process/:id/activate', processDefinitionController.activateProcess);
router.put('/process/:id/deactivate', processDefinitionController.deactivateProcess);
router.put('/process/:id/archive', processDefinitionController.archiveProcess);

// 流程实例路由
router.get('/process-instance/list', processInstanceController.getProcessInstanceList);
router.get('/process-instance/:id', processInstanceController.getProcessInstanceDetail);
router.post('/process-instance/create', processInstanceController.createProcessInstance);
router.put('/process-instance/:id/approve', processInstanceController.approveProcessInstance);
router.put('/process-instance/:id/reject', processInstanceController.rejectProcessInstance);
router.put('/process-instance/:id/return', processInstanceController.returnProcessInstance);
router.get('/process-instance/my-pending', processInstanceController.getMyPendingProcesses);
router.get('/process-instance/my-initiated', processInstanceController.getMyInitiatedProcesses);

module.exports = router; 