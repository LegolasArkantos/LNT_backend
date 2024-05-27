const express = require('express');
const CareerController = require('../Controllers/Career.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/getCareer', authMiddleware.authenticateTeacher, CareerController.getCareer);
router.post('/createCareer', authMiddleware.authenticateTeacher, CareerController.createProfile);
router.get('/getCareerProfile', authMiddleware.authenticateTeacher, CareerController.getProfile);
router.get('/getCareerTeachers', authMiddleware.authenticateStudent, CareerController.getCareerTeachers);
router.post('/addCareerTeacher', authMiddleware.authenticateStudent, CareerController.addCareerTeacher);
router.get('/getStudentCareerTeachers', authMiddleware.authenticateStudent, CareerController.getStudentCareerTeachers);
router.get('/getCareerTeacherStudents/:careerTeacherId', authMiddleware.authenticateTeacher, CareerController.getCareerTeacherStudents);
router.post('/launch-counselling/:careerId', authMiddleware.authenticateTeacher, CareerController.launchCounselling);
router.post('/end-counselling/:careerId', authMiddleware.authenticateTeacher, CareerController.endCounselling);






module.exports = router;