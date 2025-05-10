const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/leave/list', leaveController.getLeaveList);
router.post('/leave/create', authMiddleware, leaveController.createLeave);


module.exports = router; 