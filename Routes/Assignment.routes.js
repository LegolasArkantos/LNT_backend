const express = require('express');
const assignmentController = require('../Controllers/Assignment.controller');
const authMiddleware = require('../Middleware/Auth.middleware')

const router = express.Router();

router.delete('/delete/:assignmentId',authMiddleware.authenticateTeacher, assignmentController.deleteAssignment);

router.get('/getSessionAssignments/:sessionId', authMiddleware.authenticateUser, assignmentController.getSessionAssignments);

router.post('/grade/:submissionId',  authMiddleware.authenticateTeacher,assignmentController.gradeAssignment);

router.get('/submit/:assignmentId', authMiddleware.authenticateStudent, assignmentController.submitSubmission);

router.post('/create',authMiddleware.authenticateTeacher,  assignmentController.createAssignment);

router.put('/update/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.updateAssignment);

module.exports = router;