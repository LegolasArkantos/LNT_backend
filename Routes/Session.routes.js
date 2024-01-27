const express = require('express');
const sessionController = require('../Controllers/Session.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.post('/create',authMiddleware.authenticateTeacher, sessionController.createSession);

router.get('/availableSessions', authMiddleware.authenticateUser, sessionController.getAvailableSessions);

router.post('/joinSession/:sessionId',  authMiddleware.authenticateUser,sessionController.joinSession);

router.put('/updateSession/:sessionId', authMiddleware.authenticateTeacher, sessionController.updateSession);

router.get('/session/:sessionId', authMiddleware.authenticateUser, sessionController.getSpecificSession);


module.exports = router;