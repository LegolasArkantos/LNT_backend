const express = require('express');
const sessionController = require('../Controllers/Session.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.post('/create',authMiddleware.authenticateTeacher, sessionController.createSession);

router.get('/availableSessions', authMiddleware.authenticateStudent, sessionController.getAvailableSessions);

router.post('/joinSession/:sessionId',  authMiddleware.authenticateStudent,sessionController.joinSession);

router.put('/updateSession/:sessionId', authMiddleware.authenticateTeacher, sessionController.updateSession);

router.get('/session/:sessionId', authMiddleware.authenticateUser, sessionController.getSpecificSession);

router.get('/search', authMiddleware.authenticateStudent, sessionController.searchSessionbyQuery);

router.post('/launch-session/:sessionId', authMiddleware.authenticateTeacher, sessionController.launchSession);

router.post('/end-session/:sessionId', authMiddleware.authenticateTeacher, sessionController.endSession);

router.patch('/session-completed/:sessionId', authMiddleware.authenticateTeacher, sessionController.sessionCompleted);

module.exports = router;