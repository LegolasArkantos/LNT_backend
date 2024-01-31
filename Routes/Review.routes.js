const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/Review.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

router.post('/addReview', authMiddleware.authenticateStudent, reviewController.addReview);
router.get('/getTeacherReviews/:teacherId', authMiddleware.authenticateUser, reviewController.getTeacherReviews);
router.put('/update/:reviewId', authMiddleware.authenticateStudent, reviewController.updateReview);
router.delete('/delete/:reviewId', authMiddleware.authenticateStudent, reviewController.deleteReview);

module.exports = router;