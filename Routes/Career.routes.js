const express = require('express');
const CareerController = require('../Controllers/Career.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/getCareer', authMiddleware.authenticateTeacher, CareerController.getCareer);


module.exports = router;