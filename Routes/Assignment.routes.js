const express = require('express');
const assignmentController = require('../Controllers/Assignment.controller');
const authMiddleware = require('../Middleware/Auth.middleware')
const cors = require('cors');

const router = express.Router();

router.delete('/delete/:assignmentId',authMiddleware.authenticateTeacher, assignmentController.deleteAssignment);

router.get('/getSessionAssignments/:sessionId', authMiddleware.authenticateUser, assignmentController.getSessionAssignments);

router.post('/grade/:submissionId',  authMiddleware.authenticateTeacher,assignmentController.gradeAssignment);

router.get('/submit/:assignmentId', authMiddleware.authenticateStudent, assignmentController.submitSubmission);

router.post('/create/:sessionId',authMiddleware.authenticateTeacher,  assignmentController.createAssignment);

router.put('/update/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.updateAssignment);

router.get('/getAssignment/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.getAssignment);

router.post('/uploadFiles/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.uploadFile);



module.exports = router;