const express = require('express');
const assignmentController = require('../Controllers/Assignment.controller');
const authMiddleware = require('../Middleware/Auth.middleware')
const cors = require('cors');

const router = express.Router();

router.delete('/delete/:assignmentId',authMiddleware.authenticateTeacher, assignmentController.deleteAssignment);

router.get('/getSessionAssignments/:sessionId', authMiddleware.authenticateUser, assignmentController.getSessionAssignments);

router.post('/grade/:submissionId',  authMiddleware.authenticateTeacher,assignmentController.gradeAssignment);

router.post('/submit/:assignmentId', authMiddleware.authenticateStudent, assignmentController.submitSubmission);

router.post('/create/:sessionId',authMiddleware.authenticateTeacher,  assignmentController.createAssignment);

router.put('/update/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.updateAssignment);

router.get('/getAssignment/:assignmentId', authMiddleware.authenticateUser,  assignmentController.getAssignment);

router.post('/uploadFiles/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.uploadFile);

router.get('/getSubmission/:assignmentId', authMiddleware.authenticateStudent,  assignmentController.getSubmission);

router.get('/getSubmissions/:assignmentId', authMiddleware.authenticateTeacher,  assignmentController.getSubmissions);



module.exports = router;