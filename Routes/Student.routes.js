const express = require('express');
const studentController = require('../Controllers/Student.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();


router.get('/profile/get', authMiddleware.authenticateStudent, studentController.getProfile);

router.get('/getStudent/:studentId', authMiddleware.authenticateStudent, studentController.getStudent);

router.get('/getTeacher/:teacherId', authMiddleware.authenticateStudent, studentController.getTeacher);

router.get('/getAllStudents', authMiddleware.authenticateStudent, studentController.getAllStudents);

router.patch('/updateProfile', authMiddleware.authenticateStudent, studentController.updateProfile);

router.get('/getMyTeachers', authMiddleware.authenticateStudent, studentController.getMyTeachers);

router.get('/getSubjectTeachers', authMiddleware.authenticateStudent, studentController.getSubjectTeachers);

router.get('/top-rated-teachers', authMiddleware.authenticateStudent, studentController.getTopRatedTeachers);

router.get('/my-sessions', authMiddleware.authenticateStudent, studentController.getMySessions);

router.get('/teachers', authMiddleware.authenticateStudent, studentController.getAllTeachers);


module.exports = router;