const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/Review.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

router.post('/addReview/:teacherId/:sessionId', authMiddleware.authenticateStudent, reviewController.addReview);
router.get('/getTeacherReviews/:teacherId', authMiddleware.authenticateUser, reviewController.getTeacherReviews);
router.get('/getTeacherReviewsbySession/:teacherId/:sessionName', authMiddleware.authenticateUser, reviewController.getTeacherReviewsBySession);

module.exports = router; 