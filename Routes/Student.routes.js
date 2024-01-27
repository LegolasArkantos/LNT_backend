const express = require('express');
const studentController = require('../Controllers/Student.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();



// router.get('/getMySessions/:studentId', authMiddleware.verifyToken, studentController.getMySessions);

router.get('/profile/get', authMiddleware.authenticateStudent, studentController.getProfile);

router.get('/getStudent/:studentId', authMiddleware.authenticateStudent, studentController.getStudent);

router.get('/getAllStudents', authMiddleware.authenticateStudent, studentController.getAllStudents);

router.patch('/updateProfile', authMiddleware.authenticateStudent, studentController.updateProfile);

router.get('/getMyTeachers', authMiddleware.authenticateStudent, studentController.getMyTeachers);

router.get('/getSubjectTeachers', authMiddleware.authenticateStudent, studentController.getSubjectTeachers);

// router.get('/getAllTeachers', authMiddleware.verifyToken, studentController.getAllTeachers);
module.exports = router;