const express = require('express');
const sessionHistory = require('../Controllers/sessionHistory.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/completedSessions', authMiddleware.authenticateTeacher, sessionHistory.DisplayTeacherSessionsCompleted);
router.get('/completedSessionsStudent', authMiddleware.authenticateStudent, sessionHistory.DisplayStudentSessionsCompleted);


module.exports = router;