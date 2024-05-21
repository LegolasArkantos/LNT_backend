const express = require('express');
const sessionHistory = require('../Controllers/sessionHistory.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/completedSessions', authMiddleware.authenticateTeacher, sessionHistory.DisplayTeacherSessionsCompleted);


module.exports = router;