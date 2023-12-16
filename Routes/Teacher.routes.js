const express = require('express');
const teacherController = require('../Controllers/Teacher.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/profile', authMiddleware.authenticateTeacher, teacherController.getProfile);
router.get('/myStudents', authMiddleware.authenticateTeacher, teacherController.getMyStudents);
router.patch('/updateProfile', authMiddleware.authenticateTeacher, teacherController.updateProfile);


module.exports = router;