const express = require('express');
const CareerController = require('../Controllers/Career.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/getCareer', authMiddleware.authenticateTeacher, CareerController.getCareer);
router.post('/createCareer', authMiddleware.authenticateTeacher, CareerController.createProfile);
router.get('/getCareerProfile', authMiddleware.authenticateTeacher, CareerController.getProfile);




module.exports = router;