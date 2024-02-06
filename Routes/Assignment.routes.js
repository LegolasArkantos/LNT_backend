const express = require('express');
const assignmentController = require('../Controllers/Assignment.controller');
const authMiddleware = require('../Middleware/Auth.middleware')

const router = express.Router();

router.delete('/delete/:assignmentId',authMiddleware.authenticateTeacher, assignmentController.deleteAssignment);

router.get('/getSessionAssignments/:sessionId', authMiddleware.authenticateUser, assignmentController.getSessionAssignments);

router.post('/grade/:submissionId',  authMiddleware.authenticateTeacher,assignmentController.gradeAssignment);

router.get('/submit/:assignmentId', authMiddleware.authenticateStudent, sessionController.getSpecificSession);

module.exports = router;