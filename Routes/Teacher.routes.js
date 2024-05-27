const express = require('express');
const teacherController = require('../Controllers/Teacher.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/profile/get', authMiddleware.authenticateTeacher, teacherController.getProfile);
router.get('/my-sessions', authMiddleware.authenticateTeacher, teacherController.getMySessions);
router.patch('/updateProfile', authMiddleware.authenticateTeacher, teacherController.updateProfile);
router.patch('/session', authMiddleware.authenticateTeacher, teacherController.getSpecificSession);
router.get('/getStudent/:studentId', authMiddleware.authenticateTeacher, teacherController.getStudent);
router.get('/getTeacher/:teacherId', authMiddleware.authenticateTeacher, teacherController.getTeacher);

module.exports = router;